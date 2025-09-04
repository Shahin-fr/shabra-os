const fs = require('fs');
const path = require('path');

// Routes that don't expect request parameters
const noRequestRoutes = [
  'src/app/api/users/route.test.ts',
  'src/app/api/health/route.test.ts',
  'src/app/api/story-types/route.test.ts',
  'src/app/api/logs/route.test.ts',
  'src/app/api/wiki/route.test.ts',
];

function fixTestFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove request parameter from GET() calls
  const getRequestRegex = /GET\(request\)/g;
  if (getRequestRegex.test(content)) {
    content = content.replace(getRequestRegex, 'GET()');
    modified = true;
  }

  // Remove request variable declarations that are no longer used
  const requestDeclRegex = /const request = new NextRequest\([^)]+\);/g;
  if (requestDeclRegex.test(content)) {
    content = content.replace(requestDeclRegex, '');
    modified = true;
  }

  // Remove unused NextRequest import if it's no longer used
  if (
    content.includes('import { NextRequest }') &&
    !content.includes('NextRequest')
  ) {
    content = content.replace(
      /import \{ NextRequest \} from 'next\/server';?\n?/g,
      ''
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Fix each test file
noRequestRoutes.forEach(fixTestFile);

console.log('API route test fixes completed!');
