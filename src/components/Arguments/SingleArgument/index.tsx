import React from "react";
import {Argument} from "components/Arguments/types";
import {InputBlock, Error} from "./styles";
import {TextField} from "@fluentui/react";

type SingleArgumentProps = {
    argument: Argument,
    error: String,
    onChange: (name: String, value: any) => void
}

const SingleArgument: React.FC<SingleArgumentProps> = ({argument, error, onChange}) => {
    const {name, type} = argument
    return (
        <InputBlock>
            <TextField
                label={`${name} : (${type})`}
                name={`${name}-${type}`}
                onChange={(event) => {
                    const {value} = event.target as HTMLInputElement
                    onChange(name, value)
                }}/>
            {error && <Error>{error}</Error>}
        </InputBlock>
    )
}

export default SingleArgument
