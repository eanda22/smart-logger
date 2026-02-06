/**
 * ExerciseList: Scrollable list of exercises with checkboxes, grouped by category
 */

import { Exercise } from '../api/types'

interface ExerciseListProps {
  exercises: Exercise[]
  selectedIds: Set<number>
  onSelectionChange: (id: number, selected: boolean) => void
  isLoading: boolean
}

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  strength: { icon: '💪', color: '#3B82F6' },
  cardio: { icon: '🏃', color: '#10B981' },
  flexibility: { icon: '🧘', color: '#A855F7' },
  recovery: { icon: '🤗', color: '#F59E0B' },
}

export default function ExerciseList({
  exercises,
  selectedIds,
  onSelectionChange,
  isLoading,
}: ExerciseListProps) {
  if (isLoading) {
    return (
      <div className="exercise-list">
        <div className="exercise-item-placeholder">Loading exercises...</div>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="exercise-empty">
        <p>No exercises found</p>
      </div>
    )
  }

  // Group exercises by category
  const grouped = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.category_type]) {
      acc[exercise.category_type] = []
    }
    acc[exercise.category_type].push(exercise)
    return acc
  }, {} as Record<string, Exercise[]>)

  // Sort categories in a consistent order
  const categoryOrder = ['strength', 'cardio', 'flexibility', 'recovery']
  const sortedCategories = categoryOrder.filter((cat) => grouped[cat])

  return (
    <div className="exercise-list">
      {sortedCategories.map((category) => {
        const config = CATEGORY_CONFIG[category] || { icon: '•', color: '#6B7280' }
        const categoryExercises = grouped[category]

        return (
          <div key={category}>
            <div
              className="add-exercise-category"
              style={{ color: config.color }}
            >
              <span>{config.icon}</span>
              <span>{category.toUpperCase()}</span>
            </div>
            {categoryExercises.map((exercise) => {
              const isSelected = selectedIds.has(exercise.id)
              const metrics = [exercise.metric1_name, exercise.metric2_name]
                .filter(Boolean)
                .join(' / ')

              return (
                <label
                  key={exercise.id}
                  className={`exercise-item ${isSelected ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectionChange(exercise.id, e.target.checked)}
                    className="exercise-item-checkbox"
                  />
                  <div className="exercise-item-content">
                    <div className="exercise-item-name">{exercise.name}</div>
                    {metrics && <div className="exercise-item-meta">{metrics}</div>}
                  </div>
                  <button
                    type="button"
                    className="exercise-add-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      onSelectionChange(exercise.id, !isSelected)
                    }}
                    title={isSelected ? 'Remove' : 'Add'}
                  >
                    {isSelected ? '✓' : '+'}
                  </button>
                </label>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
