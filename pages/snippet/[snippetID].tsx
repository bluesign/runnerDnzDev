import React from 'react';
import dynamic from 'next/dynamic';

const Playground = dynamic(() => import('~/components/pages/Playground'), { ssr: false });

const SnippetPage: React.FC = () => {
  return <Playground />;
};

export default SnippetPage;
