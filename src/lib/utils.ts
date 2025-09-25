import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dbg<T>(value: T): T {
  console.log(value);
  return value;
}

export function makeValidFileName(filename: string): string {
  const validFilename = filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (validFilename.length === 0) {
    return 'my-custom-theme';
  }
  return validFilename;
}

export function formatTimestamp(
  timestamp: number | null,
  dateStyle = 'medium',
  timeStyle: string = dateStyle,
): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000); // Convert from Unix timestamp to JavaScript timestamp
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: dateStyle as 'full' | 'long' | 'medium' | 'short',
    timeStyle: timeStyle as 'full' | 'long' | 'medium' | 'short',
  }).format(date);
}

export function isValidUrl(str: string) {
  try {
    // only allow http(s) schemes, not file, ftp, wss etc
    const trimmed = str.trimStart().toLowerCase();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(str);
      // since this is used for nft links, we don't want to allow localhost,
      // or 127.0.0.1 to prevent links to local resources
      return (
        url.hostname.toLowerCase() !== 'localhost' &&
        url.hostname !== '127.0.0.1'
      );
    }
  } catch {
    return false;
  }
}

export function hslToRgb(themeColor: string) {
  const hslMatch = themeColor.match(/hsl\((\d+)[,\s]+(\d+)%[,\s]+(\d+)%\)/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]);
    const l = parseInt(hslMatch[3]);

    // Convert HSL to RGB
    const c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l / 100 - c / 2;

    let r, g, b;
    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  return null;
}

export function areColorsEqual(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
): boolean {
  return (
    Math.abs(color1.r - color2.r) <= 1 &&
    Math.abs(color1.g - color2.g) <= 1 &&
    Math.abs(color1.b - color2.b) <= 1
  );
}

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function isTauriEnvironment() {
  return (
    typeof window !== 'undefined' &&
    (!!(window as unknown as { __TAURI__: boolean }).__TAURI__ ||
      !!(window as unknown as { __TAURI_INTERNALS__: boolean })
        .__TAURI_INTERNALS__ ||
      typeof (window as unknown as { __TAURI_PLUGIN_INTERNALS__: boolean })
        .__TAURI_PLUGIN_INTERNALS__ !== 'undefined' ||
      typeof (window as unknown as { __TAURI_METADATA__: boolean })
        .__TAURI_METADATA__ !== 'undefined')
  );
}

// Helper function to save data URI image to file
export function saveDataUriAsFile(
  dataUri: string,
  filename = 'image.png',
): void {
  try {
    // Extract the base64 data from the data URI
    const base64Data = dataUri.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid data URI format');
    }

    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Determine MIME type from data URI
    const mimeType = dataUri.split(',')[0].split(':')[1].split(';')[0];
    const blob = new Blob([byteArray], { type: mimeType });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
}
