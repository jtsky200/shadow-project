// This script modifies package-lock.json to match package.json
// to avoid npm ci errors on build systems

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Read package.json
const pkgPath = resolve(__dirname, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

// Create a simpler package-lock.json
const simpleLock = {
  name: pkg.name,
  version: pkg.version,
  lockfileVersion: 3,
  requires: true,
  packages: {
    "": {
      name: pkg.name,
      version: pkg.version,
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies
    }
  }
};

// Write to package-lock.json
const lockPath = resolve(__dirname, 'package-lock.json');
writeFileSync(lockPath, JSON.stringify(simpleLock, null, 2), 'utf8');

console.log('Successfully updated package-lock.json to match package.json'); 