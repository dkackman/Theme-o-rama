#!/bin/bash

cd src-lib
pnpm install
pnpm prettier
pnpm run build
cd ..

pnpm install
pnpm prettier
pnpm run build
