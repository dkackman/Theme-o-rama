#!/bin/bash

pnpm prettier
pnpm run extract    
pnpm run compile    
pnpm run build:web

# Clear docs directory and copy fresh build
rm -rf docs/*
cp -rf dist-web/* docs/
echo "" > docs/.nojekyll

# Add cache-busting headers to the copied index.html
sed -i '' '/<title>Sage<\/title>/i\
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\
    <meta http-equiv="Pragma" content="no-cache" />\
    <meta http-equiv="Expires" content="0" />' docs/index.html

echo "Build completed and copied to docs/"
