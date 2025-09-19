// Optimized @dnd-kit imports to reduce bundle size
// Only import the specific components we need

export {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';

export type {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';

export {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

export {
  useDroppable,
} from '@dnd-kit/core';

// Re-export commonly used sensor configurations
export const useCreateSensors = () => {
  const { useSensor, useSensors, PointerSensor, KeyboardSensor } = require('@dnd-kit/core');
  
  return useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: require('@dnd-kit/sortable').sortableKeyboardCoordinates,
    })
  );
};
