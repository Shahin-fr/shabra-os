import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const docsDirectory = path.join(process.cwd(), 'content/docs');

export interface DocMetadata {
  title: string;
  date: string;
  description: string;
  author: string;
  tags: string[];
  slug: string;
  originalSlug: string;
}

export interface DocContent extends DocMetadata {
  content: string;
  htmlContent: string;
}

export function getAllDocs(): DocMetadata[] {
  // Check if the directory exists
  if (!fs.existsSync(docsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(docsDirectory);
  const allDocsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const originalSlug = fileName.replace(/\.md$/, '');

      // Create URL-safe slug
      const slug = encodeURIComponent(originalSlug);

      // Read markdown file as string
      const fullPath = path.join(docsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      return {
        slug,
        originalSlug, // Keep original for file lookup
        title: matterResult.data.title || 'Untitled',
        date: matterResult.data.date || new Date().toISOString().split('T')[0],
        description: matterResult.data.description || '',
        author: matterResult.data.author || 'Unknown',
        tags: matterResult.data.tags || [],
      };
    });

  // Sort posts by date
  return allDocsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getDocBySlug(slug: string): Promise<DocContent | null> {
  try {
    // Decode the URL-encoded slug to get the original filename
    const originalSlug = decodeURIComponent(slug);
    const fullPath = path.join(docsDirectory, `${originalSlug}.md`);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
      .use(html)
      .process(matterResult.content);
    const htmlContent = processedContent.toString();

    return {
      slug,
      originalSlug,
      title: matterResult.data.title || 'Untitled',
      date: matterResult.data.date || new Date().toISOString().split('T')[0],
      description: matterResult.data.description || '',
      author: matterResult.data.author || 'Unknown',
      tags: matterResult.data.tags || [],
      content: matterResult.content,
      htmlContent,
    };
  } catch {
    return null;
  }
}

export function getDocsByTag(tag: string): DocMetadata[] {
  const allDocs = getAllDocs();
  return allDocs.filter(doc => doc.tags.includes(tag));
}

export function getAllTags(): string[] {
  const allDocs = getAllDocs();
  const tags = new Set<string>();

  allDocs.forEach(doc => {
    doc.tags.forEach(tag => tags.add(tag));
  });

  return Array.from(tags).sort();
}
