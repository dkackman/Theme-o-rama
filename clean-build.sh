#!/bin/bash

cd src-lib

pnpm run clean
pnpm install
pnpm prettier
pnpm run build

cd ..

rm -rf node_modules
pnpm run clean
pnpm install
pnpm prettier
pnpm run build
pnpm run build:web
