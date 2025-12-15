import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Flow Runner" />
      </Head>
      <body>
        <div id="root">
          <div className="app-preloader">
            <div className="app-preloader__container">
              <div><img src="/flow.svg" alt="Flow Logo" /></div>
              <div className="app-preloader__content">
                <noscript>
                  <p>You need to enable JavaScript to run this app.</p>
                  <style>{`
                    .app-preloader__label {
                      display: none;
                    }
                    .app-preloader-progress {
                      display: none;
                    }
                  `}</style>
                </noscript>
                <p className="app-preloader__label">Loading runner...</p>
                <div className="app-preloader-progress">
                  <div className="app-preloader-progress__bar app-preloader-progress__bar--indeterminate"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
