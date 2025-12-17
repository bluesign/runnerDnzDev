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

export const appState = {
    UI: {
        shareCreated: false,
        snippetId: null,
        panel: {
            height: 300,
            width: 300,
            collapsed: false,
            layout:LayoutType.Vertical,
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
    const ui = loadState("UI")
    if (!!ui){
        appState.UI = ui
        console.log('[Config] UI state loaded');
    } else {
        console.log('[Config] No UI state found in localStorage');
    }

    console.log('[Config] Loading editor state...');
    const editor = loadState("editor")
    if (!!editor) {
        appState.editor = loadState("editor")
        console.log('[Config] Editor state loaded');
    } else {
        console.log('[Config] No editor state found in localStorage');
    }

    console.log('[Config] Loading Monaco state...');
    const monaco =  loadState("monaco")
    if (!!monaco){
        appState.monaco = monaco
        console.log('[Config] Monaco state loaded');
    } else {
        console.log('[Config] No Monaco state found in localStorage');
    }
    
    console.log('[Config] Loading settings state...');
    const settings =  loadState("settings")
    if (!!settings){
        appState.settings = settings
        console.log('[Config] Settings state loaded');
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
