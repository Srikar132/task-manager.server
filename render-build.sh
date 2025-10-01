#!/bin/bash
set -e

echo "Starting Render build process..."

# Install dependencies
npm ci --only=production --silent

# Also install dev dependencies needed for build
npm install --only=dev --silent

# Clean dist directory
rm -rf dist

# Build with lenient TypeScript settings
echo "Building with TypeScript..."
npx tsc --noEmit false --skipLibCheck true --noImplicitAny false --strictNullChecks false --strict false

echo "Build completed successfully!"
