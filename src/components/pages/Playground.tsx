import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/router';

import {Header} from '~/components/core/Header';
import CodeEditor from '~/components/editor/CodeEditor';
import FlexContainer from '~/components/editor/FlexContainer';
import ResizablePreview from '~/components/preview/ResizablePreview';
import StatusBar from '~/components/core/StatusBar';

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


export const Playground : React.FC = () => {
    console.log('[Playground] Initializing Playground component...');
    const router = useRouter();
    const { snippetID: snippetIDParam, transactionID: transactionIDParam } = router.query;
    const snippetID = typeof snippetIDParam === 'string' ? snippetIDParam : undefined;
    const transactionID = typeof transactionIDParam === 'string' ? transactionIDParam : undefined;
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const settings = use(appState, "settings")
    const UI = use(appState, "UI")
    const editor = use(appState, "editor")
    const status = use(appState, "status")

    console.log('[Playground] SnippetID:', snippetID);
    console.log('[Playground] TransactionID:', transactionID);

    useEffect(()=> {
        if (!transactionID)
            return

        console.log('[Playground] Getting transaction status for:', transactionID);
        getTxStatus(transactionID)

    },[transactionID])

    const embed = params.get("embed") ?? ""

    useEffect(()=>{
        console.log('[Playground] Processing URL parameters...');
        UI.panel.layout = LayoutType.Vertical
        UI.panel.height = 250
        UI.panel.width = 250

        if (params.get("filename")!==""){
            editor.fileName = params.get("filename")!
            console.log('[Playground] Filename from URL:', editor.fileName);
        }

        const codeParam = params.get("code");
        if (codeParam && codeParam !== ""){
            editor.code = codeParam
            console.log('[Playground] Code from URL (length):', editor.code.length);
        }

        if (params.get("colormode")==="dark"){
            settings.darkMode = true
            console.log('[Playground] Color mode: dark');
        }

        if (params.get("colormode")==="light"){
            settings.darkMode = false
            console.log('[Playground] Color mode: light');
        }


        if (params.get("network")==="mainnet"){
            settings.runtime = RuntimeType.FlowMainnet
            console.log('[Playground] Network: mainnet');
        }

        if (params.get("network")==="testnet"){
            settings.runtime = RuntimeType.FlowTestnet
            console.log('[Playground] Network: testnet');
        }

        if (params.get("network")==="previewnet"){
            settings.runtime = RuntimeType.FlowPreviewnet
            console.log('[Playground] Network: previewnet');
        }

        if (params.get("network")==="emulator"){
            settings.runtime = RuntimeType.FlowEmulator
            console.log('[Playground] Network: emulator');
        }

        if (params.get("output")==="vertical"){
            UI.panel.layout = LayoutType.Vertical
            if (params.get("outputSize")!=="" && params.get("outputSize")!==null){
                UI.panel.height = parseInt(params.get("outputSize")!)
            }
            console.log('[Playground] Output layout: vertical');
        }
        if (params.get("output")==="horizontal" ){
            UI.panel.layout = LayoutType.Horizontal
            if (params.get("outputSize")!=="" && params.get("outputSize")!==null) {
                UI.panel.width = parseInt(params.get("outputSize")!)
            }
            console.log('[Playground] Output layout: horizontal');
        }
        if (params.get("output")==="none"){
            UI.panel.width = 0
            UI.panel.height = 0
            console.log('[Playground] Output layout: none');
        }

        if (embed==="embed"){
            UI.panel.width = 0
            UI.panel.height = 0
            console.log('[Playground] Embed mode enabled');

        }
        update(appState, "settings")
        update(appState, "editor")
        update(appState, "UI")
        console.log(UI.panel)
        if (!snippetID) {
            console.log('[Playground] No snippetID, skipping snippet load');
            return
        }

        console.log('[Playground] Loading snippet:', snippetID);
        status.loading = true
        update(appState, "status")
        //load snippet
        client.getSnippet(snippetID).then((snipResult)=>{
            console.log('[Playground] Snippet loaded successfully');
            editor.code = snipResult.code
            settings.runtime = snipResult.env as RuntimeType
            status.loading = false
            update(appState,"editor")
            update(appState,"settings")
            update(appState, "status")
        }).catch((error)=>{
            console.error('[Playground] Error loading snippet:', error);
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
                        <CadenceChecker newCadence={settings.runtime === RuntimeType.FlowPreviewnet || settings.runtime === RuntimeType.FlowTestnet || settings.runtime === RuntimeType.FlowEmulator  }>
                            <CodeEditor/>
                        </CadenceChecker>
                    </FlexContainer>

                    <ResizablePreview />

                </div>
                <StatusBar/>
            </div>
        </ThemeProvider>
    );
}

export default Playground;
