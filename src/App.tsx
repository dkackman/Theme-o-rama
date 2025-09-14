import { createDiscoverThemes, resolveThemeImage } from '@/lib/themes';
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

// Import theme modules at app level for HMR support
const themeModules = import.meta.glob('./themes/*/theme.json', {
  eager: true,
});

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

export default function App() {
  // Create the discovery function with HMR-friendly imports
  const discoverThemes = createDiscoverThemes(themeModules);

  return (
    <ThemeProvider
      discoverThemes={discoverThemes}
      imageResolver={resolveThemeImage}
      themeModules={themeModules}
    >
      <ErrorProvider>
        <RouterProvider router={router} />
        <ThemeAwareToastContainer />
      </ErrorProvider>
    </ThemeProvider>
  );
}
