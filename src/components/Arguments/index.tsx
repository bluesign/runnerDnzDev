import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {ArgumentsProps} from 'components/Arguments/types';
import {ArgumentsList} from './ArgumentsList';
import {CadenceCheckerContext} from "@components/editor/Cadence/CadenceChecker";
import {ExecuteCommandRequest} from 'monaco-languageclient';
import {CadenceCheckCompleted} from "@components/editor/Cadence/language-server";
import {useTheme} from "@fluentui/react";
import {getContentStyles} from "~/styles/modal";
import PanelHeader from "@components/core/Panel/PanelHeader";
import {VscChevronDown, VscChevronUp} from "react-icons/vsc";
import {DragBox, DragMe} from "@components/Arguments/styles";
import {use} from "use-minimal-state";
import {appState} from "~/state";

const isDictionary = (type: string) => type.includes("{")
const isArray = (type: string) => type.includes("[")
const isImportedType = (type: string) => type.includes(".")
const isComplexType = (type: string) => isDictionary(type)
    || isArray(type)
    || isImportedType(type)

const startsWith = (value: string, prefix: string) => {
    return value.startsWith(prefix) || value.startsWith("U" + prefix)
}

const checkJSON = (value: any, type: string) => {
    try {
        JSON.parse(value)
        return null
    } catch (e) {
        return `Not a valid argument of type ${type}`
    }
}

const validateByType = (
    value: any,
    type: string,
) => {
    if (value.length === 0) {
        return "Value can't be empty";
    }

    switch (true) {
        // Strings
        case type === 'String': {
            return null; // no need to validate String for now
        }

        // Integers
        case startsWith(type, 'Int'): {
            if (isNaN(value) || value === '') {
                return 'Should be a valid Integer number';
            }
            return null;
        }

        // Words
        case startsWith(type, 'Word'): {
            if (isNaN(value) || value === '') {
                return 'Should be a valid Word number';
            }
            return null;
        }

        // Fixed Point
        case startsWith(type, 'Fix'): {
            if (isNaN(value) || value === '') {
                return 'Should be a valid fixed point number';
            }
            return null;
        }

        case isComplexType(type): {
            // This case it to catch complex arguments like Dictionaries
            return checkJSON(value, type);
        }

        // Address
        case type === 'Address': {
            if (!value.match(/(^0x[\w\d]{16})|(^0x[\w\d]{1,4})/)) {
                return 'Not a valid Address';
            }
            return null;
        }

        // Booleans
        case type === 'Bool': {
            if (value !== 'true' && value !== 'false') {
                return 'Boolean values can be either true or false';
            }
            return null;
        }

        default: {
            return null;
        }
    }
};


interface IValue {
    [key: string]: string;
}


const Arguments: React.FC<ArgumentsProps> = (props) => {
    const {editor} = props;
    const clientOnNotification = useRef(null);
    const {languageClient} = useContext(CadenceCheckerContext);
    const [executionArguments, setExecutionArguments] = useState<any>({});
    const theme = useTheme();
    const contentStyles = getContentStyles(theme);
    const [errors, setErrors] = useState({})
    const [values, setValue] = useState<IValue>({});

    const editorState= use(appState, "editor")

    const parseParameters = async (): Promise<[any?]> => {
        if (!languageClient) {
            return []
        }
        const fixed = list.map((arg: any) => {
            const {name, type} = arg;
            let value = values[name];

            if (type === `String`) {
                if (value == null) {
                    value = ""
                }
                value = `${value}`;
            }

            // We probably better fix this on server side...
            if (type === 'UFix64') {
                if (value && value.indexOf('.') < 0) {
                    value = `${value}.0`;
                }
            }

            // Language server throws "input is not literal" without quotes
            if (type === `String`) {
                value = `"${value.replace(/"/g, '\\"')}"`;
            }

            return value;
        });


        let formatted: any;
        try {
            formatted = await languageClient.sendRequest(ExecuteCommandRequest.type, {
                command: 'cadence.server.parseEntryPointArguments',
                arguments: [editor?.getModel()?.uri.toString(), fixed],
            });
        } catch (e) {
            return []
        }

        // Map values to strings that will be passed to backend
        return list.map((_: any, index: number) =>
            JSON.stringify(formatted[index]),
        );

    }
    const getParameters = async (): Promise<[any?]> => {
        if (!languageClient) {
            return [];
        }

        try {
            const uri = editor?.getModel()?.uri.toString();
            const args = await languageClient.sendRequest(
                ExecuteCommandRequest.type,
                {
                    command: 'cadence.server.getEntryPointParameters',
                    arguments: [uri],
                },
            );
            return args || [];
        } catch (error) {
            return [];
        }
    };
    const setupLanguageClientListener = () => {
        if (clientOnNotification.current) {
            //dispose
        }

        clientOnNotification.current = languageClient.onNotification(
            CadenceCheckCompleted.methodName,
            async (result: CadenceCheckCompleted.Params) => {
                if (result.valid) {
                    const params = await getParameters();
                    // Update state
                    console.log("update params", params)
                    setExecutionArguments({
                        ...executionArguments,
                        params: params,
                    });
                }
                else{
                    setExecutionArguments({
                        ...executionArguments,
                        params: [],
                    });
                }
            },
        );
    };

    const getArguments = (): any => {
        return executionArguments.params || [];
    };

    const list = useMemo(getArguments, [executionArguments]);
    const [collapsed, setCollapsed] = useState<boolean>(false)

    useEffect(() => {
        if (languageClient) {
            console.log("set listener")
            setupLanguageClientListener();
        }
    }, [languageClient]);

    useEffect(() => {
        //onArgsChange(executionArguments)
    }, [executionArguments])
    const constraintsRef = useRef(null)


    const validate = (list: any, values: any) => {
        const errors = list.reduce((acc: any, item: any) => {
            const {name, type} = item;
            const value = values[name];
            if (value) {
                const error = validateByType(value, type);
                if (error) {
                    acc[name] = error;
                }
            } else {
                if (type !== 'String') {
                    acc[name] = "Value can't be empty";
                }
            }
            return acc;
        }, {});

        setErrors(errors);
    };

    useEffect(() => {
        if (list.length) {
            validate(list, values)
        }
    }, [list, values]);

    useEffect(() => {
        if (errors === {}) return
        parseParameters().then((result) => {
            editorState.jsonArgs = result

        })
    }, [errors, values, editorState])


    if (!list) return null
    if (list.length === 0) return null


    return (
        <>
        <DragBox ref={constraintsRef}/>

        <DragMe>
                <div
                    className={contentStyles.container}

                    style={{
                        minWidth: 250,
                        border: `2px solid ${theme?.palette.neutralQuaternaryAlt}`,
                        backgroundColor: theme?.palette.neutralLighter,
                        zIndex: -1
                    }}
                >
                    <PanelHeader
                        label="Arguments"
                        commands={{
                            'collapse': {
                                hidden: false,
                                icon: !collapsed ? <VscChevronUp/> : <VscChevronDown/>,
                                label: collapsed ? 'Expand' : 'Collapse',
                                onClick: () => setCollapsed(!collapsed)
                            },
                        }}
                    />

                    {!collapsed &&
                        <ArgumentsList
                            list={list}
                            errors={errors}
                            onChange={(name, value) => {
                                let key = name.toString();
                                let newValue = {...values, [key]: value};
                                setValue(newValue);
                            }}
                        />
                    }

                </div>

        </DragMe>
    </>
    )

}

export default Arguments;
