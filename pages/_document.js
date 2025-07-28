import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dodo Ensemble" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      <body>
        <style>{`
          html, body {
            min-height: 100vh;
            background: linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%);
            margin: 0;
            padding: 0;
          }
        `}</style>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
