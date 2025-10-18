import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Theme-o-rama Next.js Test',
  description: 'Testing theme-o-rama library in Next.js App Router',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Default theme for SSR - will be overridden on client
  const defaultTheme = 'light';

  const blockingScript = `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.className='theme-'+t;document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t==='dark'?'dark':'light'}catch(e){console.error('Theme init error:',e)}})();`;

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* Blocking script to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: blockingScript }} />
      </head>
      <body>
        <Providers initialTheme={defaultTheme}>{children}</Providers>
      </body>
    </html>
  );
}
