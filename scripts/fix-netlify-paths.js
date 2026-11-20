/**
 * Fix Netlify paths for Next.js on Windows.
 * Replaces backslashes with forward slashes in .next build output.
 * Run after `npm run build` in Netlify build command.
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'apps', 'web', '.next');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.json')) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix Windows backslashes in require/import paths
  content = content.replace(/\\\\/g, '/');
  content = content.replace(/\\/g, '/');

  // Fix specific Netlify path issues
  content = content.replace(/C:\\\\?Users\\\\?[^\\\\/]+\\\\?Documents\\\\?GitHub\\\\?wlm-photo-mvp/gi, '/var/task');
  content = content.replace(/C:\\\\?Users\\\\?[^\\\\/]+\\\\?Documents\\\\?GitHub/gi, '/var/task');
  content = content.replace(/C:\\\\?Users\\\\?[^\\\\/]+/gi, '/var/task');

  // Fix any remaining Windows-style paths
  content = content.replace(/([A-Z]):[\\/]/gi, '/');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${path.relative(DIST_DIR, filePath)}`);
  }
}

if (fs.existsSync(DIST_DIR)) {
  console.log('Fixing Netlify paths in:', DIST_DIR);
  walk(DIST_DIR);
  console.log('Done!');
} else {
  console.error('Build directory not found:', DIST_DIR);
  process.exit(1);
}