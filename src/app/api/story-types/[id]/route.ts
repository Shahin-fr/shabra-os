import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storyType = await prisma.storyType.findUnique({
      where: { id },
    });

    if (!storyType) {
      return NextResponse.json(
        { error: { message: 'Story type not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(storyType);
  } catch (error) {
    console.error('Error fetching story type:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch story type' } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, icon, description, isActive } = body;

    const storyType = await prisma.storyType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(icon && { icon }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(storyType);
  } catch (error) {
    console.error('Error updating story type:', error);
    return NextResponse.json(
      { error: { message: 'Failed to update story type' } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if story type is being used by any stories
    const storiesCount = await prisma.story.count({
      where: { storyTypeId: id },
    });

    if (storiesCount > 0) {
      return NextResponse.json(
        {
          error: {
            message: 'Cannot delete story type that is being used by stories',
          },
        },
        { status: 400 }
      );
    }

    await prisma.storyType.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Story type deleted successfully' });
  } catch (error) {
    console.error('Error deleting story type:', error);
    return NextResponse.json(
      { error: { message: 'Failed to delete story type' } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
