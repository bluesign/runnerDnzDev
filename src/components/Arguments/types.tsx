import {editor as monacoEditor} from 'monaco-editor/esm/vs/editor/editor.api';


export type Argument = {
    name: string;
    type: string;
};

export type ArgumentsProps = {
    collapsed?: boolean
    editor: monacoEditor.ICodeEditor;
};

export type ArgumentsListProps = {
    list: Argument[];
    onChange: (name: String, value: any) => void;
    errors: any;
};




