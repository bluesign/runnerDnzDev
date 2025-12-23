import React, {useContext} from 'react';
import {ITheme, ThemeContext} from '@fluentui/react';
import PanelAction, {PanelActionProps} from '@components/core/Panel/PanelAction';

interface Props {
    label: string
    commands?: { [key: string]: PanelActionProps },
}


const PanelHeader: React.FC<Props> = ({label, commands}) => {
    const theme = useContext(ThemeContext);
    const {
        palette: {neutralLight, neutralDark, neutralQuaternaryAlt}
    } = theme as ITheme;

    return (
        <div
            className="p-2 flex flex-row items-center justify-between"
            style={{
                backgroundColor: neutralLight,
                color: neutralDark,
                '--pg-panel-action-hover-bg': neutralQuaternaryAlt
            } as any}
        >
            <div className="flex items-center">
                <span className="uppercase text-[11px] px-[7px]">
                    <b>{label}</b>
                </span>
            </div>
            <ul className="flex flex-row list-none m-0 p-0">
                {commands ? (
                    Object.entries(commands)
                        .map(([key, props]) => ({key, ...props}))
                        .filter(({hidden}) => !hidden)
                        .map(({key, ...props}) => (
                            <li key={key} className="m-0 p-0">
                                <PanelAction {...props} />
                            </li>
                        ))
                ) : null}
            </ul>
        </div>
    );
};

export default PanelHeader;
