import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { loadConfig } from '~/state';

// Global CSS imports
import '~/index.css';
import '~/App.css';
import '~/components/core/Header.css';
import '~/components/core/StatusBar/StatusBar.css';
import '~/components/core/StatusBar/StatusBarItem.css';
import '~/components/core/Panel/PanelAction.css';
import '~/components/core/Panel/PanelHeader.css';
import '~/components/pages/Playground.css';
import '~/components/pages/NotFoundPage.css';
import '~/components/preview/Preview.css';
import '~/components/preview/ResizablePreview.css';
import '~/components/preview/EvalEventView.css';
import '~/components/utils/EllipsisText.css';
import '~/components/modals/EnvironmentSelectModal/EnvironmentSelectModal.css';

// Polyfills
import 'core-js/actual/promise/all-settled';
import 'core-js/actual/array/flat-map';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize FluentUI icons
    initializeIcons();
    
    // Load config
    loadConfig();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
