import React from 'react';
import {ArgumentsListProps} from './types';
import SingleArgument from './SingleArgument';
import {getContentStyles} from "~/styles/modal";
import {useTheme} from "@fluentui/react";

export const ArgumentsList: React.FC<ArgumentsListProps> = ({list,errors, onChange}) => {
    const theme = useTheme();
    const contentStyles = getContentStyles(theme);

    return (
        <div className={contentStyles.body}>
        {(list.length > 0) &&
            list.map((argument) =>
                <SingleArgument
                    key={argument.name}
                    argument={argument}
                    onChange={onChange}
                    error={errors[argument.name]}
                />
            )
        }
        </div>
    );
};




