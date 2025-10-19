import { LAST_NON_CORE_THEME_KEY, THEME_STORAGE_KEY } from '@/lib/constants';
import { discoverThemes, resolveThemeImage } from '@/lib/themes';
import { useCallback, useEffect } from 'react';
import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, useTheme } from 'theme-o-rama';
import { ErrorProvider } from './contexts/ErrorContext';
import About from './pages/About';
import Components from './pages/Components';
import Dialogs from './pages/Dialogs';
import Tables from './pages/Tables';
import ThemePreview from './pages/ThemePreview';
import Themes from './pages/Themes';

// One-time migration for legacy dark mode preference
function useLegacyDarkModeMigration() {
  useEffect(() => {
    try {
      const oldDark = localStorage.getItem('dark');
      const currentTheme = localStorage.getItem(THEME_STORAGE_KEY);

      // Migrate old dark mode setting if exists and no theme is set
      if (oldDark === 'true' && !currentTheme) {
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
        console.log('Migrated legacy dark mode preference to theme');
      }

      // Clean up old dark preference after migration
      if (oldDark !== null && currentTheme) {
        localStorage.removeItem('dark');
        console.log('Cleaned up legacy dark mode preference');
      }
    } catch (error) {
      console.warn('Failed to migrate legacy dark mode preference:', error);
    }
  }, []);
}

// Deprecation warning banner component
function DeprecationWarning() {
  return (
    <div className='bg-amber-100 border-b border-amber-200 px-4 py-3 text-amber-800'>
      <div className='flex items-center justify-center space-x-2'>
        <svg
          className='h-5 w-5 text-amber-600'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
            clipRule='evenodd'
          />
        </svg>
        <span className='font-medium'>This app is deprecated</span>
        <span>•</span>
        <a
          href='https://dkackman.github.io/theme-a-roo/'
          target='_blank'
          rel='noopener noreferrer'
          className='text-amber-700 underline hover:text-amber-900 font-medium'
        >
          Try Theme-a-roo instead →
        </a>
      </div>
    </div>
  );
}

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
      <Route path='/theme-preview' element={<ThemePreview />} />
    </>,
  ),
);

// App content with migration
function AppContent() {
  // Run legacy dark mode migration on mount
  useLegacyDarkModeMigration();

  return (
    <>
      <DeprecationWarning />
      <RouterProvider router={router} />
      <ThemeAwareToastContainer />
    </>
  );
}

export default function App() {
  // Read initial theme from localStorage
  const defaultTheme = (() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    } catch {
      return 'light';
    }
  })();

  // Handle theme changes - save to localStorage
  const handleThemeChange = useCallback((themeName: string) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeName);

      // Save as last used non-core theme if it's not light or dark
      if (themeName !== 'light' && themeName !== 'dark') {
        localStorage.setItem(LAST_NON_CORE_THEME_KEY, themeName);
      }
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  return (
    <ThemeProvider
      discoverThemes={discoverThemes}
      imageResolver={resolveThemeImage}
      defaultTheme={defaultTheme}
      onThemeChange={handleThemeChange}
    >
      <ErrorProvider>
        <AppContent />
      </ErrorProvider>
    </ThemeProvider>
  );
}
