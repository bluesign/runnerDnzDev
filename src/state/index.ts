import config, {MonacoSettings, RuntimeType} from "@services/config";
import {LayoutType} from "~/styles/modal";
import {isDarkModeEnabled, supportsPreferColorScheme, ThemeVariant} from "~/utils/theme";
import {editor} from "monaco-editor";
import {EvalEvent} from "@services/api";
import {on} from "use-minimal-state";
import {DEFAULT_FONT} from "@services/fonts";
export const getInitialThemeVariant = (wantsDarkMode: boolean, useSystemTheme:boolean): ThemeVariant => {
    if (useSystemTheme && supportsPreferColorScheme()) {
        return isDarkModeEnabled() ? ThemeVariant.dark : ThemeVariant.light
    }
    return  wantsDarkMode ? ThemeVariant.dark : ThemeVariant.light
};

const defaultMonacoSettings: MonacoSettings = {
    fontFamily: DEFAULT_FONT,
    fontLigatures: false,
    cursorBlinking: 'blink',
    cursorStyle: 'line',
    selectOnLineNumbers: true,
    minimap: false,
    contextMenu: true,
    smoothScrolling: true,
    mouseWheelZoom: true,
};

// Validation functions for config sections
const isValidLayoutType = (value: any): value is LayoutType => {
    return value === LayoutType.Horizontal || value === LayoutType.Vertical;
};

const isValidRuntimeType = (value: any): value is RuntimeType => {
    return Object.values(RuntimeType).includes(value);
};

const isValidCursorBlinking = (value: any): value is MonacoSettings['cursorBlinking'] => {
    return ['blink', 'smooth', 'phase', 'expand', 'solid'].includes(value);
};

const isValidCursorStyle = (value: any): value is MonacoSettings['cursorStyle'] => {
    return ['line', 'block', 'underline', 'line-thin', 'block-outline', 'underline-thin'].includes(value);
};

const validatePanelState = (panel: any): boolean => {
    if (!panel || typeof panel !== 'object' || Array.isArray(panel)) return false;
    
    // Allow partial panel objects - only validate fields that are present
    if (panel.height !== undefined && (typeof panel.height !== 'number' || panel.height < 0)) return false;
    if (panel.width !== undefined && (typeof panel.width !== 'number' || panel.width < 0)) return false;
    if (panel.collapsed !== undefined && typeof panel.collapsed !== 'boolean') return false;
    if (panel.layout !== undefined && !isValidLayoutType(panel.layout)) return false;
    
    return true;
};

const validateUIState = (value: any): typeof appState.UI | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    
    // Validate panel if it exists
    if (value.panel !== undefined && !validatePanelState(value.panel)) {
        return null;
    }
    
    // Validate top-level UI properties
    if (value.shareCreated !== undefined && typeof value.shareCreated !== 'boolean') return null;
    if (value.snippetId !== undefined && value.snippetId !== null && typeof value.snippetId !== 'string') return null;
    
    return value as typeof appState.UI;
};

const validateEditorState = (value: any): typeof appState.editor | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    
    if (value.fileName !== undefined && typeof value.fileName !== 'string') return null;
    if (value.code !== undefined && typeof value.code !== 'string') return null;
    if (value.args !== undefined && !Array.isArray(value.args)) return null;
    if (value.jsonArgs !== undefined && !Array.isArray(value.jsonArgs)) return null;
    
    return value as typeof appState.editor;
};

const validateMonacoSettings = (value: any): MonacoSettings | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    
    if (value.fontFamily !== undefined && typeof value.fontFamily !== 'string') return null;
    if (value.fontLigatures !== undefined && typeof value.fontLigatures !== 'boolean') return null;
    if (value.cursorBlinking !== undefined && !isValidCursorBlinking(value.cursorBlinking)) return null;
    if (value.cursorStyle !== undefined && !isValidCursorStyle(value.cursorStyle)) return null;
    if (value.selectOnLineNumbers !== undefined && typeof value.selectOnLineNumbers !== 'boolean') return null;
    if (value.minimap !== undefined && typeof value.minimap !== 'boolean') return null;
    if (value.contextMenu !== undefined && typeof value.contextMenu !== 'boolean') return null;
    if (value.smoothScrolling !== undefined && typeof value.smoothScrolling !== 'boolean') return null;
    if (value.mouseWheelZoom !== undefined && typeof value.mouseWheelZoom !== 'boolean') return null;
    
    return value as MonacoSettings;
};

const validateSettings = (value: any): typeof appState.settings | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    
    if (value.darkMode !== undefined && typeof value.darkMode !== 'boolean') return null;
    if (value.useSystemTheme !== undefined && typeof value.useSystemTheme !== 'boolean') return null;
    if (value.autoFormat !== undefined && typeof value.autoFormat !== 'boolean') return null;
    if (value.runtime !== undefined && !isValidRuntimeType(value.runtime)) return null;
    
    return value as typeof appState.settings;
};

export const appState = {
    UI: {
        shareCreated: false,
        snippetId: null,
        panel: {
            height: 300,
            width: 300,
            collapsed: false,
            layout: LayoutType.Vertical,
        }
    },
    editor: {
        fileName:  "script.cdc",
        code: "",
        args: [] as [any?],
        jsonArgs: [] as [any?],
    },
    status: {
        loading: false,
        lastError: "",
        events: [] as  EvalEvent[],
        markers: [] as editor.IMarker[],
    },
    monaco:  defaultMonacoSettings,
    settings: {
        darkMode:  false,
        useSystemTheme: false,
        autoFormat:  false,
        runtime:  RuntimeType.FlowTestnet,
    },
}

export const saveState = (section: string, m: any) =>
{
    localStorage.setItem(section, JSON.stringify(m));
}


on(appState, 'UI', c => saveState("UI", c));
on(appState, 'editor', c => saveState("editor", c));
on(appState, 'monaco', c => saveState("monaco", c));
on(appState, 'settings', c => saveState("settings", c));

export const loadConfig = ()=> {
    console.log('[Config] Loading UI state...');
    const ui = loadState("UI");
    if (ui) {
        const validatedUI = validateUIState(ui);
        if (validatedUI) {
            appState.UI = validatedUI;
            console.log('[Config] UI state loaded and validated');
        } else {
            console.warn('[Config] Invalid UI state found in localStorage, using defaults');
        }
    } else {
        console.log('[Config] No UI state found in localStorage');
    }

    console.log('[Config] Loading editor state...');
    const editor = loadState("editor");
    if (editor) {
        const validatedEditor = validateEditorState(editor);
        if (validatedEditor) {
            appState.editor = validatedEditor;
            console.log('[Config] Editor state loaded and validated');
        } else {
            console.warn('[Config] Invalid editor state found in localStorage, using defaults');
        }
    } else {
        console.log('[Config] No editor state found in localStorage');
    }

    console.log('[Config] Loading Monaco state...');
    const monaco = loadState("monaco");
    if (monaco) {
        const validatedMonaco = validateMonacoSettings(monaco);
        if (validatedMonaco) {
            appState.monaco = validatedMonaco;
            console.log('[Config] Monaco state loaded and validated');
        } else {
            console.warn('[Config] Invalid Monaco state found in localStorage, using defaults');
        }
    } else {
        console.log('[Config] No Monaco state found in localStorage');
    }
    
    console.log('[Config] Loading settings state...');
    const settings = loadState("settings");
    if (settings) {
        const validatedSettings = validateSettings(settings);
        if (validatedSettings) {
            appState.settings = validatedSettings;
            console.log('[Config] Settings state loaded and validated');
        } else {
            console.warn('[Config] Invalid settings state found in localStorage, using defaults');
        }
    } else {
        console.log('[Config] No settings state found in localStorage');
    }

}
export const loadState = (section: string) =>
{
    const val = localStorage.getItem(section);
    if (!val) {
        console.log(`[Config] No value found for section: ${section}`);
        return null;
    }

    try {
        const parsed = JSON.parse(val);
        if (!parsed) {
            console.log(`[Config] Empty parsed value for section: ${section}`);
            return null;
        }
        console.log(`[Config] Successfully parsed section: ${section}`);
        return parsed;

    } catch (error) {
        console.error(`[Config] Error parsing section ${section}:`, error);
        return null;
    }
}
