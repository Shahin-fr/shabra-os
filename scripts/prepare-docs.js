#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const docsDirectory = path.join(process.cwd(), 'content/docs');

function extractTitleFromContent(content) {
  // Look for the first heading (h1, h2, h3, etc.)
  const headingMatch = content.match(/^#{1,6}\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  
  // If no heading found, try to extract from filename
  return null;
}

function generateSlug(filename) {
  // Remove .md extension
  const nameWithoutExt = filename.replace(/\.md$/, '');
  
  // Convert to URL-friendly slug
  return nameWithoutExt
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

function hasFrontmatter(content) {
  return content.startsWith('---') && content.includes('---', 3);
}

function prepareFile(filepath) {
  const filename = path.basename(filepath);
  const content = fs.readFileSync(filepath, 'utf8');
  const hasExistingFrontmatter = hasFrontmatter(content);
  
  let title;
  let newContent;
  
  if (hasExistingFrontmatter) {
    // File already has frontmatter, skip it
    console.log(`✅ ${filename} - Already has frontmatter, skipping`);
    return {
      filename,
      title: 'Already processed',
      hasFrontmatter: true
    };
  }
  
  // Extract title from content
  const extractedTitle = extractTitleFromContent(content);
  
  if (extractedTitle) {
    title = extractedTitle;
    
    // Remove the first heading line from content
    const lines = content.split('\n');
    const newLines = lines.filter((line, index) => {
      // Skip the first heading line
      if (index === 0 && line.match(/^#{1,6}\s+/)) {
        return false;
      }
      return true;
    });
    
    newContent = newLines.join('\n').trim();
  } else {
    // No heading found, use filename as title
    title = filename.replace(/\.md$/, '');
    newContent = content;
  }
  
  // Generate frontmatter
  const today = new Date().toISOString().split('T')[0];
  const slug = generateSlug(filename);
  
  const frontmatter = `---
title: "${title}"
date: "${today}"
description: "توضیحات مقاله ${title}"
author: "Shabra Team"
tags: ["documentation"]
---

`;
  
  // Write the new content with frontmatter
  const finalContent = frontmatter + newContent;
  fs.writeFileSync(filepath, finalContent, 'utf8');
  
  return {
    filename,
    title,
    hasFrontmatter: false
  };
}

function main() {
  console.log('🚀 Starting markdown file preparation...\n');
  
  if (!fs.existsSync(docsDirectory)) {
    console.error('❌ Docs directory not found:', docsDirectory);
    process.exit(1);
  }
  
  const files = fs.readdirSync(docsDirectory)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(docsDirectory, file));
  
  if (files.length === 0) {
    console.log('📝 No markdown files found in docs directory');
    return;
  }
  
  console.log(`📁 Found ${files.length} markdown files\n`);
  
  const results = [];
  
  for (const filepath of files) {
    try {
      const result = prepareFile(filepath);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error processing ${path.basename(filepath)}:`, error);
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('─'.repeat(50));
  
  const processed = results.filter(r => !r.hasFrontmatter).length;
  const skipped = results.filter(r => r.hasFrontmatter).length;
  
  console.log(`✅ Processed: ${processed} files`);
  console.log(`⏭️  Skipped (already have frontmatter): ${skipped} files`);
  console.log(`📝 Total: ${results.length} files`);
  
  if (processed > 0) {
    console.log('\n🎉 Successfully prepared markdown files with frontmatter!');
    console.log('📖 You can now view them in the Knowledge Base at /docs');
  }
}

if (require.main === module) {
  main();
}
