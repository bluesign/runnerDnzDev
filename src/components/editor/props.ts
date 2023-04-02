import * as monaco from 'monaco-editor';
import { MonacoSettings } from '~/services/config';
import { getFontFamily, getDefaultFontFamily } from '~/services/fonts';

export const LANGUAGE_CADENCE = 'cadence';

export const DEMO_CODE = `
  // This is the most basic script you can execute on Flow Network
  
  pub fun main():Int {
   return 42
  }
`

// stateToOptions converts MonacoState to IEditorOptions
export const stateToOptions = (state: MonacoSettings): monaco.editor.IEditorOptions => {
  const {
    selectOnLineNumbers,
    mouseWheelZoom,
    smoothScrolling,
    cursorBlinking,
    fontLigatures,
    cursorStyle,
    contextMenu
  } = state;
  return {
    selectOnLineNumbers, mouseWheelZoom, smoothScrolling, cursorBlinking, cursorStyle, fontLigatures,
    fontFamily: state.fontFamily ? getFontFamily(state.fontFamily) : getDefaultFontFamily(),
    showUnused: true,
    automaticLayout: true,
    minimap: { enabled: state.minimap },
    contextmenu: contextMenu,
  };
};
