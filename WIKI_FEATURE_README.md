# دانشنامه شبرا - Wiki Feature

## Overview

The Knowledge Base feature has been completely overhauled into a structured and user-friendly Wiki system called "دانشنامه شبرا" (Shabra Encyclopedia).

## Features

### 🗂️ Nested Document Structure

- **Folders**: Organize content hierarchically
- **Documents**: Store actual content with markdown support
- **Tree Navigation**: Intuitive sidebar navigation showing the document hierarchy

### 📝 Content Management

- **Markdown Support**: Full markdown rendering with `react-markdown`
- **Rich Content**: Support for headings, lists, code blocks, tables, and more
- **Version Control**: Track creation and modification dates

### 🔐 Access Control

- **Public/Private**: Documents can be marked as public or private
- **User Permissions**: Users can only edit their own documents
- **Authentication Required**: All wiki operations require user authentication

### 🎨 Modern UI

- **Responsive Design**: Works on all device sizes
- **Dark/Light Mode**: Supports theme switching
- **Persian RTL**: Full right-to-left language support
- **Loading States**: Smooth loading animations and skeleton screens

## Database Schema Changes

### Document Model Updates

```prisma
model Document {
  id            String         @id @default(cuid())
  title         String
  content       String?        // Now optional for folders
  authorId      String
  isPublic      Boolean        @default(false)
  type          String         @default("DOCUMENT") // "FOLDER" or "DOCUMENT"
  parentId      String?        // Self-referencing relation
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // Relations
  author        User           @relation(fields: [authorId], references: [id])
  parent        Document?      @relation("NestedDocuments", fields: [parentId], references: [id])
  children      Document[]     @relation("NestedDocuments")
  documentReads DocumentRead[]
}
```

## File Structure

```
src/
├── app/
│   └── wiki/
│       ├── page.tsx              # Main wiki page
│       └── loading.tsx           # Loading component
├── components/
│   └── wiki/
│       ├── WikiSidebar.tsx       # Navigation sidebar
│       ├── WikiContent.tsx       # Main content area
│       ├── CreateWikiItem.tsx    # Create/edit dialog
│       └── index.ts              # Component exports
└── app/api/wiki/
    ├── route.ts                  # Main wiki API
    └── [documentId]/route.ts     # Individual document API
```

## API Endpoints

### GET /api/wiki

- Fetches all wiki items with nested structure
- Returns tree-like hierarchy of folders and documents
- Respects user permissions (public documents + user's own documents)

### POST /api/wiki

- Creates new wiki items (folders or documents)
- Validates parent-child relationships
- Requires authentication

### GET /api/wiki/[documentId]

- Fetches specific document by ID
- Converts markdown content to HTML
- Checks access permissions

### PUT /api/wiki/[documentId]

- Updates existing documents
- Only allows editing by document owner
- Validates data integrity

### DELETE /api/wiki/[documentId]

- Deletes documents
- Prevents deletion of documents with children
- Only allows deletion by document owner

## Usage

### 1. Database Migration

```bash
# Run the migration to add nested structure
npx prisma migrate dev --name add_nested_document_structure

# Seed the database with sample wiki content
npm run seed:wiki
```

### 2. Access the Wiki

- Navigate to `/wiki` in your application
- The sidebar shows the document hierarchy
- Click on folders to expand/collapse
- Click on documents to view content

### 3. Create New Content

- Click the "ایجاد" (Create) button in the header
- Choose between creating a folder or document
- Select parent folder (optional)
- Add content for documents

### 4. Navigation

- **Sidebar**: Shows the complete document tree
- **Breadcrumbs**: Navigate through the hierarchy
- **Search**: Find documents quickly (future feature)

## Sample Content Structure

```
📁 شروع کار
├── 📄 خوش آمدید به شبرا
└── 📄 راهنمای شروع سریع

📁 راهنماها
└── 📄 راهنمای مدیریت پروژه

📁 قوانین و سیاست‌ها
└── 📄 اصول همکاری تیمی
```

## Technical Implementation

### Frontend Components

- **WikiSidebar**: Recursive tree rendering with expand/collapse
- **WikiContent**: Markdown rendering with proper styling
- **CreateWikiItem**: Form for creating new wiki items

### State Management

- Local state for selected document and expanded folders
- API calls for CRUD operations
- Loading states and error handling

### Styling

- Tailwind CSS with custom prose classes
- Responsive design patterns
- Persian RTL support
- Dark/light theme compatibility

## Future Enhancements

### Planned Features

- **Search & Filter**: Full-text search across documents
- **Tags & Categories**: Better content organization
- **Version History**: Track document changes over time
- **Collaborative Editing**: Real-time editing with multiple users
- **Export Options**: PDF, Word, or Markdown export
- **Rich Media**: Support for images, videos, and attachments

### Performance Optimizations

- **Lazy Loading**: Load document content on demand
- **Caching**: Implement document caching for better performance
- **Pagination**: Handle large numbers of documents efficiently

## Migration from Old System

The old Knowledge Base system (`/docs`) has been replaced by the new Wiki system (`/wiki`). The old system used file-based markdown files, while the new system uses a database-driven approach with:

- **Better Organization**: Hierarchical folder structure
- **User Management**: Individual user ownership and permissions
- **Real-time Updates**: Instant content updates without file system changes
- **Scalability**: Database-driven approach for better performance

## Troubleshooting

### Common Issues

1. **Migration Errors**: Ensure Prisma client is generated after schema changes
2. **Permission Denied**: Check user authentication and document ownership
3. **Content Not Rendering**: Verify markdown syntax and content field
4. **Sidebar Not Loading**: Check API endpoint and database connectivity

### Debug Commands

```bash
# Check database connection
npx prisma db push

# Generate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## Contributing

When contributing to the Wiki feature:

1. **Follow the existing patterns** for component structure
2. **Test with Persian content** to ensure RTL support
3. **Update the seed data** if adding new document types
4. **Maintain backward compatibility** for existing documents
5. **Add proper error handling** for all API operations

## License

This feature is part of the Shabra OS project and follows the same licensing terms.
