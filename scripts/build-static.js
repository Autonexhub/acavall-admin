#!/usr/bin/env node
/**
 * Custom build script for static deployment to Hostinger
 * This script builds Next.js and creates a proper static structure
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Next.js application...');

// Build with Next.js using npx
execSync('npx next build', { stdio: 'inherit' });

// Create out directory  
const outDir = path.join(__dirname, '..', 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Copy static files from .next/static
const staticDir = path.join(__dirname, '..', '.next', 'static');
const outStaticDir = path.join(outDir, '_next', 'static');
if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, outStaticDir, { recursive: true });
}

// Create basic index.html
const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Acavall Harmony</title>
  <base href="/">
</head>
<body>
  <div id="__next"></div>
  <script>
    // SPA routing - redirect to dashboard or login
    if (!localStorage.getItem('auth_token')) {
      window.location.href = '/login/';
    } else {
      window.location.href = '/dashboard/';
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);

console.log('Static build complete! Output in ./out directory');
