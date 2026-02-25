#!/bin/bash

set -e  # Exit on any error

echo "🔨 Building theme-o-rama library..."

echo "📋 Generating JSON schema..."
typescript-json-schema src/theme.type.ts Theme --required > src/schema.json
pnpm prettier --write src/schema.json

echo "📦 Compiling TypeScript..."
tsc

echo "📋 Copying assets..."
cp src/themes.css dist/themes.css 
cp tailwind.config.js dist/tailwind.config.js
cp src/schema.json dist/schema.json

echo "✅ Build completed successfully!"