// Web fallbacks for Tauri-specific APIs

// Platform detection fallback
type SupportedPlatform =
  | 'ios'
  | 'android'
  | 'macos'
  | 'windows'
  | 'linux'
  | 'web';

export function getPlatform(): SupportedPlatform {
  if (typeof window === 'undefined') return 'web';

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  if (/mac/.test(userAgent)) return 'macos';
  if (/win/.test(userAgent)) return 'windows';
  if (/linux/.test(userAgent)) return 'linux';

  return 'web';
}

// Clipboard fallback
export async function readClipboardText(): Promise<string> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.warn('Failed to read clipboard:', error);
      return '';
    }
  }
  return '';
}

export async function writeClipboardText(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.warn('Failed to write to clipboard:', error);
    }
  }
}

// Safe area insets fallback
export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function getWebSafeAreaInsets(): Insets {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  // Use CSS env() values if available
  const computedStyle = getComputedStyle(document.documentElement);
  const top = parseInt(
    computedStyle.getPropertyValue('--safe-area-inset-top') || '0',
  );
  const bottom = parseInt(
    computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0',
  );
  const left = parseInt(
    computedStyle.getPropertyValue('--safe-area-inset-left') || '0',
  );
  const right = parseInt(
    computedStyle.getPropertyValue('--safe-area-inset-right') || '0',
  );

  return { top, bottom, left, right };
}

// Barcode scanner fallback - redirect to a web-based scanner
export function openWebBarcodeScanner(): void {
  // You could integrate with a web-based barcode scanner library
  // For now, we'll just show an alert
  alert(
    'Barcode scanning is not available in web version. Please use a mobile device or desktop app.',
  );
}

// Permission request fallback
export async function requestWebPermissions(): Promise<
  'granted' | 'denied' | 'prompt'
> {
  if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
    try {
      const result = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch (error) {
      console.warn('Failed to check permissions:', error);
      return 'prompt';
    }
  }
  return 'prompt';
}
