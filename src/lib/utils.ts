import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dbg<T>(value: T): T {
  console.log(value);
  return value;
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

export const isValidFilename = (filename: string): boolean => {
  // Check for invalid characters and ensure it's not empty
  const invalidChars = /[<>:"/\\|?*]/;
  // Check for control characters (ASCII 0-31)
  const hasControlChars = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode <= 31) {
        return true;
      }
    }
    return false;
  };
  return (
    filename.trim().length > 0 &&
    !invalidChars.test(filename) &&
    !hasControlChars(filename)
  );
};

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

export function isValidAssetId(assetId: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(assetId);
}

function sanitizeHex(hex: string): string {
  return hex.replace(/0x/i, '');
}

const HEX_STRINGS = '0123456789abcdef';
const MAP_HEX: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
};

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => HEX_STRINGS[b >> 4] + HEX_STRINGS[b & 15])
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor(hex.length / 2));
  let i;
  for (i = 0; i < bytes.length; i++) {
    const a = MAP_HEX[hex[i * 2]];
    const b = MAP_HEX[hex[i * 2 + 1]];
    if (a === undefined || b === undefined) {
      break;
    }
    bytes[i] = (a << 4) | b;
  }
  return i === bytes.length ? bytes : bytes.slice(0, i);
}

export function decodeHexMessage(hexMessage: string): string {
  return new TextDecoder().decode(fromHex(sanitizeHex(hexMessage)));
}

export function isHex(str: string): boolean {
  return /^(0x)?[0-9a-fA-F]+$/.test(str);
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
