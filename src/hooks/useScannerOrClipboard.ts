import { useNavigationStore } from '@/state';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPlatformSync } from '../lib/platform';
import {
  openWebBarcodeScanner,
  readClipboardText,
  requestWebPermissions,
} from '../lib/web-fallbacks';

export function useScannerOrClipboard(onScanResult: (text: string) => void) {
  const navigate = useNavigate();
  const location = useLocation();
  const { returnValues, setReturnValue } = useNavigationStore();
  const isMobile =
    getPlatformSync() === 'ios' || getPlatformSync() === 'android';

  useEffect(() => {
    const returnValue = returnValues[location.pathname];
    if (!returnValue) return;

    if (returnValue.status === 'success' && returnValue?.data) {
      onScanResult(returnValue.data);
      setReturnValue(location.pathname, { status: 'completed' });
    }
  }, [returnValues, onScanResult, location.pathname, setReturnValue]);

  const handleScanOrPaste = async () => {
    if (isMobile) {
      // Check if we're in Tauri environment
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        try {
          const { requestPermissions, openAppSettings } = await import(
            '@tauri-apps/plugin-barcode-scanner'
          );
          const permissionState = await requestPermissions();
          if (permissionState === 'denied') {
            await openAppSettings();
          } else if (permissionState === 'granted') {
            navigate('/scan', {
              state: {
                returnTo: location.pathname,
              },
            });
          }
        } catch (error) {
          console.error('Failed to access Tauri scanner:', error);
          openWebBarcodeScanner();
        }
      } else {
        // Web fallback
        const permissionState = await requestWebPermissions();
        if (permissionState === 'granted') {
          openWebBarcodeScanner();
        } else {
          alert('Camera permission is required for barcode scanning');
        }
      }
    } else {
      try {
        const clipboardText = await readClipboardText();
        if (clipboardText) {
          onScanResult(clipboardText);
        }
      } catch (error) {
        console.error('Failed to paste from clipboard:', error);
      }
    }
  };

  return { handleScanOrPaste, isMobile };
}
