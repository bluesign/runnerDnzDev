import React, {CSSProperties, MouseEventHandler} from 'react';
import { FontIcon } from '@fluentui/react/lib/Icon';
import clsx from 'clsx';

export interface StatusBarItemProps {
  icon?: string | React.ComponentType,
  className?: string
  iconOnly?: boolean
  imageSrc?: string
  button?: boolean
  disabled?: boolean
  hidden?: boolean
  hideTextOnMobile?: boolean
  href?: string
  title?: string
  onClick?: MouseEventHandler<HTMLButtonElement|HTMLAnchorElement>
  style?: CSSProperties
  children?: React.ReactNode
}

const getIcon = (icon: string | React.ComponentType) => (
  typeof icon === 'string' ? (
    <FontIcon iconName={icon} className="text-xs" />
  ) : (
    React.createElement<any>(icon as React.ComponentType, {
      className: 'text-xs'
    })
  )
)

const getItemContents = ({icon, iconOnly, imageSrc, title, children, hideTextOnMobile}) => (
  <>
    {icon && getIcon(icon)}
    {imageSrc && (
      <img src={imageSrc} className="h-3" alt={title} />
    )}
    {!iconOnly && (
      <span className={clsx('ml-[0.4em] text-xs', hideTextOnMobile && 'max-sm:hidden')}>
        {children}
      </span>
    )}
  </>
)

const StatusBarItem: React.FC<StatusBarItemProps> = ({
  title,
  className,
  icon,
  iconOnly,
  imageSrc,
  hideTextOnMobile,
  href,
  button,
  children,
  hidden,
  ...props
}) => {
  if (hidden) {
    return null;
  }

  const content = getItemContents({icon, iconOnly, children, imageSrc, title, hideTextOnMobile});
  const baseClasses = 'text-white border-0 bg-transparent font-inherit text-sm font-normal flex h-full px-[5px] whitespace-pre items-center overflow-hidden outline-0 mx-[3px] no-underline';
  const actionClasses = 'cursor-pointer hover:bg-white/10 active:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30';
  const textClasses = 'select-none';

  if (button) {
    return (
      <button
        className={clsx(baseClasses, actionClasses, hideTextOnMobile && 'max-sm:hidden', className)}
        title={title}
        {...props}
      >
        {content}
      </button>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={clsx(baseClasses, actionClasses, hideTextOnMobile && 'max-sm:hidden', className)}
        title={title}
        {...props}
      >
        {content}
      </a>
    )
  }

  const { style } = props;
  return (
    <div
      className={clsx(baseClasses, textClasses, hideTextOnMobile && 'max-sm:hidden', className)}
      title={title}
      style={style}
    >
      {content}
    </div>
  );
};

export default StatusBarItem;
