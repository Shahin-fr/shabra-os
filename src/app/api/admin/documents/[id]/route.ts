import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';

// DELETE /api/admin/documents/[id] - Delete a document
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has required roles
    if (!['ADMIN', 'MANAGER'].some(role => (session.user.roles as string[]).includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const documentId = params.id;

    // Get the document with user information
    const document = await prisma.employeeDocument.findUnique({
      where: { id: documentId },
      include: {
        user: {
          select: {
            id: true,
            managerId: true,
            roles: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check permissions: Admin can delete any document, Manager can delete documents for their subordinates
    if ((session.user.roles as string[]).includes('MANAGER') && document.user.managerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(document.publicId);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await prisma.employeeDocument.delete({
      where: { id: documentId },
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
