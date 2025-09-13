#!/bin/bash

pnpm prettier
pnpm run extract    
pnpm run compile    
pnpm run build:web
rm -rf docs/*