import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';
import { tr } from '@/content/tr';
import { cn } from '@/lib/utils';

const t = tr.admin.menu;

const announcements = {
  onDragStart: () => t.dragStart,
  onDragOver: () => t.dragOver,
  onDragEnd: () => t.dragEnd,
  onDragCancel: () => t.dragCancel,
};

/**
 * A vertical list that can be reordered by dragging (touch and mouse) or from the keyboard:
 * focus a grip handle, press Space, move with the arrow keys, press Space again to drop.
 * Rows are SortableRow children and only their handle starts a drag, so taps still work.
 */
export function SortableList({
  ids,
  onReorder,
  className,
  children,
}: {
  ids: string[];
  onReorder: (activeId: string, overId: string) => void;
  className?: string;
  children: ReactNode;
}) {
  const sensors = useSensors(
    // A few pixels of movement first, so a tap on the row never starts a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: t.dragInstructions },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={className}>{children}</ul>
      </SortableContext>
    </DndContext>
  );
}

/**
 * One draggable row. The children get the grip handle to place where they want it; the handle
 * is the only part that starts a drag, so the rest of the row stays tappable.
 */
export function SortableRow({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: (handle: ReactNode) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={label}
      {...attributes}
      {...listeners}
      aria-roledescription={t.dragRole}
      className="flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground [@media(hover:hover)]:hover:bg-tint active:cursor-grabbing"
    >
      <GripVertical className="size-5" aria-hidden="true" />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'relative z-10 opacity-90 shadow-sm')}
    >
      {children(handle)}
    </li>
  );
}
