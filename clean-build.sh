#!/bin/bash

# Parse command line arguments
AGGRESSIVE=false
for arg in "$@"; do
    case $arg in
        --aggressive)
            AGGRESSIVE=true
            shift
            ;;
        *)
            # Unknown option
            ;;
    esac
done

cd src-lib

pnpm run clean
pnpm install
pnpm prettier
pnpm run build

cd ..

find node_modules -type d -name "*theme-o-rama*" -exec rm -rf {} + 2>/dev/null || true
rm -rf node_modules

# If --aggressive flag is set, remove all node_modules directories
if [ "$AGGRESSIVE" = true ]; then
    echo "Aggressive mode: Removing all node_modules directories..."
else
    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
fi

pnpm run clean
pnpm install
pnpm prettier
pnpm run build
pnpm run build:web
