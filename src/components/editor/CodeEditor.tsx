import React, {useState} from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import {editor} from 'monaco-editor';
import {attachCustomCommands} from './commands';
import {LANGUAGE_CADENCE, stateToOptions} from './props';
import configureCadence from "@components/editor/Cadence/cadence";
import Arguments from "@components/Arguments";
import {PreviewProps} from "@components/preview/Preview";
import {runFileAction} from "~/state/dispatch";
import {appState} from "~/state";
import {update, use} from "use-minimal-state";

const ANALYZE_DEBOUNCE_TIME = 1000;

export const CodeEditor: React.FC<PreviewProps> = ()=>{

  console.log('[CodeEditor] Initializing CodeEditor component...');
  const [previousTimeout, setPreviousTimeout] =  useState<any>(null)
  const [editorInstance, setEditorInstance] = useState<any>(null)

  const settings = use(appState, "settings")
  const editorState= use(appState, "editor")
  const status = use(appState, "status")
  const monacoSettings  = use(appState, "monaco")

  const editorDidMount = (editorInstance: editor.IStandaloneCodeEditor, m: monaco.editor.IEditorConstructionOptions) => {

    console.log('[CodeEditor] Editor mounted, setting up...');
    setEditorInstance(editorInstance);
    console.log('[CodeEditor] Configuring Cadence language...');
    configureCadence(m);
    console.log('[CodeEditor] Cadence language configured');

    const actions = [
      {
        id: 'clear',
        label: 'Reset contents',
        contextMenuGroupId: 'navigation',
        run: () => {
          editorState.code=""
          update(appState, "editor");
        }
      },
      {
        id: 'run-code',
        label: 'Build And Run Code',
        contextMenuGroupId: 'navigation',
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
        ],
        run: () => {
          runFileAction()
        }
      },

    ];

    // Register custom actions
    actions.forEach(action => editorInstance.addAction(action));
    attachCustomCommands(editorInstance);
    //editorInstance.focus();
    console.log('[CodeEditor] Editor setup complete');
  }

  const doAnalyze = () => {
    if (previousTimeout) {
      clearTimeout(previousTimeout);
    }
    setPreviousTimeout( setTimeout(async () => {
      setPreviousTimeout(null)

      const markers = editor.getModelMarkers({})
          status.markers= markers
          update(appState, "status");
      }
      , ANALYZE_DEBOUNCE_TIME))
  };


  const onChange = (newValue: string, _: editor.IModelContentChangedEvent)=>{
    editorState.code=newValue
    update(appState, "editor")
    doAnalyze()
  }

    const options = stateToOptions(monacoSettings);

    return (
<>
      <MonacoEditor
        language={LANGUAGE_CADENCE}
        theme={settings.darkMode ? 'vs-dark' : 'vs-light'}
        value={editorState.code}
        options={options}
        onChange={(newVal, e) => onChange(newVal, e)}
        editorDidMount={(e, m: any) => editorDidMount(e, m)}
      />

  {editorInstance && <Arguments editor={editorInstance}/>}

</>

  );
}

export default CodeEditor;


