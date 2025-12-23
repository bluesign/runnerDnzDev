import React from 'react';
import clsx from 'clsx';

export interface PanelActionProps {
    hidden?: boolean
    icon: React.ReactNode
    label: string
    desktopOnly?: boolean
    onClick?: () => void
}

const PanelAction: React.FC<PanelActionProps> = ({hidden, icon, desktopOnly, label, onClick}) => {
    if (hidden) {
        return null;
    }

    return (
        <button
            className={clsx(
                'bg-transparent font-inherit text-inherit border-none cursor-pointer',
                'flex items-center p-[3px] rounded-[5px] mr-1',
                'hover:bg-[var(--pg-panel-action-hover-bg)]',
                desktopOnly && 'max-[480px]:hidden'
            )}
            title={label}
            onClick={onClick}
        >
            {icon}
        </button>
    );
};

export default PanelAction;
