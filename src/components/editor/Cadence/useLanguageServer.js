import { useState, useEffect } from "react";
import { monaco } from "react-monaco-editor";
import { MonacoServices } from "monaco-languageclient/lib/monaco-services";
import * as fcl from "@onflow/fcl"
import { CadenceLanguageServer } from "./language-server";
import { createCadenceLanguageClient } from "./language-client";
import {appState} from "~/state";
import {update, use} from "use-minimal-state";

let monacoServicesInstalled = false;

async function startLanguageServer(newCadence, callbacks, getCode, options) {
  console.log('[useLanguageServer] Starting language server...');
  const { setLanguageServer, setCallbacks } = options;
  const server = await CadenceLanguageServer.create(newCadence, callbacks);
  console.log('[useLanguageServer] Language server created, waiting for it to be ready...');
  new Promise(() => {
    let checkInterval = setInterval(() => {
      // .toServer() method is populated by language server
      // if it was not properly started or in progress it will be "null"
      if (callbacks.toServer !== null) {
        console.log('[useLanguageServer] Language server is ready!');
        clearInterval(checkInterval);
        callbacks.getAddressCode = getCode;
        setCallbacks(callbacks);
        setLanguageServer(server);
        console.log("%c LS: Is Up!", "color: #00FF00");
      }
    }, 100);
  });
}

const launchLanguageClient = async (
  callbacks,
  languageServer,
  setLanguageClient
) => {
  console.log('[useLanguageServer] Launching language client...');
  if (languageServer) {
    console.log('[useLanguageServer] Creating Cadence language client...');
    const newClient = createCadenceLanguageClient(callbacks);
    console.log('[useLanguageServer] Starting language client...');
    newClient.start();
    console.log('[useLanguageServer] Waiting for client to be ready...');
    await newClient.onReady();
    console.log('[useLanguageServer] Language client is ready!');
    setLanguageClient(newClient);
  } else {
    console.log('[useLanguageServer] No language server available, skipping client launch');
  }
};

export default function useLanguageServer(newCadence) {
  let initialCallbacks = {
    // The actual callback will be set as soon as the language server is initialized
    toServer: null,

    // The actual callback will be set as soon as the language server is initialized
    onClientClose: null,

    // The actual callback will be set as soon as the language client is initialized
    onServerClose: null,

    // The actual callback will be set as soon as the language client is initialized
    toClient: null,

    //@ts-ignore
    getAddressCode(address) {
      // we will set it once it is instantiated
    },
  };

  // Base state handler
  const [languageServer, setLanguageServer] = useState(null);
  const [languageClient, setLanguageClient] = useState(null);
  const [callbacks, setCallbacks] = useState(initialCallbacks);
  var codes = {}


  const getCodeAsync = async (address,callbacks) => {

    let [account, _] = address.split(".")
    while (account.length<16){
      account = "0" + account
    }
  console.log(account)
    let response =  await fcl.send([fcl.getAccount(`0x${account}`)])
    let contracts = response["account"]["contracts"]
  console.log(response)

    for(let key in contracts) {
      console.log(key)
      codes[`${account}.${key}`] = contracts[key]
    }

    appState.editor.code=appState.editor.code+" "
    update(appState, "editor")
  }

  const getCode = (address) => {

    console.log("GET CODE", address)

    if (codes[address]!=null){
      console.log("cached")
      return codes[address]
    }

    getCodeAsync(address,callbacks).then()
    return null
  };


  const restartServer = (newCadence=false) => {
    console.log("Restarting server...", newCadence);
    console.log('[useLanguageServer] Initiating server restart with newCadence:', newCadence);

    startLanguageServer(newCadence, callbacks, getCode, {
      setLanguageServer,
      setCallbacks,
    }).then();
  };

  useEffect(() => {
    // The Monaco Language Client services have to be installed globally, once.
    // An editor must be passed, which is only used for commands.
    // As the Cadence language server is not providing any commands this is OK

    console.log("Installing monaco services");
    console.log('[useLanguageServer] Setting up Monaco services...');
    if (!monacoServicesInstalled) {
      console.log('[useLanguageServer] Installing Monaco services...');
      MonacoServices.install(monaco);
      monacoServicesInstalled = true;
      console.log('[useLanguageServer] Monaco services installed');
    } else {
      console.log('[useLanguageServer] Monaco services already installed');
    }

    console.log('[useLanguageServer] Triggering server restart...');
    restartServer(newCadence);
  }, [newCadence]);

  useEffect(() => {
    console.log('[useLanguageServer] Language server state changed:', languageServer ? 'available' : 'not available');
    if (!languageClient && window) {
      console.log('[useLanguageServer] No language client yet, launching...');
      launchLanguageClient(callbacks, languageServer, setLanguageClient).then();
    } else if (languageClient) {
      console.log('[useLanguageServer] Language client already exists');
    }
  }, [languageServer]);

  return {
    languageClient,
    languageServer,
    restartServer,
  };
}
