import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { logger } from '@/lib/logger';

// POST /api/wiki/upload - Upload a file for wiki
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const parentId = formData.get('parentId') as string | null;

    // Validate required fields
    if (!file || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: file, title' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isMarkdown = fileExtension === 'md' || fileExtension === 'markdown';
    const isPdf = fileExtension === 'pdf';

    if (!isMarkdown && !isPdf) {
      return NextResponse.json(
        { error: 'Only PDF and Markdown files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await prisma.document.findUnique({
        where: { id: parentId },
      });

      if (!parent || parent.type !== 'FOLDER') {
        return NextResponse.json(
          { error: 'Parent must be a valid folder' },
          { status: 400 }
        );
      }
    }

    try {
      // Convert file to buffer
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(
        fileBuffer,
        'shabra-wiki-documents',
        `wiki-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`
      );

      // Determine file type
      const fileType = isPdf ? 'pdf' : 'markdown';

      // For markdown files, also extract content for database storage
      let content = null;
      if (isMarkdown) {
        const textContent = await file.text();
        content = textContent;
      }

      // Create document record in database
      const document = await prisma.document.create({
        data: {
          title: title.trim(),
          content,
          type: 'DOCUMENT',
          parentId,
          authorId: session.user.id,
          isPublic: true, // Wiki documents are public by default
          fileUrl: uploadResult.url,
          filePublicId: uploadResult.publicId,
          fileType,
          originalName: file.name,
          fileSize: file.size,
        },
      });

      logger.info('Wiki file uploaded successfully', {
        documentId: document.id,
        fileName: file.name,
        fileType,
        userId: session.user.id,
      });

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          fileUrl: document.fileUrl,
          fileType: document.fileType,
          originalName: document.originalName,
          fileSize: document.fileSize,
          createdAt: document.createdAt,
        },
      });

    } catch (uploadError) {
      logger.error('File upload failed', uploadError as Error, {
        fileName: file.name,
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

  } catch (error) {
    logger.error('Error in wiki upload endpoint', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/wiki/upload - Delete a wiki file
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if user is the author or admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, roles: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAuthor = document.authorId === currentUser.id;
    const isAdmin = currentUser.roles === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own documents' },
        { status: 403 }
      );
    }

    // Delete from Cloudinary if file exists
    if (document.filePublicId) {
      try {
        await deleteFromCloudinary(document.filePublicId);
      } catch (cloudinaryError) {
        logger.warn('Failed to delete file from Cloudinary', {
          error: cloudinaryError as Error,
          documentId,
          publicId: document.filePublicId,
        });
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    logger.info('Wiki file deleted successfully', {
      documentId,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Error deleting wiki file', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
