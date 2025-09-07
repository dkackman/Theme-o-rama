#!/bin/bash

pnpm prettier
pnpm run extract    
pnpm run compile    
pnpm run build:web

# Clear docs directory and copy fresh build
rm -rf docs/*
cp -rf dist-web/* docs/
echo "" > docs/.nojekyll

echo "Build completed and copied to docs/"
