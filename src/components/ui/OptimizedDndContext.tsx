'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React, { useCallback, useMemo } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';

interface OptimizedDndContextProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  items: UniqueIdentifier[];
  strategy?: 'vertical' | 'horizontal';
  className?: string;
  disabled?: boolean;
}

/**
 * Optimized DnD Context with performance optimizations
 */
export function OptimizedDndContext({
  children,
  onDragEnd,
  onDragStart,
  onDragOver,
  items,
  strategy = 'vertical',
  className = '',
  disabled = false,
}: OptimizedDndContextProps) {
  const { shouldAnimate } = useReducedMotion();

  // Optimized sensors with reduced sensitivity on mobile
  // Use shouldAnimate to control animation intensity
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: shouldAnimate ? 8 : 12, // More sensitive when animations are disabled
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoized strategy to prevent unnecessary re-renders
  const sortingStrategy = useMemo(() => {
    return strategy === 'horizontal' 
      ? horizontalListSortingStrategy 
      : verticalListSortingStrategy;
  }, [strategy]);

  // Optimized drag end handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    onDragEnd(event);
  }, [onDragEnd]);

  // Optimized drag start handler
  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (onDragStart) {
      onDragStart(event);
    }
  }, [onDragStart]);

  // Optimized drag over handler
  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (onDragOver) {
      onDragOver(event);
    }
  }, [onDragOver]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      <SortableContext items={items} strategy={sortingStrategy}>
        <div className={className}>
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface OptimizedSortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  dragOverlay?: React.ReactNode;
}

/**
 * Optimized sortable item with performance optimizations
 */
export function OptimizedSortableItem({
  id,
  children,
  className = '',
  disabled = false,
  dragOverlay: _,
}: OptimizedSortableItemProps) {
  const { shouldAnimate } = useReducedMotion();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  // Optimized transform style
  const style = useMemo(() => {
    if (!transform) return {};

    return {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      transition: shouldAnimate ? transition : 'none',
      zIndex: isDragging ? 1000 : 'auto',
    };
  }, [transform, transition, isDragging, shouldAnimate]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

interface OptimizedDroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Optimized droppable area
 */
export function OptimizedDroppable({
  id,
  children,
  className = '',
  disabled = false,
}: OptimizedDroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-blue-50 border-blue-200' : ''}`}
    >
      {children}
    </div>
  );
}

interface OptimizedDragOverlayProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Optimized drag overlay with reduced motion support
 */
export function OptimizedDragOverlay({
  children,
  className = '',
}: OptimizedDragOverlayProps) {
  const { shouldAnimate } = useReducedMotion();

  if (!shouldAnimate) {
    return null;
  }

  return (
    <DragOverlay
      className={className}
      style={{
        opacity: 0.9,
      }}
      dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}
      modifiers={[
        restrictToWindowEdges,
        ({ transform }) => ({
          ...transform,
          x: transform.x + 5,
          y: transform.y + 5,
        }),
      ]}
    >
      {children}
    </DragOverlay>
  );
}

// Re-export commonly used utilities
export {
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
};

// Re-export types
export type {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
};

