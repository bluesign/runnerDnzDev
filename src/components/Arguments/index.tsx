import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {ArgumentsProps} from './types';
import SingleArgument from './SingleArgument';
import {CadenceCheckerContext} from "@components/editor/Cadence/CadenceChecker";
import {ExecuteCommandRequest} from 'monaco-languageclient';
import {CadenceCheckCompleted} from "@components/editor/Cadence/language-server";
import {useTheme} from "@fluentui/react";
import {getContentStyles} from "~/styles/modal";
import PanelHeader from "@components/core/Panel/PanelHeader";
import {VscChevronDown, VscChevronUp} from "react-icons/vsc";
import {use, update} from "use-minimal-state";
import {appState} from "~/state";

const isDictionary = (type: string) => type.includes("{");
const isArray = (type: string) => type.includes("[");
const isImportedType = (type: string) => type.includes(".");
const isComplexType = (type: string) => isDictionary(type) || isArray(type) || isImportedType(type);

const startsWith = (value: string, prefix: string) => {
    return value.startsWith(prefix) || value.startsWith("U" + prefix);
}

const checkJSON = (value: string, type: string) => {
    try {
        JSON.parse(value);
        return null;
    } catch (e) {
        return `Not a valid argument of type ${type}`;
    }
}

const validateByType = (value: string, type: string): string | null => {
    if (value.length === 0) {
        return "Value can't be empty";
    }

    switch (true) {
        case type === 'String':
            return null;

        case startsWith(type, 'Int'):
        case startsWith(type, 'Word'):
        case startsWith(type, 'Fix'):
            if (isNaN(Number(value)) || value === '') {
                return `Should be a valid ${type} number`;
            }
            return null;

        case isComplexType(type):
            return checkJSON(value, type);

        case type === 'Address':
            if (!value.match(/(^0x[\w\d]{16})|(^0x[\w\d]{1,4})/)) {
                return 'Not a valid Address';
            }
            return null;

        case type === 'Bool':
            if (value !== 'true' && value !== 'false') {
                return 'Boolean values can be either true or false';
            }
            return null;

        default:
            return null;
    }
};

interface IValue {
    [key: string]: string;
}

interface IErrors {
    [key: string]: string;
}


const Arguments: React.FC<ArgumentsProps> = (props) => {
    const {editor} = props;
    const clientOnNotification = useRef<any>(null);
    const {languageClient} = useContext(CadenceCheckerContext);
    const [executionArguments, setExecutionArguments] = useState<any>({});
    const [errors, setErrors] = useState<IErrors>({});
    const [values, setValue] = useState<IValue>({});
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const constraintsRef = useRef(null);

    const theme = useTheme();
    const contentStyles = getContentStyles(theme);
    const editorState = use(appState, "editor");

    const parseParameters = async (): Promise<string[]> => {
        if (!languageClient) {
            return [];
        }

        const fixed = list.map((arg: any) => {
            const {name, type} = arg;
            let value = values[name];

            if (type === 'String') {
                if (value == null) {
                    value = "";
                }
                value = `${value}`;
            }

            if (type === 'UFix64') {
                if (value && value.indexOf('.') < 0) {
                    value = `${value}.0`;
                }
            }

            if (type === 'String') {
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
            return [];
        }

        return list.map((_: any, index: number) => JSON.stringify(formatted[index]));
    }
    const getParameters = async (): Promise<any[]> => {
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
        clientOnNotification.current = languageClient.onNotification(
            CadenceCheckCompleted.methodName,
            async (result: CadenceCheckCompleted.Params) => {
                const params = result.valid ? await getParameters() : [];
                setExecutionArguments({
                    ...executionArguments,
                    params,
                });

                // Update language server status back to ready after checking
                if (appState.status.languageServerStatus === "checking") {
                    appState.status.languageServerStatus = "ready";
                    update(appState, "status");
                }
            },
        );
    };

    const list = useMemo(() => executionArguments.params || [], [executionArguments]);

    useEffect(() => {
        if (languageClient) {
            setupLanguageClientListener();
        }
    }, [languageClient]);


    const validate = (list: any[], values: IValue) => {
        const newErrors = list.reduce((acc: IErrors, item: any) => {
            const {name, type} = item;
            const value = values[name];

            if (value) {
                const error = validateByType(value, type);
                if (error) {
                    acc[name] = error;
                }
            } else if (type !== 'String') {
                acc[name] = "Value can't be empty";
            }

            return acc;
        }, {});

        setErrors(newErrors);
    };

    useEffect(() => {
        if (list.length) {
            validate(list, values);
        } else {
            // No arguments, no errors
            editorState.hasArgumentErrors = false;
            update(appState, "editor");
        }
    }, [list, values]);

    useEffect(() => {
        const hasErrors = Object.keys(errors).length > 0;
        editorState.hasArgumentErrors = hasErrors;

        if (!hasErrors) {
            parseParameters().then((result) => {
                editorState.jsonArgs = result;
            });
        }

        update(appState, "editor");
    }, [errors, values, editorState]);

    if (!list || list.length === 0) {
        return null;
    }

    return (
        <>
            <div ref={constraintsRef} className="absolute w-full h-full top-0 right-0 -z-10" />
            <div className="absolute right-5 top-0 max-w-[calc(100%-40px)] max-h-full z-[1000]">
                <div
                    className={contentStyles.container}
                    style={{
                        minWidth: 250,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        border: `2px solid ${theme?.palette.neutralQuaternaryAlt}`,
                        backgroundColor: theme?.palette.neutralLighter,
                        zIndex: -1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <PanelHeader
                        label="Arguments"
                        commands={{
                            'collapse': {
                                hidden: false,
                                icon: !collapsed ? <VscChevronUp /> : <VscChevronDown />,
                                label: collapsed ? 'Expand' : 'Collapse',
                                onClick: () => setCollapsed(!collapsed)
                            },
                        }}
                    />

                    {!collapsed && (
                        <div className={contentStyles.body} style={{overflowY: 'auto', flex: 1}}>
                            {list.map((argument: any) => (
                                <SingleArgument
                                    key={argument.name}
                                    argument={argument}
                                    error={errors[argument.name]}
                                    onChange={(name, value) => {
                                        setValue({...values, [name]: value});
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Arguments;
