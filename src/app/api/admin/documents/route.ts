import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary, getFileTypeFromCloudinary, getDocumentCategory } from '@/lib/cloudinary';
import { z } from 'zod';


// POST /api/admin/documents - Upload a new document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;

    // Validate required fields
    if (!file || !userId || !name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: file, userId, name, category' },
        { status: 400 }
      );
    }

    // Check authorization: Get current user and target user details
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, roles: true }
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, managerId: true, roles: true }
    });

    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions: Admin can upload for anyone, Manager can only upload for their subordinates
    const isAdmin = currentUser.roles === 'ADMIN';
    const isManagerOfTarget = currentUser.roles === 'MANAGER' && targetUser.managerId === currentUser.id;

    if (!isAdmin && !isManagerOfTarget) {
      return NextResponse.json({ 
        error: 'Forbidden: You do not have permission to upload documents for this user' 
      }, { status: 403 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: PDF, Images, Word, Excel, Text files.' },
        { status: 400 }
      );
    }


    // Upload logic wrapped in try-catch for detailed error handling
    try {
      // Convert file to buffer
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(
        fileBuffer,
        'shabra-employee-documents',
        `employee-${userId}-${Date.now()}`
      );

      // Get file type from Cloudinary response
      const fileType = getFileTypeFromCloudinary('raw', file.name.split('.').pop() || '');

      // Create document record in database
      const document = await prisma.employeeDocument.create({
        data: {
          userId,
          name,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          fileType,
          category: category as any,
          uploadedById: session.user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          name: document.name,
          url: document.url,
          fileType: document.fileType,
          category: document.category,
          createdAt: document.createdAt,
          user: document.user,
          uploadedBy: document.uploadedBy,
        },
      });

    } catch (uploadError) {
      console.error("!!! DOCUMENT UPLOAD FAILED !!!", {
        error: uploadError,
        errorMessage: uploadError instanceof Error ? uploadError.message : 'Unknown error',
        errorStack: uploadError instanceof Error ? uploadError.stack : undefined,
        errorName: uploadError instanceof Error ? uploadError.name : undefined,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId,
        category,
        uploadedBy: session.user.id
      });
      
      return NextResponse.json(
        { 
          error: 'Internal Server Error',
          details: process.env.NODE_ENV === 'development' ? (uploadError instanceof Error ? uploadError.message : 'Unknown error') : undefined
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/documents - Get documents for a specific user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check permissions
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, managerId: true, roles: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions: User can view their own documents, Admin/Manager can view their subordinates
    const canView = 
      session.user.id === userId || 
      session.user.roles === 'ADMIN' || 
      (session.user.roles === 'MANAGER' && targetUser.managerId === session.user.id);

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get documents for the user
    const documents = await prisma.employeeDocument.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group documents by category
    const groupedDocuments = documents.reduce((acc, doc) => {
      const category = doc.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        fileType: doc.fileType,
        category: doc.category,
        createdAt: doc.createdAt,
        user: doc.user,
        uploadedBy: doc.uploadedBy,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      documents: groupedDocuments,
      totalCount: documents.length,
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
