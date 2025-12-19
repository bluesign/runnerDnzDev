import { RuntimeType } from '@services/config';
import { LayoutType } from '~/styles/modal';

// Mock use-minimal-state before importing index
jest.mock('use-minimal-state', () => ({
  on: jest.fn(),
}));

// Import after mocking
import { loadConfig, loadState, appState } from './index';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('loadState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should return null when no value is found', () => {
    expect(loadState('nonexistent')).toBeNull();
  });

  test('should return null when value is not valid JSON', () => {
    localStorage.setItem('invalid', 'not json{]');
    expect(loadState('invalid')).toBeNull();
  });

  test('should return parsed value for valid JSON', () => {
    const testData = { test: 'value' };
    localStorage.setItem('valid', JSON.stringify(testData));
    expect(loadState('valid')).toEqual(testData);
  });

  test('should return null for empty string', () => {
    localStorage.setItem('empty', '');
    expect(loadState('empty')).toBeNull();
  });
});

describe('loadConfig with validation', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset appState to defaults
    appState.UI = {
      shareCreated: false,
      snippetId: null,
      panel: {
        height: 300,
        width: 300,
        collapsed: false,
        layout: LayoutType.Vertical,
      },
    };
    appState.editor = {
      fileName: 'script.cdc',
      code: '',
      args: [],
      jsonArgs: [],
    };
    appState.monaco = {
      fontFamily: 'default',
      fontLigatures: false,
      cursorBlinking: 'blink',
      cursorStyle: 'line',
      selectOnLineNumbers: true,
      minimap: false,
      contextMenu: true,
      smoothScrolling: true,
      mouseWheelZoom: true,
    };
    appState.settings = {
      darkMode: false,
      useSystemTheme: false,
      autoFormat: false,
      runtime: RuntimeType.FlowTestnet,
    };
  });

  describe('UI state validation', () => {
    test('should load valid UI state', () => {
      const validUI = {
        shareCreated: true,
        snippetId: 'test-123',
        panel: {
          height: 400,
          width: 500,
          collapsed: true,
          layout: LayoutType.Horizontal,
        },
      };
      localStorage.setItem('UI', JSON.stringify(validUI));
      loadConfig();
      expect(appState.UI).toEqual(validUI);
    });

    test('should reject UI state with invalid panel height', () => {
      const invalidUI = {
        shareCreated: false,
        snippetId: null,
        panel: {
          height: 'invalid', // should be number
          width: 300,
          collapsed: false,
          layout: LayoutType.Vertical,
        },
      };
      localStorage.setItem('UI', JSON.stringify(invalidUI));
      loadConfig();
      // Should use default values
      expect(appState.UI.panel.height).toBe(300);
    });

    test('should reject UI state with invalid layout type', () => {
      const invalidUI = {
        shareCreated: false,
        snippetId: null,
        panel: {
          height: 300,
          width: 300,
          collapsed: false,
          layout: 'diagonal', // invalid layout
        },
      };
      localStorage.setItem('UI', JSON.stringify(invalidUI));
      loadConfig();
      expect(appState.UI.panel.layout).toBe(LayoutType.Vertical);
    });

    test('should reject UI state with negative dimensions', () => {
      const invalidUI = {
        shareCreated: false,
        snippetId: null,
        panel: {
          height: -100,
          width: 300,
          collapsed: false,
          layout: LayoutType.Vertical,
        },
      };
      localStorage.setItem('UI', JSON.stringify(invalidUI));
      loadConfig();
      expect(appState.UI.panel.height).toBe(300);
    });

    test('should reject UI state with non-boolean shareCreated', () => {
      const invalidUI = {
        shareCreated: 'true', // should be boolean
        snippetId: null,
        panel: {
          height: 300,
          width: 300,
          collapsed: false,
          layout: LayoutType.Vertical,
        },
      };
      localStorage.setItem('UI', JSON.stringify(invalidUI));
      loadConfig();
      expect(appState.UI.shareCreated).toBe(false);
    });
  });

  describe('Editor state validation', () => {
    test('should load valid editor state', () => {
      const validEditor = {
        fileName: 'test.cdc',
        code: 'pub fun main() {}',
        args: [1, 2, 3],
        jsonArgs: ['a', 'b'],
      };
      localStorage.setItem('editor', JSON.stringify(validEditor));
      loadConfig();
      expect(appState.editor).toEqual(validEditor);
    });

    test('should reject editor state with invalid fileName type', () => {
      const invalidEditor = {
        fileName: 123, // should be string
        code: '',
        args: [],
        jsonArgs: [],
      };
      localStorage.setItem('editor', JSON.stringify(invalidEditor));
      loadConfig();
      expect(appState.editor.fileName).toBe('script.cdc');
    });

    test('should reject editor state with non-array args', () => {
      const invalidEditor = {
        fileName: 'test.cdc',
        code: '',
        args: 'not an array', // should be array
        jsonArgs: [],
      };
      localStorage.setItem('editor', JSON.stringify(invalidEditor));
      loadConfig();
      expect(Array.isArray(appState.editor.args)).toBe(true);
    });
  });

  describe('Monaco settings validation', () => {
    test('should load valid monaco settings', () => {
      const validMonaco = {
        fontFamily: 'Fira Code',
        fontLigatures: true,
        cursorBlinking: 'smooth',
        cursorStyle: 'block',
        selectOnLineNumbers: false,
        minimap: true,
        contextMenu: false,
        smoothScrolling: false,
        mouseWheelZoom: false,
      };
      localStorage.setItem('monaco', JSON.stringify(validMonaco));
      loadConfig();
      expect(appState.monaco).toEqual(validMonaco);
    });

    test('should reject monaco settings with invalid cursorBlinking', () => {
      const invalidMonaco = {
        fontFamily: 'default',
        fontLigatures: false,
        cursorBlinking: 'invalid', // should be one of the valid values
        cursorStyle: 'line',
        selectOnLineNumbers: true,
        minimap: false,
        contextMenu: true,
        smoothScrolling: true,
        mouseWheelZoom: true,
      };
      localStorage.setItem('monaco', JSON.stringify(invalidMonaco));
      loadConfig();
      expect(appState.monaco.cursorBlinking).toBe('blink');
    });

    test('should reject monaco settings with invalid cursorStyle', () => {
      const invalidMonaco = {
        fontFamily: 'default',
        fontLigatures: false,
        cursorBlinking: 'blink',
        cursorStyle: 'dotted', // invalid cursor style
        selectOnLineNumbers: true,
        minimap: false,
        contextMenu: true,
        smoothScrolling: true,
        mouseWheelZoom: true,
      };
      localStorage.setItem('monaco', JSON.stringify(invalidMonaco));
      loadConfig();
      expect(appState.monaco.cursorStyle).toBe('line');
    });

    test('should reject monaco settings with non-boolean values', () => {
      const invalidMonaco = {
        fontFamily: 'default',
        fontLigatures: 'yes', // should be boolean
        cursorBlinking: 'blink',
        cursorStyle: 'line',
        selectOnLineNumbers: true,
        minimap: false,
        contextMenu: true,
        smoothScrolling: true,
        mouseWheelZoom: true,
      };
      localStorage.setItem('monaco', JSON.stringify(invalidMonaco));
      loadConfig();
      expect(appState.monaco.fontLigatures).toBe(false);
    });
  });

  describe('Settings validation', () => {
    test('should load valid settings', () => {
      const validSettings = {
        darkMode: true,
        useSystemTheme: true,
        autoFormat: true,
        runtime: RuntimeType.FlowMainnet,
      };
      localStorage.setItem('settings', JSON.stringify(validSettings));
      loadConfig();
      expect(appState.settings).toEqual(validSettings);
    });

    test('should reject settings with invalid runtime type', () => {
      const invalidSettings = {
        darkMode: false,
        useSystemTheme: false,
        autoFormat: false,
        runtime: 'INVALID_RUNTIME', // invalid runtime
      };
      localStorage.setItem('settings', JSON.stringify(invalidSettings));
      loadConfig();
      expect(appState.settings.runtime).toBe(RuntimeType.FlowTestnet);
    });

    test('should reject settings with non-boolean values', () => {
      const invalidSettings = {
        darkMode: 'true', // should be boolean
        useSystemTheme: false,
        autoFormat: false,
        runtime: RuntimeType.FlowTestnet,
      };
      localStorage.setItem('settings', JSON.stringify(invalidSettings));
      loadConfig();
      expect(appState.settings.darkMode).toBe(false);
    });
  });

  describe('Resilience to corrupted data', () => {
    test('should handle completely invalid JSON gracefully', () => {
      localStorage.setItem('UI', '{invalid json');
      localStorage.setItem('editor', 'not json at all');
      localStorage.setItem('monaco', '{"incomplete":');
      localStorage.setItem('settings', 'random text');
      
      // Should not throw
      expect(() => loadConfig()).not.toThrow();
      
      // Should use defaults
      expect(appState.UI.panel.layout).toBe(LayoutType.Vertical);
      expect(appState.editor.fileName).toBe('script.cdc');
      expect(appState.monaco.cursorStyle).toBe('line');
      expect(appState.settings.runtime).toBe(RuntimeType.FlowTestnet);
    });

    test('should handle null values gracefully', () => {
      localStorage.setItem('UI', 'null');
      localStorage.setItem('editor', 'null');
      localStorage.setItem('monaco', 'null');
      localStorage.setItem('settings', 'null');
      
      expect(() => loadConfig()).not.toThrow();
      
      // Should use defaults
      expect(appState.UI.panel.layout).toBe(LayoutType.Vertical);
      expect(appState.editor.fileName).toBe('script.cdc');
      expect(appState.monaco.cursorStyle).toBe('line');
      expect(appState.settings.runtime).toBe(RuntimeType.FlowTestnet);
    });

    test('should handle arrays instead of objects', () => {
      localStorage.setItem('UI', '[]');
      localStorage.setItem('editor', '[]');
      localStorage.setItem('monaco', '[]');
      localStorage.setItem('settings', '[]');
      
      expect(() => loadConfig()).not.toThrow();
      
      // Should use defaults
      expect(appState.UI.panel.layout).toBe(LayoutType.Vertical);
      expect(appState.editor.fileName).toBe('script.cdc');
      expect(appState.monaco.cursorStyle).toBe('line');
      expect(appState.settings.runtime).toBe(RuntimeType.FlowTestnet);
    });

    test('should handle primitive values instead of objects', () => {
      localStorage.setItem('UI', '123');
      localStorage.setItem('editor', '"string"');
      localStorage.setItem('monaco', 'true');
      localStorage.setItem('settings', '42.5');
      
      expect(() => loadConfig()).not.toThrow();
      
      // Should use defaults
      expect(appState.UI.panel.layout).toBe(LayoutType.Vertical);
      expect(appState.editor.fileName).toBe('script.cdc');
      expect(appState.monaco.cursorStyle).toBe('line');
      expect(appState.settings.runtime).toBe(RuntimeType.FlowTestnet);
    });
  });

  describe('Partial valid data', () => {
    test('should accept partial UI state with valid fields', () => {
      const partialUI = {
        shareCreated: true,
        // missing snippetId and panel, should still work
      };
      localStorage.setItem('UI', JSON.stringify(partialUI));
      loadConfig();
      expect(appState.UI.shareCreated).toBe(true);
    });

    test('should accept partial panel state', () => {
      const partialUI = {
        shareCreated: false,
        snippetId: null,
        panel: {
          height: 500,
          // missing width, collapsed, and layout - should still be valid
        },
      };
      localStorage.setItem('UI', JSON.stringify(partialUI));
      loadConfig();
      expect(appState.UI.panel.height).toBe(500);
    });

    test('should accept partial monaco settings', () => {
      const partialMonaco = {
        fontFamily: 'Consolas',
        cursorStyle: 'block',
        // other fields missing but this should still be valid
      };
      localStorage.setItem('monaco', JSON.stringify(partialMonaco));
      loadConfig();
      expect(appState.monaco.fontFamily).toBe('Consolas');
      expect(appState.monaco.cursorStyle).toBe('block');
    });
  });
});
