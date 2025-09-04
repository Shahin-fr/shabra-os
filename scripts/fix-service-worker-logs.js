#!/usr/bin/env node

/**
 * Script to replace remaining console statements in service worker
 * Implements: [CRITICAL PRIORITY 8: Production Console Log Eradication]
 */

const fs = require('fs');
const path = require('path');

const SW_FILE = path.join(__dirname, '..', 'public', 'sw.js');

function fixServiceWorkerLogs() {
  try {
    console.log('🔧 Fixing service worker console statements...');

    let content = fs.readFileSync(SW_FILE, 'utf8');
    let modified = false;

    // Replace all remaining console statements
    const replacements = [
      {
        from: /console\.error\('Cache first strategy failed:', error\);/g,
        to: "logger.error('Cache first strategy failed:', error);",
      },
      {
        from: /console\.error\('Network first strategy failed:', error\);/g,
        to: "logger.error('Network first strategy failed:', error);",
      },
      {
        from: /console\.error\('Background fetch failed:', error\);/g,
        to: "logger.error('Background fetch failed:', error);",
      },
      {
        from: /console\.error\('Stale while revalidate strategy failed:', error\);/g,
        to: "logger.error('Stale while revalidate strategy failed:', error);",
      },
      {
        from: /console\.log\('Unknown message type:', type\);/g,
        to: "logger.log('Unknown message type:', type);",
      },
      {
        from: /console\.log\('All caches cleared successfully'\);/g,
        to: "logger.log('All caches cleared successfully');",
      },
      {
        from: /console\.error\('Failed to clear caches:', error\);/g,
        to: "logger.error('Failed to clear caches:', error);",
      },
      {
        from: /console\.log\(`Cache invalidated for content type: \${contentType}`\);/g,
        to: 'logger.log(`Cache invalidated for content type: ${contentType}`);',
      },
      {
        from: /console\.error\('Failed to invalidate content cache:', error\);/g,
        to: "logger.error('Failed to invalidate content cache:', error);",
      },
      {
        from: /console\.log\(`Cache version updated to: \${newVersion}`\);/g,
        to: 'logger.log(`Cache version updated to: ${newVersion}`);',
      },
      {
        from: /console\.error\('Failed to update cache version:', error\);/g,
        to: "logger.error('Failed to update cache version:', error);",
      },
      {
        from: /console\.error\('Service Worker error:', event\.error\);/g,
        to: "logger.error('Service Worker error:', event.error);",
      },
      {
        from: /console\.error\('Service Worker unhandled rejection:', event\.reason\);/g,
        to: "logger.error('Service Worker unhandled rejection:', event.reason);",
      },
      {
        from: /console\.error\('Periodic cache cleanup failed:', error\);/g,
        to: "logger.error('Periodic cache cleanup failed:', error);",
      },
    ];

    for (const replacement of replacements) {
      if (content.match(replacement.from)) {
        content = content.replace(replacement.from, replacement.to);
        modified = true;
        console.log(`  ✓ Replaced console statement`);
      }
    }

    if (modified) {
      fs.writeFileSync(SW_FILE, content, 'utf8');
      console.log('✅ Service worker console statements fixed!');
    } else {
      console.log('ℹ️  No console statements found to replace');
    }
  } catch (error) {
    console.error('❌ Error fixing service worker:', error.message);
  }
}

if (require.main === module) {
  fixServiceWorkerLogs();
}

module.exports = { fixServiceWorkerLogs };
