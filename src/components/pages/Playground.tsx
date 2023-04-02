import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {Header} from '~/components/core/Header';
import CodeEditor from '~/components/editor/CodeEditor';
import FlexContainer from '~/components/editor/FlexContainer';
import ResizablePreview from '~/components/preview/ResizablePreview';
import StatusBar from '~/components/core/StatusBar';

import './Playground.css';
import CadenceChecker from "@components/editor/Cadence/CadenceChecker";
import {ThemeProvider} from "@fluentui/react/lib/Theme";
import {appState, getInitialThemeVariant} from "~/state";
import {IPartialTheme} from "@fluentui/react";
import {getThemeFromVariant, ThemeVariant} from "~/utils/theme";
import {update, use} from "use-minimal-state";
import client from "@services/api";
import {RuntimeType} from "@services/config";
import {getTxStatus} from "~/state/dispatch";


export const Playground = ({panelProps, dispatch}) => {
    const {snippetID, transactionID} = useParams();

    const settings = use(appState, "settings")
    const UI = use(appState, "UI")
    const editor = use(appState, "editor")
    const status = use(appState, "status")


    useEffect(()=> {
        if (!transactionID)
            return

        getTxStatus(transactionID)

    },[transactionID])

    useEffect(()=>{
        if (!snippetID)
            return

        status.loading = true
        update(appState, "status")
        //load snippet
        client.getSnippet(snippetID).then((snipResult)=>{
            editor.code = snipResult.code
            settings.runtime = snipResult.env as RuntimeType
            status.loading = false
            update(appState,"editor")
            update(appState,"settings")
            update(appState, "status")
        }).catch((error)=>{
            status.lastError = error.message
            status.loading = false
            update(appState, "status")
        })
    }, [snippetID])

    const mode = getInitialThemeVariant(settings.darkMode, settings.useSystemTheme)
    settings.darkMode = mode === ThemeVariant.dark

    const [theme, setTheme] = useState<IPartialTheme >(getThemeFromVariant(mode))

    useEffect(() => {
        const mode = getInitialThemeVariant(settings.darkMode, settings.useSystemTheme)
        setTheme(getThemeFromVariant(mode))
        settings.darkMode = mode === ThemeVariant.dark
        update(appState, "settings")
    }, [settings.darkMode, settings.useSystemTheme])

    return (
        <ThemeProvider className="App" theme={theme!}>

            <div className="Playground">
                <Header/>
                <div className={`Layout Layout--${UI.panel.layout}`}>

                    <FlexContainer>
                        <CadenceChecker>
                            <CodeEditor/>
                        </CadenceChecker>
                    </FlexContainer>

                    <ResizablePreview
                        {...panelProps}
                    />

                </div>
                <StatusBar/>
            </div>
        </ThemeProvider>
    );
}

export default Playground;
