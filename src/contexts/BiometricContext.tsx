import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { getPlatformSync } from '../lib/platform';

export interface BiometricContextType {
  enabled: boolean;
  available: boolean;
  promptIfEnabled: () => Promise<boolean>;
  enableIfAvailable: () => Promise<void>;
  disable: () => Promise<void>;
}

export const BiometricContext = createContext<BiometricContextType | undefined>(
  undefined,
);

const isMobile = getPlatformSync() === 'ios' || getPlatformSync() === 'android';

// It's unclear why this causes a crash if inside of the BiometricProvider useEffect,
// but it does - so moving it out here is a workaround for the issue until it's properly
// investigated.
const status = isMobile
  ? (async () => {
      try {
        const { checkStatus, BiometryType } = await import(
          '@tauri-apps/plugin-biometric'
        );
        return await checkStatus();
      } catch (error) {
        console.warn('Biometric plugin not available:', error);
        return { isAvailable: false, biometryType: 'None' as any };
      }
    })()
  : Promise.resolve({ isAvailable: false, biometryType: 'None' as any });

export function BiometricProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useLocalStorage('biometric', false);
  const [available, setAvailable] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<number | null>(null);

  useEffect(() => {
    if (!isMobile) return;

    status.then((status) =>
      setAvailable(status.isAvailable && status.biometryType !== 'None'),
    );
  }, []);

  const promptIfEnabled = useCallback(async () => {
    const now = performance.now();

    // Required every 5 minutes
    if (enabled && (lastPrompt === null || now - lastPrompt >= 1000 * 300)) {
      try {
        const { authenticate } = await import('@tauri-apps/plugin-biometric');
        await authenticate('Authenticate with biometric', {
          allowDeviceCredential: false,
        });
        setLastPrompt(now);
        return true;
      } catch (error) {
        console.warn('Biometric authentication failed:', error);
        return false;
      }
    }

    return true;
  }, [enabled, lastPrompt]);

  const enableIfAvailable = useCallback(async () => {
    if (!available) return;

    try {
      const { authenticate } = await import('@tauri-apps/plugin-biometric');
      await authenticate('Enable biometric authentication');
      setEnabled(true);
    } catch (error) {
      console.warn('Failed to enable biometric authentication:', error);
    }
  }, [available, setEnabled]);

  const disable = useCallback(async () => {
    if (available) {
      try {
        const { authenticate } = await import('@tauri-apps/plugin-biometric');
        await authenticate('Disable biometric authentication');
      } catch (error) {
        console.warn('Failed to disable biometric authentication:', error);
      }
    }

    setEnabled(false);
  }, [available, setEnabled]);

  return (
    <BiometricContext.Provider
      value={{
        enabled,
        available,
        promptIfEnabled,
        enableIfAvailable,
        disable,
      }}
    >
      {children}
    </BiometricContext.Provider>
  );
}
