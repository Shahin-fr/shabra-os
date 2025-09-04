#!/usr/bin/env node

/**
 * Security audit script to check for credential vulnerabilities
 * Implements: [CRITICAL PRIORITY 8: Secure Credentials]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const PRISMA_DIR = path.join(ROOT_DIR, 'prisma');
const TEST_DIR = path.join(ROOT_DIR, 'src', 'e2e');

// Security patterns to check
const SECURITY_PATTERNS = {
  hardcodedPasswords: [
    /password\s*[:=]\s*['"`][^'"`]*['"`]/gi,
    /password\s*[:=]\s*[^,\n}]+/gi,
  ],
  hardcodedSecrets: [
    /secret\s*[:=]\s*['"`][^'"`]*['"`]/gi,
    /key\s*[:=]\s*['"`][^'"`]*['"`]/gi,
    /token\s*[:=]\s*['"`][^'"`]*['"`]/gi,
    /api_key\s*[:=]\s*['"`][^'"`]*['"`]/gi,
  ],
  hardcodedUrls: [
    /localhost\s*[:=]\s*['"`][^'"`]*['"`]/gi,
    /127\.0\.0\.1\s*[:=]\s*['"`][^'"`]*['"`]/gi,
  ],
  weakPasswords: [/password123/gi, /admin/gi, /test/gi, /123456/gi, /qwerty/gi],
  consoleStatements: [/console\.(log|warn|error|info|debug)/gi],
  environmentVariables: [/process\.env\.[A-Z_]+/gi],
};

// Files to exclude from audit
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /coverage/,
  /\.git/,
  /\.env/,
  /secure-credentials/,
  /package-lock\.json/,
  /yarn\.lock/,
  /\.tsbuildinfo/,
];

function shouldExcludeFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(relativePath));
}

function findFiles(
  dir,
  extensions = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json']
) {
  const files = [];

  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!shouldExcludeFile(fullPath)) {
            traverse(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext) && !shouldExcludeFile(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(
        `⚠️  Warning: Could not read directory ${currentDir}: ${error.message}`
      );
    }
  }

  traverse(dir);
  return files;
}

function auditFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT_DIR, filePath);
    const issues = [];

    // Check each security pattern
    Object.entries(SECURITY_PATTERNS).forEach(([patternName, patterns]) => {
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            type: patternName,
            matches: matches.length,
            examples: matches.slice(0, 3), // Show first 3 examples
            severity: getSeverity(patternName),
          });
        }
      });
    });

    return {
      file: relativePath,
      issues,
      hasIssues: issues.length > 0,
    };
  } catch (error) {
    return {
      file: path.relative(ROOT_DIR, filePath),
      error: error.message,
      hasIssues: false,
    };
  }
}

function getSeverity(issueType) {
  const severityMap = {
    hardcodedPasswords: 'CRITICAL',
    hardcodedSecrets: 'CRITICAL',
    weakPasswords: 'HIGH',
    hardcodedUrls: 'MEDIUM',
    consoleStatements: 'LOW',
    environmentVariables: 'INFO',
  };

  return severityMap[issueType] || 'MEDIUM';
}

function generateReport(auditResults) {
  const totalFiles = auditResults.length;
  const filesWithIssues = auditResults.filter(
    result => result.hasIssues
  ).length;
  const totalIssues = auditResults.reduce(
    (sum, result) => sum + (result.issues ? result.issues.length : 0),
    0
  );

  // Group issues by severity
  const issuesBySeverity = {};
  auditResults.forEach(result => {
    if (result.issues) {
      result.issues.forEach(issue => {
        if (!issuesBySeverity[issue.severity]) {
          issuesBySeverity[issue.severity] = [];
        }
        issuesBySeverity[issue.severity].push({
          file: result.file,
          ...issue,
        });
      });
    }
  });

  let report = `# Security Audit Report
Generated: ${new Date().toISOString()}

## 📊 Summary
- **Total Files Scanned**: ${totalFiles}
- **Files with Issues**: ${filesWithIssues}
- **Total Issues Found**: ${totalIssues}

## 🚨 Critical Issues (${issuesBySeverity.CRITICAL?.length || 0})

`;

  if (issuesBySeverity.CRITICAL) {
    issuesBySeverity.CRITICAL.forEach(issue => {
      report += `### ${issue.type} in ${issue.file}
- **Severity**: ${issue.severity}
- **Matches**: ${issue.matches}
- **Examples**: ${issue.examples.join(', ')}
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

`;
    });
  }

  report += `## ⚠️  High Priority Issues (${issuesBySeverity.HIGH?.length || 0})

`;

  if (issuesBySeverity.HIGH) {
    issuesBySeverity.HIGH.forEach(issue => {
      report += `### ${issue.type} in ${issue.file}
- **Severity**: ${issue.severity}
- **Matches**: ${issue.matches}
- **Examples**: ${issue.examples.join(', ')}
- **Action Required**: HIGH - Fix weak passwords and patterns

`;
    });
  }

  report += `## 🔧 Medium Priority Issues (${issuesBySeverity.MEDIUM?.length || 0})

`;

  if (issuesBySeverity.MEDIUM) {
    issuesBySeverity.MEDIUM.forEach(issue => {
      report += `### ${issue.type} in ${issue.file}
- **Severity**: ${issue.severity}
- **Matches**: ${issue.matches}
- **Examples**: ${issue.examples.join(', ')}
- **Action Required**: MEDIUM - Review and fix as needed

`;
    });
  }

  report += `## 📝 Low Priority Issues (${issuesBySeverity.LOW?.length || 0})

`;

  if (issuesBySeverity.LOW) {
    issuesBySeverity.LOW.forEach(issue => {
      report += `### ${issue.type} in ${issue.file}
- **Severity**: ${issue.severity}
- **Matches**: ${issue.matches}
- **Examples**: ${issue.examples.join(', ')}
- **Action Required**: LOW - Consider fixing for production

`;
    });
  }

  report += `## 🎯 Recommendations

### Immediate Actions (Critical & High)
1. **Remove all hardcoded passwords** from source code
2. **Replace weak passwords** with secure alternatives
3. **Move credentials** to environment variables
4. **Use secure credential generation** for development

### Environment Setup
1. **Copy env.template** to .env.local
2. **Generate secure credentials** using scripts/generate-secure-credentials.js
3. **Update database connection strings**
4. **Set strong NEXTAUTH_SECRET**

### Security Best Practices
1. **Never commit** .env files to version control
2. **Use strong passwords** (16+ characters, mixed case, symbols)
3. **Rotate secrets** regularly in production
4. **Monitor credential access** and usage

## 🔍 Files with Issues

`;

  auditResults
    .filter(result => result.hasIssues)
    .forEach(result => {
      report += `### ${result.file}
`;
      result.issues.forEach(issue => {
        report += `- **${issue.type}** (${issue.severity}): ${issue.matches} matches
`;
      });
      report += `
`;
    });

  return report;
}

function main() {
  console.log('🔒 Starting security audit...\n');

  // Find all files to audit
  const allFiles = [
    ...findFiles(SRC_DIR),
    ...findFiles(PRISMA_DIR),
    ...findFiles(TEST_DIR),
  ];

  console.log(`📁 Found ${allFiles.length} files to audit\n`);

  // Audit each file
  const auditResults = [];
  let processedCount = 0;

  for (const file of allFiles) {
    const relativePath = path.relative(ROOT_DIR, file);
    process.stdout.write(`🔍 Auditing: ${relativePath}... `);

    const result = auditFile(file);
    auditResults.push(result);

    if (result.hasIssues) {
      const issueCount = result.issues ? result.issues.length : 0;
      console.log(`❌ ${issueCount} issues found`);
    } else if (result.error) {
      console.log(`⚠️  Error: ${result.error}`);
    } else {
      console.log('✅ Clean');
    }

    processedCount++;
  }

  console.log(`\n📊 Audit completed! Scanned ${processedCount} files.\n`);

  // Generate and save report
  const report = generateReport(auditResults);
  const reportPath = path.join(ROOT_DIR, 'SECURITY_AUDIT_REPORT.md');

  fs.writeFileSync(reportPath, report);
  console.log(`📋 Security report saved to: ${reportPath}`);

  // Summary
  const criticalIssues = auditResults.reduce(
    (sum, result) =>
      sum +
      (result.issues
        ? result.issues.filter(i => i.severity === 'CRITICAL').length
        : 0),
    0
  );

  const highIssues = auditResults.reduce(
    (sum, result) =>
      sum +
      (result.issues
        ? result.issues.filter(i => i.severity === 'HIGH').length
        : 0),
    0
  );

  console.log('\n🎯 Summary:');
  console.log(`   - Critical Issues: ${criticalIssues}`);
  console.log(`   - High Priority Issues: ${highIssues}`);

  if (criticalIssues > 0 || highIssues > 0) {
    console.log(
      '\n🚨 ACTION REQUIRED: Critical and high-priority security issues found!'
    );
    console.log(
      '   Please review the security report and fix these issues immediately.'
    );
  } else {
    console.log('\n✅ No critical or high-priority security issues found.');
  }

  console.log('\n💡 Next steps:');
  console.log('   1. Review the security audit report');
  console.log('   2. Fix critical and high-priority issues');
  console.log('   3. Generate secure credentials using the provided script');
  console.log('   4. Update environment configuration');
  console.log('   5. Re-run the audit to verify fixes');
}

if (require.main === module) {
  main();
}

module.exports = { auditFile, generateReport };
