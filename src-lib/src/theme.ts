import { Theme } from './theme.type';

function applyCommonThemeProperties(theme: Theme, root: HTMLElement): void {
  // Set theme class for CSS selectors
  try {
    root.classList.add(`theme-${theme.name}`);
  } catch {
    root.classList.add(`theme-invalid-name}`);
  }

  // Set data attributes for theme styles
  const buttonStyle = theme.buttonStyle || '';
  root.setAttribute('data-theme-styles', buttonStyle);

  if (theme.backgroundImage) {
    root.style.setProperty(
      '--background-image',
      `url(${theme.backgroundImage})`,
    );

    const backgroundSize = theme.backgroundSize || 'cover';
    root.style.setProperty('--background-size', backgroundSize);

    const backgroundPosition = theme.backgroundPosition || 'center';
    root.style.setProperty('--background-position', backgroundPosition);

    const backgroundRepeat = theme.backgroundRepeat || 'no-repeat';
    root.style.setProperty('--background-repeat', backgroundRepeat);

    root.classList.add('has-background-image');
  } else {
    root.style.removeProperty('--background-image');
    root.style.removeProperty('--background-size');
    root.style.removeProperty('--background-position');
    root.style.removeProperty('--background-repeat');
    root.classList.remove('has-background-image');
  }
}

function applyThemeVariables(theme: Theme, root: HTMLElement): void {
  // Apply color-scheme based on mostLike property
  if (theme.mostLike) {
    root.style.setProperty(
      'color-scheme',
      theme.mostLike === 'light' ? 'dark' : 'light',
      'important',
    );
  } else {
    root.style.removeProperty('color-scheme');
  }
  // Create mappings from theme properties to CSS variables
  const variableMappings = [
    {
      themeObj: theme.colors,
      transform: (key: string) =>
        `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
    },
    { themeObj: theme.fonts, transform: (key: string) => `--font-${key}` },
    { themeObj: theme.corners, transform: (key: string) => `--corner-${key}` },
    { themeObj: theme.shadows, transform: (key: string) => `--shadow-${key}` },
  ];

  variableMappings.forEach(({ themeObj, transform }) => {
    if (themeObj) {
      Object.entries(themeObj).forEach(([key, value]) => {
        if (value) {
          const cssVar = transform(key);
          root.style.setProperty(cssVar, value);
        }
      });
    }
  });
}

export function applyTheme(theme: Theme, root: HTMLElement) {
  // Remove any existing theme classes
  const existingThemeClasses = Array.from(root.classList).filter((cls) =>
    cls.startsWith('theme-'),
  );
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
    ...backdropFilterVariableNames,
    ...buttonVariableNames,
  ].forEach((cssVar) => {
    root.style.removeProperty(cssVar);
  });
  applyThemeVariables(theme, root);

  // Apply backdrop-filter variables if defined in colors object
  if (theme.colors) {
    const backdropFilterMap: Record<string, string> = {};
    [
      'cardBackdropFilter',
      'popoverBackdropFilter',
      'inputBackdropFilter',
    ].forEach((base) => {
      const cssVar = `--${base.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      backdropFilterMap[`${base}`] = cssVar;
    });

    Object.entries(backdropFilterMap).forEach(([themeKey, cssVar]) => {
      const value = theme.colors?.[themeKey as keyof typeof theme.colors];
      if (value) {
        root.style.setProperty(cssVar, value);
      }
    });
  }

  // Apply theme-specific input background if defined
  if (theme.colors?.inputBackground) {
    root.style.setProperty(
      '--input-background',
      theme.colors.inputBackground || '',
    );
  } else if (theme.colors?.input) {
    // For other themes, use the regular input color
    root.style.setProperty('--input-background', theme.colors.input || '');
  }
  // If neither is defined, CSS defaults will be used

  if (theme.buttons) {
    const propertyToCssMap = {
      background: 'background',
      color: 'color',
      border: 'border',
      borderStyle: 'border-style',
      borderWidth: 'border-width',
      borderColor: 'border-color',
      borderRadius: 'radius',
      boxShadow: 'shadow',
      backdropFilter: 'backdrop-filter',
    };

    Object.entries(theme.buttons).forEach(([variant, config]) => {
      if (config) {
        // Apply base styles
        Object.entries(propertyToCssMap).forEach(([property, cssName]) => {
          const value = config[property as keyof typeof config];
          if (value && typeof value === 'string') {
            root.style.setProperty(`--btn-${variant}-${cssName}`, value);
          }
        });

        // Apply hover and active states using the same mapping
        ['hover', 'active'].forEach((state) => {
          const stateConfig = config[state as keyof typeof config];
          if (stateConfig && typeof stateConfig === 'object') {
            Object.entries(propertyToCssMap).forEach(
              ([property, baseCssName]) => {
                const value = (stateConfig as Record<string, unknown>)[
                  property
                ];
                if (value && typeof value === 'string') {
                  const cssName = `${state}-${baseCssName}`;
                  root.style.setProperty(`--btn-${variant}-${cssName}`, value);
                }
              },
            );

            // Handle transform property specifically for hover/active states
            const transform = (stateConfig as Record<string, unknown>)
              .transform;
            if (transform && typeof transform === 'string') {
              root.style.setProperty(
                `--btn-${variant}-${state}-transform`,
                transform,
              );
            }
          }
        });
      }
    });
  }

  const buttonStyle = theme.buttonStyle || '';
  const buttonStyleMap = {
    gradient: 'gradient-buttons',
    shimmer: 'shimmer-effects',
    'pixel-art': 'pixel-art',
    '3d-effects': '3d-effects',
    'rounded-buttons': 'rounded-buttons',
  };

  // Set CSS variables for button style flags
  Object.entries(buttonStyleMap).forEach(([style, cssName]) => {
    root.style.setProperty(
      `--theme-has-${cssName}`,
      buttonStyle === style ? '1' : '0',
    );
  });

  document.body.setAttribute('data-theme-styles', buttonStyle);

  if (theme.tables) {
    const tableSections = [
      {
        obj: theme.tables,
        prefix: 'table',
        properties: ['background', 'border', 'borderRadius', 'boxShadow'],
      },
      {
        obj: theme.tables.header,
        prefix: 'table-header',
        properties: ['background', 'color', 'border', 'backdropFilter'],
      },
      {
        obj: theme.tables.row,
        prefix: 'table-row',
        properties: ['background', 'color', 'border', 'backdropFilter'],
      },
      {
        obj: theme.tables.row?.hover,
        prefix: 'table-row-hover',
        properties: ['background', 'color'],
      },
      {
        obj: theme.tables.row?.selected,
        prefix: 'table-row-selected',
        properties: ['background', 'color'],
      },
      {
        obj: theme.tables.cell,
        prefix: 'table-cell',
        properties: ['border'],
      },
      {
        obj: theme.tables.footer,
        prefix: 'table-footer',
        properties: ['background', 'color', 'border', 'backdropFilter'],
      },
    ];

    tableSections.forEach(({ obj, prefix, properties }) => {
      if (obj) {
        properties.forEach((property) => {
          const value = (obj as Record<string, unknown>)[property];
          if (value && typeof value === 'string') {
            const cssVar = `--${prefix}-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVar, value);

            // For backdropFilter properties, also set the webkit version
            if (property === 'backdropFilter') {
              const webkitCssVar = `${cssVar}-webkit`;
              root.style.setProperty(webkitCssVar, value);
            }
          }
        });
      }
    });
  }

  if (theme.sidebar) {
    const sidebarProperties = ['background', 'backdropFilter', 'border'];

    sidebarProperties.forEach((property) => {
      const value = (theme.sidebar as Record<string, unknown>)[property];
      if (value && typeof value === 'string') {
        const cssVar = `--sidebar-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVar, value);

        if (property === 'backdropFilter') {
          const webkitCssVar = `${cssVar}-webkit`;
          root.style.setProperty(webkitCssVar, value);
        }
      }
    });
  }

  // Apply common theme properties (background image, classes, etc.)
  applyCommonThemeProperties(theme, root);

  // Apply document-wide background image handling for main theme
  if (theme.backgroundImage) {
    document.body.classList.add('has-background-image');
    // Also set the background image directly on the body
    document.body.style.backgroundImage = `url(${theme.backgroundImage})`;
    document.body.style.backgroundSize = theme.backgroundSize || 'cover';
    document.body.style.backgroundPosition =
      theme.backgroundPosition || 'center';
    document.body.style.backgroundRepeat =
      theme.backgroundRepeat || 'no-repeat';
  } else {
    document.body.classList.remove('has-background-image');
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
  }

  if (theme.switches) {
    const switchStates = ['checked', 'unchecked'] as const;

    switchStates.forEach((state) => {
      const switchConfig = theme.switches?.[state];
      if (switchConfig?.background) {
        root.style.setProperty(
          `--switch-${state}-background`,
          switchConfig.background,
        );
      }
    });

    // Handle switch thumb background
    if (theme.switches.thumb?.background) {
      root.style.setProperty(
        '--switch-thumb-background',
        theme.switches.thumb.background,
      );
    }
  }
}

export function applyThemeIsolated(theme: Theme, root: HTMLElement): void {
  applyThemeVariables(theme, root);
  applyCommonThemeProperties(theme, root);

  if (theme.backgroundImage) {
    const backgroundStyles = {
      backgroundImage: `url(${theme.backgroundImage})`,
      backgroundSize: theme.backgroundSize || 'cover',
      backgroundPosition: theme.backgroundPosition || 'center',
      backgroundRepeat: theme.backgroundRepeat || 'no-repeat',
    };

    Object.entries(backgroundStyles).forEach(([property, value]) => {
      root.style.setProperty(
        property.replace(/([A-Z])/g, '-$1').toLowerCase(),
        value,
      );
    });
  }

  // Set explicit background and text colors for complete isolation
  if (theme.colors?.background) {
    root.style.backgroundColor = theme.colors.background;
  }
  if (theme.colors?.foreground) {
    root.style.color = theme.colors.foreground;
  }
}

const colorVariableNames = [
  '--theme-color',
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--input',
  '--input-background',
  '--ring',
];

const fontVariableNames = [
  '--font-sans',
  '--font-serif',
  '--font-mono',
  '--font-heading',
  '--font-body',
];

const cornerVariableNames = [
  '--corner-none',
  '--corner-sm',
  '--corner-md',
  '--corner-lg',
  '--corner-xl',
  '--corner-full',
];

const shadowVariableNames = [
  '--shadow-none',
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
  '--shadow-xl',
  '--shadow-inner',
  '--shadow-card',
  '--shadow-button',
  '--shadow-dropdown',
];

const themeFeatureFlagVariableNames = [
  '--theme-has-gradient-buttons',
  '--theme-has-shimmer-effects',
  '--theme-has-pixel-art',
  '--theme-has-3d-effects',
  '--theme-has-rounded-buttons',
];

const navigationAndButtonVariableNames = [
  '--outline-button-background',
  '--nav-active-background',
];

const backgroundImageVariableNames = [
  '--background-image',
  '--background-size',
  '--background-position',
  '--background-repeat',
];

const tableVariableNames = [
  '--table-background',
  '--table-border',
  '--table-box-shadow',
  '--table-header-background',
  '--table-header-color',
  '--table-header-border',
  '--table-header-backdrop-filter',
  '--table-header-backdrop-filter-webkit',
  '--table-row-background',
  '--table-row-color',
  '--table-row-border',
  '--table-row-backdrop-filter',
  '--table-row-backdrop-filter-webkit',
  '--table-row-hover-background',
  '--table-row-hover-color',
  '--table-row-selected-background',
  '--table-row-selected-color',
  '--table-cell-border',
  '--table-footer-background',
  '--table-footer-color',
  '--table-footer-border',
  '--table-footer-backdrop-filter',
  '--table-footer-backdrop-filter-webkit',
];

const switchVariableNames = [
  '--switch-checked-background',
  '--switch-unchecked-background',
  '--switch-thumb-background',
];

const backdropFilterVariableNames = [
  '--card-backdrop-filter',
  '--popover-backdrop-filter',
  '--input-backdrop-filter',
  '--table-header-backdrop-filter',
  '--table-row-backdrop-filter',
  '--table-footer-backdrop-filter',
  '--sidebar-backdrop-filter',
];

const buttonBaseVariableNames = [
  'background',
  'color',
  'border',
  'border-style',
  'border-width',
  'border-color',
  'radius',
  'shadow',
  'backdrop-filter',
  'hover-background',
  'hover-color',
  'hover-transform',
  'hover-border-style',
  'hover-border-color',
  'hover-shadow',
  'active-background',
  'active-color',
  'active-transform',
  'active-border-style',
  'active-border-color',
  'active-shadow',
];

// Generate all button variable combinations
const buttonVariableNames = [
  'default',
  'outline',
  'secondary',
  'destructive',
  'ghost',
  'link',
].flatMap((variant) =>
  buttonBaseVariableNames.map((baseName) => `--btn-${variant}-${baseName}`),
);
