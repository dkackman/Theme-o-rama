#!/bin/bash

cd src-lib

pnpm run clean
pnpm install
pnpm prettier
pnpm run build

cd ..

find node_modules -type d -name "*theme-o-rama*" -exec rm -rf {} + 2>/dev/null || true
pnpm run clean
pnpm install
pnpm prettier
pnpm run build
pnpm run build:web
