import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { loadConfig } from '~/state';

// Global CSS imports
import '~/index.css';

// Polyfills
import 'core-js/actual/promise/all-settled';
import 'core-js/actual/array/flat-map';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log('[Init] Starting app initialization...');
    
    // Initialize FluentUI icons
    console.log('[Init] Initializing FluentUI icons...');
    initializeIcons();
    console.log('[Init] FluentUI icons initialized');
    
    // Load config
    console.log('[Init] Loading config from localStorage...');
    loadConfig();
    console.log('[Init] Config loaded');
    
    console.log('[Init] App initialization complete');
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
