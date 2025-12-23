import React, { FC, PropsWithChildren } from 'react';

const FlexContainer: FC<PropsWithChildren<{}>> = ({ children }) => (
  <div style={{
    background: '#000',
    flex: '1 1',
    overflow: 'hidden',
    position: 'relative'
  }}>
    {children}
  </div>
);

export default FlexContainer;
