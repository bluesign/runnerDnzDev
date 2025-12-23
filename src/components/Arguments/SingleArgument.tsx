import React from "react";
import {Argument} from "./types";
import {TextField} from "@fluentui/react";
import {InputBlock, Error} from "./styles";

type SingleArgumentProps = {
    argument: Argument;
    error?: string;
    onChange: (name: string, value: string) => void;
}

const SingleArgument: React.FC<SingleArgumentProps> = ({argument, error, onChange}) => {
    const {name, type} = argument;

    return (
        <InputBlock>
            <TextField
                label={`${name} : (${type})`}
                name={`${name}-${type}`}
                onChange={(event) => {
                    const {value} = event.target as HTMLInputElement;
                    onChange(name, value);
                }}
            />
            {error && <Error>{error}</Error>}
        </InputBlock>
    );
}

export default SingleArgument;
