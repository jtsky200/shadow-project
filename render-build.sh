#!/bin/bash

# Prepare package-lock.json to match package.json
echo "force=true" > .npmrc
echo "legacy-peer-deps=true" >> .npmrc
echo "engine-strict=false" >> .npmrc

# Force package-lock.json to match package.json
node package-lock-force.js

# Install dependencies using npm install (not npm ci)
npm install --force --no-audit --no-fund

# Build the application
npm run build 