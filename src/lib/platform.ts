// Platform detection utility that works in both Tauri and web environments

type SupportedPlatform =
  | 'ios'
  | 'android'
  | 'macos'
  | 'windows'
  | 'linux'
  | 'web';

let platform: SupportedPlatform = 'web';
let platformInitialized = false;

// Check if we're running in Tauri with proper plugin support
function isTauriEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    '__TAURI__' in window &&
    '__TAURI_OS_PLUGIN_INTERNALS__' in window
  );
}

// Initialize platform detection
async function initializePlatform(): Promise<void> {
  if (platformInitialized) return;

  if (isTauriEnvironment()) {
    try {
      // Use Tauri's platform detection
      const { platform: tauriPlatform } = await import('@tauri-apps/plugin-os');
      const tauriPlatformValue = tauriPlatform();

      // Map Tauri platform values to our supported platforms
      switch (tauriPlatformValue) {
        case 'ios':
        case 'android':
        case 'macos':
        case 'windows':
        case 'linux':
          platform = tauriPlatformValue;
          break;
        case 'freebsd':
        case 'openbsd':
        case 'netbsd':
        case 'solaris':
        default:
          platform = 'linux'; // Default Unix-like systems to linux
          break;
      }
    } catch (error) {
      console.warn(
        'Failed to get Tauri platform, falling back to web detection:',
        error,
      );
      platform = getWebPlatform();
    }
  } else {
    // Use web fallback
    platform = getWebPlatform();
  }

  platformInitialized = true;
}

function getWebPlatform(): SupportedPlatform {
  if (typeof window === 'undefined') return 'web';

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  if (/mac/.test(userAgent)) return 'macos';
  if (/win/.test(userAgent)) return 'windows';
  if (/linux/.test(userAgent)) return 'linux';

  return 'web';
}

export async function getPlatform(): Promise<SupportedPlatform> {
  if (!platformInitialized) {
    await initializePlatform();
  }
  return platform;
}

export async function isMobile(): Promise<boolean> {
  const currentPlatform = await getPlatform();
  return currentPlatform === 'ios' || currentPlatform === 'android';
}

export async function isWeb(): Promise<boolean> {
  const currentPlatform = await getPlatform();
  return currentPlatform === 'web';
}

// Synchronous version for immediate use (returns web as default)
export function getPlatformSync(): SupportedPlatform {
  return platform;
}

export function isMobileSync(): boolean {
  return platform === 'ios' || platform === 'android';
}

export function isWebSync(): boolean {
  return platform === 'web';
}
