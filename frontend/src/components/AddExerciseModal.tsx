/**
 * AddExerciseModal: Modal for adding exercises to a template
 */

import { useState, useMemo } from 'react'
import { useExercises } from '../hooks/useExercises'
import { useAddExerciseToTemplate } from '../hooks/useTemplates'
import { useQueryClient } from '@tanstack/react-query'
import ExerciseSearchInput from './ExerciseSearchInput'
import CategoryFilter from './CategoryFilter'
import ExerciseList from './ExerciseList'

interface AddExerciseModalProps {
  isOpen: boolean
  templateId?: number
  templateExerciseIds?: number[]
  onClose: () => void
  onSuccess?: () => void
  onSelectExercise?: (exerciseName: string) => void
}

export default function AddExerciseModal({
  isOpen,
  templateId,
  templateExerciseIds = [],
  onClose,
  onSuccess,
  onSelectExercise,
}: AddExerciseModalProps) {
  const { data: exercises = [], isLoading: exercisesLoading } = useExercises()
  const addExerciseMutation = templateId ? useAddExerciseToTemplate(templateId) : null
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<number>>(new Set())
  const [isAdding, setIsAdding] = useState(false)

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    exercises
      .filter((ex) => !templateExerciseIds.includes(ex.id))
      .forEach((ex) => {
        counts[ex.category_type] = (counts[ex.category_type] || 0) + 1
      })
    return counts
  }, [exercises, templateExerciseIds])

  // Determine which categories to show
  const categoriesToShow = useMemo(() => {
    if (selectedCategories.length === 0) {
      return Object.keys(categoryCounts)
    }
    return selectedCategories
  }, [selectedCategories, categoryCounts])

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // Exclude already-added exercises
      if (templateExerciseIds.includes(ex.id)) {
        return false
      }

      // Filter by category
      if (!categoriesToShow.includes(ex.category_type)) {
        return false
      }

      // Filter by search query
      if (searchQuery.trim()) {
        return ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      }

      return true
    })
  }, [exercises, templateExerciseIds, categoriesToShow, searchQuery])

  const handleSelectionChange = (id: number, selected: boolean) => {
    const newSelected = new Set(selectedExerciseIds)
    if (selected) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedExerciseIds(newSelected)
  }

  const handleAddExercises = async () => {
    setIsAdding(true)
    try {
      if (templateId && addExerciseMutation) {
        // Template mode: add to template via API
        for (const exerciseId of Array.from(selectedExerciseIds)) {
          await addExerciseMutation.mutateAsync(exerciseId)
        }
        // Invalidate template query to refetch
        queryClient.invalidateQueries({ queryKey: ['template', templateId] })
        queryClient.invalidateQueries({ queryKey: ['templates'] })
        onSuccess?.()
      } else if (onSelectExercise) {
        // Logging mode: call callback with exercise name
        for (const exerciseId of Array.from(selectedExerciseIds)) {
          const exercise = exercises.find((e) => e.id === exerciseId)
          if (exercise) {
            onSelectExercise(exercise.name)
          }
        }
      }

      // Reset and close
      setSearchQuery('')
      setSelectedCategories([])
      setSelectedExerciseIds(new Set())
      onClose()
    } catch (error) {
      console.error('Error adding exercises:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedExerciseIds(new Set())
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="add-exercise-modal">
        <h2>
          Add Exercise
          <button onClick={handleClose} title="Close">✕</button>
        </h2>

        <div className="add-exercise-search">
          <ExerciseSearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="add-exercise-filters">
          <CategoryFilter
            categoryCounts={categoryCounts}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        <div className="add-exercise-list">
          <ExerciseList
            exercises={filteredExercises}
            selectedIds={selectedExerciseIds}
            onSelectionChange={handleSelectionChange}
            isLoading={exercisesLoading}
          />
        </div>

        <div className="modal-buttons" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            className="btn-primary"
            onClick={handleAddExercises}
            disabled={selectedExerciseIds.size === 0 || isAdding}
          >
            {isAdding ? 'Adding...' : `Add (${selectedExerciseIds.size})`}
          </button>
          <button className="btn-secondary" onClick={handleClose} disabled={isAdding}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
