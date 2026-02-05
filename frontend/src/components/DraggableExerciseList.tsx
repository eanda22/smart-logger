/**
 * Draggable exercise list with @dnd-kit
 */

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DraggableExerciseListProps {
  exercises: string[]
  onReorder: (reordered: string[]) => void
  onRemove: (index: number) => void
}

function SortableItem({
  id,
  exercise,
  index,
  onRemove,
}: {
  id: string
  exercise: string
  index: number
  onRemove: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li ref={setNodeRef} style={style} className={isDragging ? 'sortable-ghost' : ''}>
      <span className="drag-handle" {...attributes} {...listeners}>
        ☰
      </span>
      <span className="exercise-name">{exercise}</span>
      <button className="remove-exercise-btn" onClick={() => onRemove(index)}>
        ✕
      </button>
    </li>
  )
}

export default function DraggableExerciseList({
  exercises,
  onReorder,
  onRemove,
}: DraggableExerciseListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = exercises.indexOf(active.id as string)
      const newIndex = exercises.indexOf(over.id as string)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(exercises, oldIndex, newIndex)
        onReorder(newOrder)
      }
    }
  }

  if (exercises.length === 0) {
    return null
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={exercises} strategy={verticalListSortingStrategy}>
        <ul id="exercise-list">
          {exercises.map((exercise, index) => (
            <SortableItem
              key={exercise}
              id={exercise}
              exercise={exercise}
              index={index}
              onRemove={onRemove}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
