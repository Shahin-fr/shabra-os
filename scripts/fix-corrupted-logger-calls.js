const fs = require('fs');

// Files that need logger call fixes
const filesToFix = [
  'src/lib/queries.ts',
  'src/lib/cache-manager.ts',
  'src/lib/database/cache-manager.ts',
  'src/lib/security/RateLimiter.ts',
];

function fixLoggerCalls(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix corrupted logger.error calls
  const corruptedErrorRegex = /logger\.error as Error\(/g;
  if (corruptedErrorRegex.test(content)) {
    content = content.replace(corruptedErrorRegex, 'logger.error(');
    modified = true;
  }

  // Fix corrupted logger.warn calls
  const corruptedWarnRegex = /logger\.warn as Error\(/g;
  if (corruptedWarnRegex.test(content)) {
    content = content.replace(corruptedWarnRegex, 'logger.warn(');
    modified = true;
  }

  // Fix corrupted logger.info calls
  const corruptedInfoRegex = /logger\.info as Error\(/g;
  if (corruptedInfoRegex.test(content)) {
    content = content.replace(corruptedInfoRegex, 'logger.info(');
    modified = true;
  }

  // Fix corrupted catch statements
  const corruptedCatchRegex = /} catch \(error as Error\) {/g;
  if (corruptedCatchRegex.test(content)) {
    content = content.replace(corruptedCatchRegex, '} catch (error) {');
    modified = true;
  }

  // Fix corrupted Date.now() calls
  const corruptedDateRegex = /Date\./g;
  if (corruptedDateRegex.test(content)) {
    content = content.replace(/Date\.\s*}/g, 'Date.now() }');
    content = content.replace(/Date\.\s*\)/g, 'Date.now() )');
    content = content.replace(/Date\.\s*;/g, 'Date.now();');
    modified = true;
  }

  // Fix corrupted if statements
  const corruptedIfRegex = /if \(/g;
  if (corruptedIfRegex.test(content)) {
    content = content.replace(/if \(\s*const/g, 'if (');
    content = content.replace(/if \(\s*let/g, 'if (');
    modified = true;
  }

  // Fix corrupted const/let declarations
  const corruptedConstRegex = /const\s+let/g;
  if (corruptedConstRegex.test(content)) {
    content = content.replace(corruptedConstRegex, 'let');
    modified = true;
  }

  // Fix corrupted for loops
  const corruptedForRegex = /for \(const\s+\[/g;
  if (corruptedForRegex.test(content)) {
    content = content.replace(/for \(const\s+\[/g, 'for (const [');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed corrupted logger calls in: ${filePath}`);
  } else {
    console.log(`No corrupted logger calls found in: ${filePath}`);
  }
}

// Fix each file
console.log('Fixing corrupted logger calls...');
filesToFix.forEach(fixLoggerCalls);
console.log('Corrupted logger call fixes completed!');
