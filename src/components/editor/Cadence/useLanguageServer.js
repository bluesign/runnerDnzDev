import { useState, useEffect } from "react";
import { monaco } from "react-monaco-editor";
import { MonacoServices } from "monaco-languageclient/lib/monaco-services";
import * as fcl from "@onflow/fcl"
import { CadenceLanguageServer } from "./language-server";
import { createCadenceLanguageClient } from "./language-client";
import {appState} from "~/state";
import {update, use} from "use-minimal-state";
import config, {RuntimeType} from '@services/config';

let monacoServicesInstalled = false;

async function startLanguageServer(newCadence, callbacks, getCode, options) {
  const { setLanguageServer, setCallbacks } = options;
  const server = await CadenceLanguageServer.create(newCadence, callbacks);
  new Promise(() => {
    let checkInterval = setInterval(() => {
      // .toServer() method is populated by language server
      // if it was not properly started or in progress it will be "null"
      if (callbacks.toServer !== null) {
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
  if (languageServer) {
    const newClient = createCadenceLanguageClient(callbacks);
    newClient.start();
    await newClient.onReady();
    setLanguageClient(newClient);
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


  const getSync = (address) => {
    let [account, _] = address.split(".")
    while (account.length<16){
      account = "0" + account
    }
    console.log(account)

    try {
      // Get the current runtime network configuration
      const runtime = appState.settings.runtime || RuntimeType.FlowMainnet;
      const networkConfig = config.networkConfig[runtime];
      
      if (!networkConfig || !networkConfig["accessNode.api"]) {
        console.error("Invalid network configuration for runtime:", runtime);
        return;
      }
      
      const accessNodeApi = networkConfig["accessNode.api"];
      
      // Use synchronous XMLHttpRequest to block until data loads
      // Note: Synchronous XHR is deprecated but required to meet the spec:
      // "wait till code loads, and then return"
      const xhr = new XMLHttpRequest();
      const url = `${accessNodeApi}/v1/accounts/0x${account}`;
      xhr.open("GET", url, false); // false makes the request synchronous
      xhr.send(null);

      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          const contracts = response.contracts || {};
          console.log(response)

          for(let key in contracts) {
            console.log(key)
            codes[`${account}.${key}`] = contracts[key]
          }
        } catch (parseError) {
          console.error("Failed to parse account response:", parseError);
        }
      } else {
        console.error(`Failed to fetch account ${account}: HTTP ${xhr.status}`);
      }
    } catch (error) {
      console.error("Error in getSync:", error);
    }
  }

  const getCode = (address) => {

    console.log("GET CODE", address)

    if (codes[address]!=null){
      console.log("cached")
      return codes[address]
    }

    getSync(address)
    return codes[address] || null
  };


  const restartServer = (newCadence=false) => {
    console.log("Restarting server...", newCadence);

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
    if (!monacoServicesInstalled) {
      MonacoServices.install(monaco);
      monacoServicesInstalled = true;
    }

    restartServer(newCadence);
  }, [newCadence]);

  useEffect(() => {
    if (!languageClient && window) {
      launchLanguageClient(callbacks, languageServer, setLanguageClient).then();
    }
  }, [languageServer]);

  return {
    languageClient,
    languageServer,
    restartServer,
  };
}
