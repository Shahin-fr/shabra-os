# Document Management System

## Overview

The Document Management System is a secure feature that allows storing and managing important employee-related files directly within the Shabra OS. This system provides a centralized location for all employee documents with proper access controls and audit trails.

## Features

### 🔐 **Secure File Storage**
- **Cloudinary Integration**: Files are stored securely in the cloud using Cloudinary's free tier
- **Automatic File Processing**: Images are optimized and converted to web-friendly formats
- **Secure URLs**: All files are served through secure HTTPS URLs
- **File Type Validation**: Only allowed file types can be uploaded

### 📁 **Document Organization**
- **Categorized Storage**: Documents are organized by categories (Contract, Identification, Certificate, etc.)
- **Smart Categorization**: Automatic category detection based on file names
- **Search and Filter**: Easy document discovery through categorization
- **Audit Trail**: Complete tracking of who uploaded what and when

### 👥 **Access Control**
- **Role-Based Permissions**: Only Admins and Managers can upload/delete documents
- **Manager Subordinates**: Managers can only manage documents for their direct reports
- **Employee View**: Employees can view their own documents
- **Secure Downloads**: Direct download links with proper authentication

## Supported File Types

- **Documents**: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), Text files
- **Images**: JPEG, PNG, GIF
- **Maximum File Size**: 10MB per file

## Document Categories

1. **CONTRACT** - Employment contracts, agreements
2. **IDENTIFICATION** - ID cards, passports, national IDs
3. **CERTIFICATE** - Diplomas, degrees, licenses, certifications
4. **PERFORMANCE_REVIEW** - Performance evaluations, appraisals
5. **MEDICAL** - Medical certificates, health insurance documents
6. **PAYROLL** - Salary slips, payroll documents
7. **OTHER** - Miscellaneous documents

## Setup Instructions

### 1. Cloudinary Configuration

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 2. Database Migration

The system automatically creates the necessary database tables when you run:

```bash
npx prisma db push
```

## Usage Guide

### For Administrators

1. **Navigate to Employee Profile**: Go to any employee's profile page
2. **Access Documents Tab**: Click on the "اسناد" (Documents) tab
3. **Upload Documents**: Click "آپلود سند جدید" (Upload New Document)
4. **Fill Document Details**:
   - Select the file to upload
   - Enter a descriptive name
   - Choose the appropriate category
5. **Manage Documents**: View, download, or delete existing documents

### For Managers

- **Subordinate Access**: Can manage documents for their direct reports only
- **Same Interface**: Use the same interface as administrators
- **Permission Validation**: System automatically validates manager-subordinate relationships

### For Employees

- **View Only**: Can view their own documents
- **Download Access**: Can download their documents
- **No Upload/Delete**: Cannot upload or delete documents (admin/manager only)

## API Endpoints

### Upload Document
```
POST /api/admin/documents
Content-Type: multipart/form-data

Fields:
- file: The file to upload
- userId: Target user ID
- name: Document name
- category: Document category
```

### Get Documents
```
GET /api/admin/documents?userId={userId}

Response:
{
  "success": true,
  "documents": {
    "CONTRACT": [...],
    "IDENTIFICATION": [...],
    ...
  },
  "totalCount": 15
}
```

### Delete Document
```
DELETE /api/admin/documents/{documentId}
```

## Security Features

### File Security
- **Virus Scanning**: Cloudinary provides built-in virus scanning
- **Secure Storage**: Files are stored in encrypted cloud storage
- **Access Control**: URLs are secure and time-limited
- **File Validation**: Strict file type and size validation

### Access Control
- **Authentication Required**: All endpoints require valid authentication
- **Role-Based Access**: Different permissions for different user roles
- **Audit Logging**: All actions are logged for security auditing
- **Data Privacy**: Documents are only accessible to authorized users

## Technical Implementation

### Backend
- **Next.js API Routes**: RESTful API endpoints
- **Prisma ORM**: Database operations and relationships
- **Cloudinary SDK**: File upload and management
- **Zod Validation**: Request validation and sanitization

### Frontend
- **React Components**: Modular UI components
- **TanStack Query**: Server state management
- **File Upload**: Drag-and-drop file upload interface
- **Progress Tracking**: Real-time upload progress
- **Error Handling**: Comprehensive error handling and user feedback

### Database Schema
```prisma
model EmployeeDocument {
  id           String           @id @default(cuid())
  userId       String
  name         String
  url          String
  publicId     String
  fileType     String
  category     DocumentCategory
  uploadedById String
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  uploadedBy   User             @relation("DocumentUploader", fields: [uploadedById], references: [id], onDelete: Cascade)
}
```

## Best Practices

### File Naming
- Use descriptive names that clearly identify the document
- Include dates when relevant (e.g., "Employment Contract 2024")
- Avoid special characters and spaces

### Category Selection
- Choose the most appropriate category for easy organization
- Use "OTHER" only when no other category fits
- Be consistent with categorization across the organization

### Security
- Regularly review document access permissions
- Monitor upload activity for suspicious patterns
- Keep Cloudinary credentials secure and rotate them periodically

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size (must be under 10MB)
   - Verify file type is supported
   - Ensure Cloudinary credentials are correct

2. **Permission Denied**
   - Verify user has appropriate role (Admin/Manager)
   - Check manager-subordinate relationship for managers
   - Ensure user is authenticated

3. **File Not Found**
   - Check if document was deleted
   - Verify user has access to the document
   - Check Cloudinary storage status

### Support
For technical support or questions about the Document Management System, contact the development team or refer to the API documentation.
