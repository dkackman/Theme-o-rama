#!/bin/bash

pnpm prettier
pnpm run build:web
rm -rf docs/*
cp -r dist-web/* docs/