# VS Code Debug Configuration

This directory contains VS Code configuration files for debugging the Theme-o-rama application.

## Debug Configurations

### Launch Configurations

1. **Launch Web App in Chrome** - Starts the development server and launches Chrome with debugger attached
   - Uses the regular `npm run dev` command (port 1425)
   - Automatically starts the Vite dev server
   - Opens Chrome with debugging enabled

2. **Launch Web App in Edge** - Same as Chrome but uses Microsoft Edge
   - Uses the regular `npm run dev` command (port 1425)
   - Automatically starts the Vite dev server
   - Opens Edge with debugging enabled

3. **Launch Web App (Web Build) in Chrome** - Launches the web-specific build
   - Uses the `npm run preview:web` command (port 3000)
   - Runs the web-optimized build
   - Opens Chrome with debugging enabled

### Attach Configurations

4. **Attach to Chrome** - Attaches to an already running Chrome instance
   - Requires Chrome to be started with `--remote-debugging-port=9222`
   - Useful when you want to debug an already running application

5. **Attach to Edge** - Attaches to an already running Edge instance
   - Requires Edge to be started with `--remote-debugging-port=9222`
   - Useful when you want to debug an already running application

## Usage

1. Open VS Code in the project root
2. Go to the Debug panel (Ctrl+Shift+D / Cmd+Shift+D)
3. Select one of the launch configurations from the dropdown
4. Click the green play button or press F5

## Prerequisites

- VS Code with the "Debugger for Chrome" or "Debugger for Microsoft Edge" extension installed
- Node.js and pnpm installed
- The application dependencies installed (`pnpm install`)

## Features

- **Source Maps**: Full source map support for TypeScript/React debugging
- **Breakpoints**: Set breakpoints in your TypeScript/React code
- **Variable Inspection**: Inspect variables and call stack
- **Console**: Access to browser console and VS Code debug console
- **Hot Reload**: Development server with hot module replacement
- **Pre-launch Tasks**: Automatically starts the development server before launching the browser

## Troubleshooting

- If the browser doesn't open, make sure the development server is running on the correct port
- If breakpoints don't work, ensure source maps are enabled in your Vite configuration
- If you get port conflicts, check that no other processes are using ports 1425 or 3000
