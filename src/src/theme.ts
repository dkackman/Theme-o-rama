import { Theme } from "./theme.type.js";

// Tailwind v4 variable names (--color-*, --radius-*, --shadow-*, --font-family-*)
const tailwindV4VariableNames = [
  // Colors
  "--color-background",
  "--color-foreground",
  "--color-card",
  "--color-card-foreground",
  "--color-popover",
  "--color-popover-foreground",
  "--color-primary",
  "--color-primary-foreground",
  "--color-secondary",
  "--color-secondary-foreground",
  "--color-muted",
  "--color-muted-foreground",
  "--color-accent",
  "--color-accent-foreground",
  "--color-destructive",
  "--color-destructive-foreground",
  "--color-border",
  "--color-input",
  "--color-input-background",
  "--color-ring",
  // Radius
  "--radius-none",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--radius-full",
  // Shadows (note: --shadow and --radius are duplicates, but included for completeness)
  "--shadow-none",
  "--shadow-sm",
  "--shadow",
  "--shadow-md",
  "--shadow-lg",
  "--shadow-xl",
  "--shadow-inner",
  "--shadow-card",
  "--shadow-button",
  "--shadow-dropdown",
  // Fonts
  "--font-family-sans",
  "--font-family-serif",
  "--font-family-mono",
  "--font-family-heading",
  "--font-family-body",
];

function clearThemeVariables(root: HTMLElement) {
  // Remove any existing theme classes
  const existingThemeClasses = Array.from(root.classList).filter((cls) => cls.startsWith("theme-"));
  root.classList.remove(...existingThemeClasses);

  // Clear all CSS variables to reset to defaults
  [
    ...colorVariableNames,
    ...fontVariableNames,
    ...cornerVariableNames,
    ...shadowVariableNames,
    ...themeFeatureFlagVariableNames,
    ...navigationAndButtonVariableNames,
    ...backgroundImageVariableNames,
    ...tableVariableNames,
    ...switchVariableNames,
    ...buttonVariableNames,
    ...backdropFilterVariableNames,
    ...tailwindV4VariableNames,
  ].forEach((cssVar) => {
    root.style.removeProperty(cssVar);
  });
}

function applyThemeProperties(theme: Theme, root: HTMLElement): void {
  // Set theme class for CSS selectors
  try {
    root.classList.add(`theme-${theme.name}`);
  } catch {
    root.classList.add(`theme-invalid-name`);
  }

  // Set data attributes for theme styles
  const buttonStyle = theme.buttonStyle || "";
  root.setAttribute("data-theme-style", buttonStyle);

  const colorScheme = theme.mostLike === "dark" ? "dark" : "light";
  root.style.colorScheme = colorScheme;
}

function applyBackgroundImage(theme: Theme, root: HTMLElement): void {
  if (theme.backgroundImage) {
    // Set background properties in the correct order to prevent flicker
    // Set size, position, and repeat BEFORE the image to avoid resize flicker
    root.style.setProperty("--background-size", theme.backgroundSize || "cover");
    root.style.setProperty("--background-position", theme.backgroundPosition || "center");
    root.style.setProperty("--background-repeat", theme.backgroundRepeat || "no-repeat");
    // Now set the image last so it loads with the correct size already applied
    root.style.setProperty("--background-image", `url(${theme.backgroundImage})`);
    root.classList.add("has-background-image");
  } else {
    root.classList.remove("has-background-image");
  }
}

/**
 * Generates both old and Tailwind v4 variable names directly from a theme key
 * Returns [oldName, v4Name] to avoid redundant string operations
 */
function generateVariableNames(
  key: string,
  category: "color" | "font" | "radius" | "shadow",
): [string, string] {
  // Convert camelCase to kebab-case
  const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();

  let oldName: string;
  let v4Name: string;

  switch (category) {
    case "color": {
      // Colors: background -> --background and --color-background
      oldName = `--${kebabKey}`;
      v4Name = `--color-${kebabKey}`;
      break;
    }
    case "font": {
      // Fonts: sans -> --font-sans and --font-family-sans
      oldName = `--font-${kebabKey}`;
      v4Name = `--font-family-${kebabKey}`;
      break;
    }
    case "radius": {
      // Radius: sm -> --corner-sm and --radius-sm
      oldName = `--corner-${kebabKey}`;
      v4Name = `--radius-${kebabKey}`;
      break;
    }
    case "shadow": {
      // Shadows: sm -> --shadow-sm (same for both)
      oldName = `--shadow-${kebabKey}`;
      v4Name = oldName; // Shadows already use correct format
      break;
    }
    default: {
      oldName = `--${kebabKey}`;
      v4Name = oldName;
    }
  }

  return [oldName, v4Name];
}

function applyMappedVariables(theme: Theme, root: HTMLElement): void {
  // Sets BOTH old and new (Tailwind v4) naming conventions directly
  // Optimized to generate both names in one pass
  const variableMappings: Array<{
    themeObj: Record<string, string | null | undefined> | undefined;
    category: "color" | "font" | "radius" | "shadow";
  }> = [
    { themeObj: theme.colors, category: "color" },
    { themeObj: theme.fonts, category: "font" },
    { themeObj: theme.corners, category: "radius" },
    { themeObj: theme.shadows, category: "shadow" },
  ];

  variableMappings.forEach(({ themeObj, category }) => {
    if (themeObj) {
      Object.entries(themeObj).forEach(([key, value]) => {
        // Filter out null, undefined, and empty string values
        if (value && typeof value === "string") {
          // Generate both variable names directly from the key
          const [oldName, v4Name] = generateVariableNames(key, category);
          root.style.setProperty(oldName, value);
          // Only set v4 name if it's different (shadows are the same)
          if (oldName !== v4Name) {
            root.style.setProperty(v4Name, value);
          }
        }
      });
    }
  });

  if (theme.colors) {
    const backdropFilterMap: Record<string, string> = {};
    ["cardBackdropFilter", "popoverBackdropFilter", "inputBackdropFilter"].forEach((base) => {
      const cssVar = `--${base.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      backdropFilterMap[`${base}`] = cssVar;
    });

    Object.entries(backdropFilterMap).forEach(([themeKey, cssVar]) => {
      const value = theme.colors?.[themeKey as keyof typeof theme.colors];
      if (value) {
        root.style.setProperty(cssVar, value);
        // Note: backdrop-filter variables don't have Tailwind v4 equivalents
        // They remain as custom variables
      }
    });
  }
}

function applyTableVariables(theme: Theme, root: HTMLElement): void {
  if (theme.tables) {
    const tableSections = [
      {
        obj: theme.tables,
        prefix: "table",
        properties: ["background", "border", "borderRadius", "boxShadow"],
      },
      {
        obj: theme.tables.header,
        prefix: "table-header",
        properties: ["background", "color", "border", "backdropFilter"],
      },
      {
        obj: theme.tables.row,
        prefix: "table-row",
        properties: ["background", "color", "border", "backdropFilter"],
      },
      {
        obj: theme.tables.row?.hover,
        prefix: "table-row-hover",
        properties: ["background", "color"],
      },
      {
        obj: theme.tables.row?.selected,
        prefix: "table-row-selected",
        properties: ["background", "color"],
      },
      {
        obj: theme.tables.cell,
        prefix: "table-cell",
        properties: ["border"],
      },
      {
        obj: theme.tables.footer,
        prefix: "table-footer",
        properties: ["background", "color", "border", "backdropFilter"],
      },
    ];

    tableSections.forEach(({ obj, prefix, properties }) => {
      if (obj) {
        properties.forEach((property) => {
          const value = (obj as Record<string, unknown>)[property];
          if (value && typeof value === "string") {
            const cssVar = `--${prefix}-${property.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
            root.style.setProperty(cssVar, value);

            // For backdropFilter properties, also set the webkit version
            if (property === "backdropFilter") {
              const webkitCssVar = `${cssVar}-webkit`;
              root.style.setProperty(webkitCssVar, value);
            }
          }
        });
      }
    });
  }
}

function applySidebarVariables(theme: Theme, root: HTMLElement): void {
  if (theme.sidebar) {
    const sidebarProperties = ["background", "backdropFilter", "border"];

    sidebarProperties.forEach((property) => {
      const value = (theme.sidebar as Record<string, unknown>)[property];
      if (value && typeof value === "string") {
        const cssVar = `--sidebar-${property.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.setProperty(cssVar, value);

        if (property === "backdropFilter") {
          const webkitCssVar = `${cssVar}-webkit`;
          root.style.setProperty(webkitCssVar, value);
        }
      }
    });
  }
}

function applyButtonVariables(theme: Theme, root: HTMLElement): void {
  if (theme.buttons) {
    const propertyToCssMap = {
      background: "background",
      color: "color",
      border: "border",
      borderStyle: "border-style",
      borderWidth: "border-width",
      borderColor: "border-color",
      borderRadius: "radius",
      boxShadow: "shadow",
      backdropFilter: "backdrop-filter",
    };

    Object.entries(theme.buttons).forEach(([variant, config]) => {
      if (config) {
        // Apply base styles
        Object.entries(propertyToCssMap).forEach(([property, cssName]) => {
          const value = config[property as keyof typeof config];
          if (value && typeof value === "string") {
            root.style.setProperty(`--btn-${variant}-${cssName}`, value);
          }
        });

        // Apply hover and active states using the same mapping
        ["hover", "active"].forEach((state) => {
          const stateConfig = config[state as keyof typeof config];
          if (stateConfig && typeof stateConfig === "object") {
            Object.entries(propertyToCssMap).forEach(([property, baseCssName]) => {
              const value = (stateConfig as Record<string, unknown>)[property];
              if (value && typeof value === "string") {
                const cssName = `${state}-${baseCssName}`;
                root.style.setProperty(`--btn-${variant}-${cssName}`, value);
              }
            });

            // Handle transform property specifically for hover/active states
            const transform = (stateConfig as Record<string, unknown>).transform;
            if (transform && typeof transform === "string") {
              root.style.setProperty(`--btn-${variant}-${state}-transform`, transform);
            }
          }
        });
      }
    });
  }

  const buttonStyle = theme.buttonStyle || "";
  const buttonStyleMap = {
    gradient: "gradient-buttons",
    shimmer: "shimmer-effects",
    "pixel-art": "pixel-art",
    "3d-effects": "3d-effects",
    "rounded-buttons": "rounded-buttons",
  };

  // Set CSS variables for button style flags
  Object.entries(buttonStyleMap).forEach(([style, cssName]) => {
    root.style.setProperty(`--theme-has-${cssName}`, buttonStyle === style ? "1" : "0");
  });

  // SSR-safe: Only set body attribute in browser environment
  if (typeof document !== "undefined" && root) {
    root.setAttribute("data-theme-style", buttonStyle);
  }
}

function applyOtherControlVariables(theme: Theme, root: HTMLElement): void {
  if (theme.colors?.inputBackground) {
    root.style.setProperty("--input-background", theme.colors.inputBackground || "");
  } else if (theme.colors?.input) {
    // For other themes, use the regular input color
    root.style.setProperty("--input-background", theme.colors.input || "");
  }

  if (theme.switches) {
    const switchStates = ["checked", "unchecked"] as const;

    switchStates.forEach((state) => {
      const switchConfig = theme.switches?.[state];
      if (switchConfig?.background) {
        root.style.setProperty(`--switch-${state}-background`, switchConfig.background);
      }
    });

    // Handle switch thumb background
    if (theme.switches.thumb?.background) {
      root.style.setProperty("--switch-thumb-background", theme.switches.thumb.background);
    }
  }
}

export function applyTheme(theme: Theme, root: HTMLElement) {
  clearThemeVariables(root);
  applyThemeProperties(theme, root);
  applyMappedVariables(theme, root);
  applyBackgroundImage(theme, root);
  applyTableVariables(theme, root);
  applySidebarVariables(theme, root);
  applyButtonVariables(theme, root);
  applyOtherControlVariables(theme, root);

  // Apply document-wide background image handling for main theme (SSR-safe)
  // Apply to html instead of body so it's fixed to viewport, not content height
  if (typeof document !== "undefined" && root) {
    if (theme.backgroundImage) {
      // Set all background properties atomically to prevent flicker
      // Set size, position, and repeat BEFORE the image to avoid resize flicker
      root.style.backgroundSize = theme.backgroundSize || "cover";
      root.style.backgroundPosition = theme.backgroundPosition || "center";
      root.style.backgroundRepeat = theme.backgroundRepeat || "no-repeat";
      // Use fixed attachment so background stays relative to viewport, not content
      root.style.backgroundAttachment = "fixed";
      // Now set the image last so it loads with the correct size already applied
      root.style.backgroundImage = `url(${theme.backgroundImage})`;
      root.classList.add("has-background-image");
    } else {
      root.classList.remove("has-background-image");
      // Clear properties in order to prevent flicker
      root.style.backgroundImage = "";
      root.style.backgroundSize = "";
      root.style.backgroundPosition = "";
      root.style.backgroundRepeat = "";
      root.style.backgroundAttachment = "";
    }
  }
}

export function applyThemeIsolated(theme: Theme, root: HTMLElement): void {
  clearThemeVariables(root);
  applyThemeProperties(theme, root);
  applyMappedVariables(theme, root);

  applyTableVariables(theme, root);
  applySidebarVariables(theme, root);
  applyButtonVariables(theme, root);
  applyOtherControlVariables(theme, root);

  // Note: Tailwind v4 variable mappings are now set directly in applyMappedVariables
  // No need for separate mapping step

  // apply background image directly to the root element
  root.classList.remove("has-background-image");
  if (theme.backgroundImage) {
    // Set background properties in the correct order to prevent flicker
    // Set size, position, and repeat BEFORE the image to avoid resize flicker
    root.style.backgroundSize = theme.backgroundSize || "cover";
    root.style.backgroundPosition = theme.backgroundPosition || "center";
    root.style.backgroundRepeat = theme.backgroundRepeat || "no-repeat";
    root.classList.add("has-background-image");
    root.style.backgroundImage = `url(${theme.backgroundImage})`;
  }

  // Set explicit background and text colors for complete isolation
  if (theme.colors?.background) {
    root.style.backgroundColor = theme.colors.background;
  }
  if (theme.colors?.foreground) {
    root.style.color = theme.colors.foreground;
  }
  // Set explicit font-family to override inherited fonts from ambient theme
  // Fonts are inherited properties, so we need to explicitly set them on the root
  if (theme.fonts?.body) {
    root.style.fontFamily = theme.fonts.body;
  } else if (theme.fonts?.sans) {
    root.style.fontFamily = theme.fonts.sans;
  }
}

const colorVariableNames = [
  "--theme-color",
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--input-background",
  "--ring",
];

const fontVariableNames = [
  "--font-sans",
  "--font-serif",
  "--font-mono",
  "--font-heading",
  "--font-body",
];

const cornerVariableNames = [
  "--corner-none",
  "--corner-sm",
  "--corner-md",
  "--corner-lg",
  "--corner-xl",
  "--corner-full",
];

const shadowVariableNames = [
  "--shadow-none",
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
  "--shadow-xl",
  "--shadow-inner",
  "--shadow-card",
  "--shadow-button",
  "--shadow-dropdown",
];

const themeFeatureFlagVariableNames = [
  "--theme-has-gradient-buttons",
  "--theme-has-shimmer-effects",
  "--theme-has-pixel-art",
  "--theme-has-3d-effects",
  "--theme-has-rounded-buttons",
];

const navigationAndButtonVariableNames = ["--outline-button-background", "--nav-active-background"];

const backgroundImageVariableNames = [
  "--background-image",
  "--background-size",
  "--background-position",
  "--background-repeat",
];

const tableVariableNames = [
  "--table-background",
  "--table-border",
  "--table-box-shadow",
  "--table-header-background",
  "--table-header-color",
  "--table-header-border",
  "--table-row-background",
  "--table-row-color",
  "--table-row-border",
  "--table-row-hover-background",
  "--table-row-hover-color",
  "--table-row-selected-background",
  "--table-row-selected-color",
  "--table-cell-border",
  "--table-footer-background",
  "--table-footer-color",
  "--table-footer-border",
];

const switchVariableNames = [
  "--switch-checked-background",
  "--switch-unchecked-background",
  "--switch-thumb-background",
];

const backdropFilterVariableNames = [
  "--card-backdrop-filter",
  "--card-backdrop-filter-webkit",
  "--popover-backdrop-filter",
  "--popover-backdrop-filter-webkit",
  "--input-backdrop-filter",
  "--input-backdrop-filter-webkit",
  "--sidebar-backdrop-filter",
  "--sidebar-backdrop-filter-webkit",
  "--table-header-backdrop-filter",
  "--table-header-backdrop-filter-webkit",
  "--table-footer-backdrop-filter",
  "--table-footer-backdrop-filter-webkit",
  "--table-row-backdrop-filter",
  "--table-row-backdrop-filter-webkit",
];

const buttonBaseVariableNames = [
  "background",
  "color",
  "border",
  "border-style",
  "border-width",
  "border-color",
  "radius",
  "shadow",
  "backdrop-filter",
  "hover-background",
  "hover-color",
  "hover-transform",
  "hover-border-style",
  "hover-border-color",
  "hover-shadow",
  "active-background",
  "active-color",
  "active-transform",
  "active-border-style",
  "active-border-color",
  "active-shadow",
];

// Generate all button variable combinations
const buttonVariableNames = [
  "default",
  "outline",
  "secondary",
  "destructive",
  "ghost",
  "link",
].flatMap((variant) => buttonBaseVariableNames.map((baseName) => `--btn-${variant}-${baseName}`));
