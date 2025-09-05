import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storyIdea = await prisma.storyIdea.findUnique({
      where: { id },
    });

    if (!storyIdea) {
      return NextResponse.json(
        { error: { message: 'Story idea not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(storyIdea);
  } catch (error) {
    console.error('Error fetching story idea:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch story idea' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      category,
      storyType,
      template,
      guidelines,
      icon,
      isActive,
    } = body;

    const storyIdea = await prisma.storyIdea.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(storyType && { storyType }),
        ...(template !== undefined && { template }),
        ...(guidelines !== undefined && { guidelines }),
        ...(icon && { icon }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(storyIdea);
  } catch (error) {
    console.error('Error updating story idea:', error);
    return NextResponse.json(
      { error: { message: 'Failed to update story idea' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if story idea is being used by any stories
    const storiesCount = await prisma.story.count({
      where: { storyIdeaId: id },
    });

    if (storiesCount > 0) {
      return NextResponse.json(
        {
          error: {
            message: 'Cannot delete story idea that is being used by stories',
          },
        },
        { status: 400 }
      );
    }

    await prisma.storyIdea.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Story idea deleted successfully' });
  } catch (error) {
    console.error('Error deleting story idea:', error);
    return NextResponse.json(
      { error: { message: 'Failed to delete story idea' } },
      { status: 500 }
    );
  }
}
