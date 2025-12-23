import React from "react";
import {Argument} from "./types";
import {TextField} from "@fluentui/react";

type SingleArgumentProps = {
    argument: Argument;
    error?: string;
    onChange: (name: string, value: string) => void;
}

const SingleArgument: React.FC<SingleArgumentProps> = ({argument, error, onChange}) => {
    const {name, type} = argument;

    return (
        <div className="flex flex-col relative">
            <TextField
                label={`${name} : (${type})`}
                name={`${name}-${type}`}
                onChange={(event) => {
                    const {value} = event.target as HTMLInputElement;
                    onChange(name, value);
                }}
            />
            {error && <p className="inline text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}

export default SingleArgument;
