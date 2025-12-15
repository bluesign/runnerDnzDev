import React from 'react';

interface Props {
  children?: React.ReactNode;
}

const EllipsisText: React.FC<Props> = ({children, ...props}) => (
  <span className="EllipsisText" {...props}>
    {children}
  </span>
);

export default EllipsisText;
