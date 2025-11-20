import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dbg<T>(value: T): T {
  console.log(value);
  return value;
}

export function formatTimestamp(
  timestamp: number | null,
  dateStyle = "medium",
  timeStyle: string = dateStyle,
): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000); // Convert from Unix timestamp to JavaScript timestamp
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: dateStyle as "full" | "long" | "medium" | "short",
    timeStyle: timeStyle as "full" | "long" | "medium" | "short",
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
  return filename.trim().length > 0 && !invalidChars.test(filename) && !hasControlChars(filename);
};

export function isValidUrl(str: string) {
  try {
    // only allow http(s) schemes, not file, ftp, wss etc
    const trimmed = str.trimStart().toLowerCase();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(str);
      // since this is used for nft links, we don't want to allow localhost,
      // or 127.0.0.1 to prevent links to local resources
      return url.hostname.toLowerCase() !== "localhost" && url.hostname !== "127.0.0.1";
    }
  } catch {
    return false;
  }
}

export const rgbToHsl = (r: number, g: number, b: number) => {
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
};

export function isTauriEnvironment() {
  return (
    typeof window !== "undefined" &&
    (!!(window as unknown as { __TAURI__: boolean }).__TAURI__ ||
      !!(window as unknown as { __TAURI_INTERNALS__: boolean }).__TAURI_INTERNALS__ ||
      typeof (window as unknown as { __TAURI_PLUGIN_INTERNALS__: boolean })
        .__TAURI_PLUGIN_INTERNALS__ !== "undefined" ||
      typeof (window as unknown as { __TAURI_METADATA__: boolean }).__TAURI_METADATA__ !==
        "undefined")
  );
}
