#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

const docsDirectory = path.join(process.cwd(), 'content/docs');

interface FileInfo {
  filename: string;
  title: string;
  hasFrontmatter: boolean;
}

function extractTitleFromContent(content: string): string | null {
  // Look for the first heading (h1, h2, h3, etc.)
  const headingMatch = content.match(/^#{1,6}\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  
  // If no heading found, try to extract from filename
  return null;
}

function hasFrontmatter(content: string): boolean {
  return content.startsWith('---') && content.includes('---', 3);
}

function prepareFile(filepath: string): FileInfo {
  const filename = path.basename(filepath);
  const content = fs.readFileSync(filepath, 'utf8');
  const hasExistingFrontmatter = hasFrontmatter(content);
  
  let title: string;
  let newContent: string;
  
  if (hasExistingFrontmatter) {
    // File already has frontmatter, skip it
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
  if (!fs.existsSync(docsDirectory)) {
    process.exit(1);
  }
  
  const files = fs.readdirSync(docsDirectory)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(docsDirectory, file));
  
  if (files.length === 0) {
    return;
  }
  
  const results: FileInfo[] = [];
  
  for (const filepath of files) {
    try {
      const result = prepareFile(filepath);
      results.push(result);
    } catch {
      // Silent error handling
    }
  }
}

if (require.main === module) {
  main();
}

