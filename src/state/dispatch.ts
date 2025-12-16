import {saveAs} from 'file-saver';
import * as fcl from "@onflow/fcl"
import {EvalEvent} from '@services/api';
import config, {RuntimeType} from '@services/config';
import {appState} from "~/state/index";
import {update} from "use-minimal-state";
import dedent from "dedent"
import {cadenceValueToDict} from '@utils/cadenceValueConverter';

export const saveFileAction = async (fileName, code) => {
    try {
        const blob = new Blob([code], {type: 'text/plain;charset=utf-8'});
        saveAs(blob, fileName);
    } catch (err) {
        alert(`Failed to save a file: ${err}`)
    }
};

export const getTxStatus= async (txId) => {

    await fcl.config(config.networkConfig[RuntimeType.FlowMainnet])
    appState.settings.runtime = RuntimeType.FlowMainnet
    update(appState, "settings")

    try{
        var res = await fcl.send([fcl.getTransaction(txId)]).then(fcl.decode).then((info)=>{
            appState.editor.code = dedent(info.script)
            appState.settings.runtime = RuntimeType.FlowMainnet
            update(appState, "settings")
            update(appState, "editor")
            return true
        })
        if (res){
            return
        }
    }
    catch{
    }

    await fcl.config(config.networkConfig[RuntimeType.FlowTestnet])
    appState.settings.runtime = RuntimeType.FlowTestnet

    update(appState, "settings")
    try{
        res = await fcl.send([fcl.getTransaction(txId)]).then(fcl.decode).then((info)=>{
            appState.editor.code = dedent(info.script)
            update(appState, "editor")
            return true
        })
        if (res){
            return
        }
    }
    catch{
    }

}

export const runFileAction = async () => {
    const evalStart =  () => {
        appState.status.lastError = ""
        appState.status.events = []
        appState.status.loading = true
        update(appState, "status")
    }

    const evalEvent =  (events: EvalEvent[]) => {
        appState.status.events = [...appState.status.events, ...events]

        update(appState, "status")
    }

    const evalEnd =  () => {
        appState.status.loading = false
        update(appState, "status")
    }

    try {
        await fcl.config(config.networkConfig[appState.settings.runtime])
        const args = appState.editor.jsonArgs
        const code = appState.editor.code

        evalStart()
        var rawArgs = [] as any[]
        if (args) {
            rawArgs = args.map((item) => {
                return fcl.arg(item, (v) => JSON.parse(item))
            })
        }

        if (code.indexOf("transaction") === -1) {

            const res = await fcl.send([
                fcl.args(rawArgs),
                fcl.script(code),
                fcl.limit(99999),
            ])

            var result = {}
            result[res.encodedData["type"]] = cadenceValueToDict(res.encodedData, true)
            await evalEvent([{Kind: "Result", Data: result}]);
            evalEnd()

        } else {
            const currentUser = await fcl.currentUser.snapshot()
            if (!currentUser) {
                var res = await fcl.authenticate()
                alert(res)
            }

            const transactionId = await fcl.mutate({
                cadence: code,
                args: (arg, t) => rawArgs,
                proposer: fcl.currentUser,
                payer: fcl.currentUser,
                limit: 9999
            })
            console.log(transactionId)

            await evalEvent([{Kind: "Transaction ID", Data: transactionId}])

            const transaction = await fcl.tx(transactionId).onceSealed()

            console.log(transaction)
            evalEvent(
                [{
                    Kind: "Transaction Result",
                    Data: transaction,
                }]
            )
            evalEnd()

        }


    } catch (err: any) {
        var m = err.error || err.errorMessage || err.message || err.toString()

        if (m.indexOf("error caused by:")>-1) {
            m = m.split("error caused by:")[1]
        }

        appState.status.lastError = m
        appState.status.loading = false
        appState.status.events =[]
        update(appState, "status")
    }
};








