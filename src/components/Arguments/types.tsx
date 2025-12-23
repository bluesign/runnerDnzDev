import {editor as monacoEditor} from 'monaco-editor/esm/vs/editor/editor.api';

export type Argument = {
    name: string;
    type: string;
};

export type ArgumentsProps = {
    collapsed?: boolean;
    editor: monacoEditor.ICodeEditor;
};




