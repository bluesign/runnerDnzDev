// The global `Go` is declared by `wasm_exec.js`.
// Instead of improving the that file, we use it as-is,
// because it is maintained by the Go team and

// var Go

// Callbacks defines the functions that the language server calls
// and that need to be implemented by the client.
// @ts-ignore
import {go} from "./wasm_exec";
import { DocumentUri } from 'monaco-languageclient';

export namespace CadenceCheckCompleted {
  export const methodName = 'cadence/checkCompleted';
  export interface Params {
    uri: DocumentUri;
    valid: boolean;
  }
}
export class CadenceLanguageServer {
  static isLoaded = false;
  static lastSource = ""

  static async load(wasmSource:string, newCadence) {
    console.log('[LanguageServer] Starting WASM load process...');
    console.log('[LanguageServer] WASM source:', wasmSource);
    console.log('[LanguageServer] Already loaded:', this.isLoaded);
    console.log('[LanguageServer] Last source:', this.lastSource);
    
    if (this.isLoaded && this.lastSource===wasmSource) {
      console.log('[LanguageServer] WASM already loaded, skipping');
      return;
    }

    console.log('[LanguageServer] Fetching WASM from:', wasmSource);
    const wasm = await fetch(wasmSource) ;

    console.log("loaded", wasm.status, wasm.ok)
    console.log(go.importObject)
    
    console.log('[LanguageServer] Instantiating WebAssembly module...');
    const module = await WebAssembly.instantiateStreaming(
      wasm,
        go.importObject
    );
    console.log("module done")
    console.log('[LanguageServer] WebAssembly module instantiated successfully');


    // For each file descriptor, buffer the written content until reaching a newline

    const outputBuffers = new Map();
    const decoder = new TextDecoder("utf-8");

    // Implementing `writeSync` is mainly just for debugging purposes:
    // When the language server writes to a file, e.g. standard output or standard error,
    // then log the output in the console

    window["fs"].writeSync = function (fileDescriptor, buf) {
      // Get the currently buffered output for the given file descriptor,
      // or initialize it, if there is no buffered output yet.

      let outputBuffer = outputBuffers.get(fileDescriptor);
      if (!outputBuffer) {
        outputBuffer = "";
      }

      // Decode the written data as UTF-8
      outputBuffer += decoder.decode(buf);

      // If the buffered output contains a newline,
      // log the contents up to the newline to the console

      const nl = outputBuffer.lastIndexOf("\n");
      if (nl !== -1) {
        const lines = outputBuffer.substr(0, nl + 1);
        console.debug(`(FD ${fileDescriptor}):`, lines);
        // keep the remainder
        outputBuffer = outputBuffer.substr(nl + 1);
      }
      outputBuffers.set(fileDescriptor, outputBuffer);

      return buf.length;
    };

    console.log("running")
    console.log('[LanguageServer] Running Go WebAssembly instance...');
    go.run(module.instance);

    this.isLoaded = true;
    this.lastSource=wasmSource
    console.log('[LanguageServer] WASM load complete, language server is ready');
  }

  static functionNamePrefix = "CADENCE_LANGUAGE_SERVER";

  static functionName(name) {
    return `__${CadenceLanguageServer.functionNamePrefix}_${name}__`;
  }

  functionName(name) {
    return `__${CadenceLanguageServer.functionNamePrefix}_${this.id}_${name}__`;
  }

  static async create(newCadence, callbacks) {
    console.log('[LanguageServer] Creating new language server instance...');
    let source = "https://cdn.dnz.dev/cadenceNew2.wasm"
    console.log('[LanguageServer] WASM source URL:', source);
    await this.load(source, newCadence);

    console.log('[LanguageServer] Instantiating CadenceLanguageServer...');
    return new CadenceLanguageServer(callbacks);
  }
  public readonly id: number;
  private isClientClosed: boolean;

  constructor(callbacks) {
    // The language server, written in Go and compiled to WebAssembly, interacts with this JS environment
    // by calling global functions. There does not seem to be support yet to directly import functions
    // from the JS environment into the WebAssembly environment

    console.log('[LanguageServer] Constructor - setting up callbacks...');
    this.isClientClosed = false
    console.log('[LanguageServer] Starting language server...');
    this.id = window[CadenceLanguageServer.functionName("start")]();
    console.log('[LanguageServer] Language server started with ID:', this.id);

    window[this.functionName("toClient")] = (message) => {
      callbacks.toClient(JSON.parse(message));
    };

    window[this.functionName("getAddressCode")] = (address) => {
      if (!callbacks.getAddressCode) {
        return undefined;
      }
      return callbacks.getAddressCode(address);
    };

    window[this.functionName("onServerClose")] = () => {
      if (!callbacks.onServerClose) {
        return;
      }
      callbacks.onServerClose();
    };

    callbacks.toServer = (error, message) => {
      window[this.functionName("toServer")](error, JSON.stringify(message));
    };

    callbacks.onClientClose = () => {
      if (this.isClientClosed) {
        return;
      }
      this.isClientClosed = true;
      window[this.functionName("onClientClose")]();
    };
  }

  updateCodeGetter(newMethod) {
    window[this.functionName("getAddressCode")] = (address) => {
      if (!newMethod) {
        return undefined;
      }
      return newMethod(address);
    };
  }
}
