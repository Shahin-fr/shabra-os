---
title: "Knowledge Base Documentation"
date: "2025-08-17"
description: "توضیحات مقاله Knowledge Base Documentation"
author: "Shabra Team"
tags: ["documentation"]
---

This directory contains all the markdown files for the Shabra OS Knowledge Base. Each file represents an article that will be displayed in the Knowledge Base section of the application.

## File Structure

All documentation files should be placed in the `content/docs/` directory and must have the `.md` extension.

## File Format

Each markdown file should include frontmatter metadata at the top of the file:

```yaml
---
title: "Article Title"
date: "YYYY-MM-DD"
description: "Brief description of the article"
author: "Author Name"
tags: ["tag1", "tag2", "tag3"]
---
```

### Frontmatter Fields

- **title**: The title of the article (required)
- **date**: Publication date in YYYY-MM-DD format (optional, defaults to current date)
- **description**: Brief description of the article content (optional)
- **author**: Name of the article author (optional, defaults to "Unknown")
- **tags**: Array of tags for categorization (optional, defaults to empty array)

## Content Guidelines

### Markdown Support

The Knowledge Base supports standard markdown syntax including:

- **Headers**: `#`, `##`, `###`, etc.
- **Bold**: `**text**` or `__text__`
- **Italic**: `*text*` or `_text_`
- **Lists**: Ordered (`1.`) and unordered (`-`)
- **Links**: `[text](url)`
- **Code**: Inline `` `code` `` and code blocks
- **Blockquotes**: `> text`
- **Tables**: Standard markdown table syntax

### Styling

The content is automatically styled using Tailwind CSS Typography plugin with custom Shabra OS theme colors. The styling includes:

- Responsive typography
- Custom color scheme matching the Shabra OS theme
- Proper spacing and hierarchy
- Code syntax highlighting
- Table styling
- Blockquote styling with brand colors

## Adding New Articles

1. Create a new `.md` file in the `content/docs/` directory
2. Add the required frontmatter metadata
3. Write your content using markdown syntax
4. Save the file - it will automatically appear in the Knowledge Base

## File Naming

- Use descriptive, URL-friendly names for your files
- Use hyphens to separate words (e.g., `getting-started.md`, `project-management.md`)
- The filename (without .md) becomes the URL slug for the article

## Examples

### Basic Article
```markdown
---
title: "Getting Started Guide"
date: "2024-01-15"
description: "Learn how to get started with Shabra OS"
author: "Shabra Team"
tags: ["guide", "beginner"]
---

# Getting Started Guide

Welcome to Shabra OS! This guide will help you...

## First Steps

1. Create an account
2. Set up your profile
3. Start your first project

## Need Help?

Contact our support team for assistance.
```

### Article with Code Examples
```markdown
---
title: "API Integration Guide"
date: "2024-01-20"
description: "Learn how to integrate with Shabra OS API"
author: "Developer Team"
tags: ["api", "integration", "technical"]
---

# API Integration Guide

Learn how to integrate your applications with Shabra OS.

## Authentication

```javascript
const response = await fetch('/api/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'your-username',
    password: 'your-password'
  })
});
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id` | Update project |
```

## Best Practices

1. **Keep it Simple**: Write clear, concise content
2. **Use Examples**: Include practical examples when possible
3. **Organize Content**: Use proper heading hierarchy
4. **Add Tags**: Use relevant tags for better categorization
5. **Update Regularly**: Keep content current and accurate

## Support

For questions about the Knowledge Base system or content guidelines, please contact the development team.