import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  // Blocking script to prevent FOUC (Flash of Unstyled Content)
  const blockingScript = `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.className='theme-'+t;document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t==='dark'?'dark':'light'}catch(e){console.error('Theme init error:',e)}})();`;

  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        {/* Blocking script to prevent FOUC - must be in <Head> for Pages Router */}
        <script dangerouslySetInnerHTML={{ __html: blockingScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
