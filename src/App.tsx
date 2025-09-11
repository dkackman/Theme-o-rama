import { discoverThemes, resolveThemeImage } from '@/lib/themes';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useEffect, useState } from 'react';
import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, useTheme } from 'theme-o-rama';
import { useLocalStorage } from 'usehooks-ts';
import { ErrorProvider } from './contexts/ErrorContext';
import {
  getBrowserLanguage,
  LanguageProvider,
  SupportedLanguage,
  useLanguage,
} from './contexts/LanguageContext';
import { SafeAreaProvider } from './contexts/SafeAreaContext';
import { loadCatalog } from './i18n';
import About from './pages/About';
import Components from './pages/Components';
import Dialogs from './pages/Dialogs';
import Tables from './pages/Tables';
import Themes from './pages/Themes';

// Theme-aware toast container component
function ThemeAwareToastContainer() {
  const { currentTheme } = useTheme();

  const toastTheme = currentTheme?.mostLike ?? 'light';

  return (
    <ToastContainer
      position='bottom-right'
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={toastTheme}
      transition={Slide}
      style={
        {
          '--toastify-toast-transition-timing': 'ease',
          '--toastify-toast-transition-duration': '750ms',
        } as React.CSSProperties
      }
    />
  );
}

const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<Themes />} />
      <Route path='/tables' element={<Tables />} />
      <Route path='/components' element={<Components />} />
      <Route path='/dialogs' element={<Dialogs />} />
      <Route path='/about' element={<About />} />
    </>,
  ),
);

export default function App() {
  const [locale, setLocale] = useLocalStorage<SupportedLanguage>(
    'locale',
    getBrowserLanguage,
  );

  return (
    <LanguageProvider locale={locale} setLocale={setLocale}>
      <ThemeProvider
        discoverThemes={discoverThemes}
        imageResolver={resolveThemeImage}
      >
        <SafeAreaProvider>
          <ErrorProvider>
            <AppInner />
            <ThemeAwareToastContainer />
          </ErrorProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

function AppInner() {
  const { locale } = useLanguage();
  const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);

  useEffect(() => {
    const initLocale = async () => {
      await loadCatalog(locale);
      setIsLocaleInitialized(true);
    };
    initLocale();
  }, [locale]);

  return (
    isLocaleInitialized && (
      <I18nProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nProvider>
    )
  );
}
