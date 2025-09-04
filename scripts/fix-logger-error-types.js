const fs = require('fs');
const path = require('path');

// Files that need logger error type fixes
const filesToFix = [
  'src/lib/cache-manager.ts',
  'src/lib/database/cache-manager.ts',
  'src/lib/queries.ts',
  'src/components/storyboard/RealTimeCollaboration.tsx',
];

function fixLoggerErrorTypes(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix logger.error calls with unknown error types
  const loggerErrorRegex = /logger\.error\([^,]+,\s*([^,)]+)\)/g;
  if (loggerErrorRegex.test(content)) {
    content = content.replace(loggerErrorRegex, (match, errorParam) => {
      // If the error parameter is not already cast to Error, cast it
      if (
        !errorParam.includes(' as Error') &&
        !errorParam.includes(': Error')
      ) {
        const trimmedError = errorParam.trim();
        if (trimmedError === 'error' || trimmedError.includes('error')) {
          return match.replace(errorParam, `${trimmedError} as Error`);
        }
      }
      return match;
    });
    modified = true;
  }

  // Fix logger.warn calls with unknown error types
  const loggerWarnRegex = /logger\.warn\([^,]+,\s*([^,)]+)\)/g;
  if (loggerWarnRegex.test(content)) {
    content = content.replace(loggerWarnRegex, (match, errorParam) => {
      // If the error parameter is not already cast to Error, cast it
      if (
        !errorParam.includes(' as Error') &&
        !errorParam.includes(': Error')
      ) {
        const trimmedError = errorParam.trim();
        if (trimmedError === 'error' || trimmedError.includes('error')) {
          return match.replace(errorParam, `${trimmedError} as Error`);
        }
      }
      return match;
    });
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed logger error types in: ${filePath}`);
  } else {
    console.log(`No logger error type fixes needed in: ${filePath}`);
  }
}

// Fix each file
filesToFix.forEach(fixLoggerErrorTypes);

console.log('Logger error type fixes completed!');
