import React, {useEffect, useState} from 'react';
import {useParams,useLocation} from 'react-router-dom';

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
import {LayoutType} from "~/styles/modal";


export const Playground = ({panelProps, dispatch}) => {
    const {snippetID, transactionID} = useParams();
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const settings = use(appState, "settings")
    const UI = use(appState, "UI")
    const editor = use(appState, "editor")
    const status = use(appState, "status")

    useEffect(()=> {
        if (!transactionID)
            return

        getTxStatus(transactionID)

    },[transactionID])

    const embed = params.get("embed") ??""

    useEffect(()=>{
        UI.panel.layout = LayoutType.Vertical
        UI.panel.height = 250

        if (params.get("filename")!==""){
            editor.fileName = params.get("filename")!
        }

        if (params.get("code")!==""){
            editor.code = params.get("code")!
        }

        if (params.get("colormode")==="dark"){
            settings.darkMode = true
        }

        if (params.get("colormode")==="light"){
            settings.darkMode = false
        }


        if (params.get("network")==="mainnet"){
            settings.runtime = RuntimeType.FlowMainnet
        }

        if (params.get("network")==="testnet"){
            settings.runtime = RuntimeType.FlowTestnet
        }

        if (params.get("network")==="previewnet"){
            settings.runtime = RuntimeType.FlowPreviewnet
        }

        if (params.get("network")==="emulator"){
            settings.runtime = RuntimeType.FlowEmulator
        }

        if (params.get("output")==="vertical"){
            UI.panel.layout = LayoutType.Vertical
            if (params.get("outputSize")!=="") {
                UI.panel.height = parseInt(params.get("outputSize")!)
            }
        }
        if (params.get("output")==="horizontal"){
            UI.panel.layout = LayoutType.Horizontal
            if (params.get("outputSize")!=="") {
                UI.panel.width = parseInt(params.get("outputSize")!)
            }
        }
        if (params.get("output")==="none"){
            UI.panel.width = 0
            UI.panel.height = 0
        }

        if (embed==="embed"){
            UI.panel.width = 0
            UI.panel.height = 0

        }
        update(appState, "settings")
        update(appState, "editor")
        update(appState, "UI")

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
                <Header embed={ embed }/>
                 <div className={`Layout Layout--${UI.panel.layout}`}>

                    <FlexContainer>
                        <CadenceChecker newCadence={settings.runtime === RuntimeType.FlowPreviewnet}>
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
