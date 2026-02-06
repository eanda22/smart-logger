/**
 * Workout setup view: template selection grid
 */

import { useState } from 'react'
import { Exercise } from '../api/types'
import { useTemplates } from '../hooks/useTemplates'
import TemplateSelectionCard from './TemplateSelectionCard'
import AddExerciseModal from './AddExerciseModal'
import DraggableExerciseList from './DraggableExerciseList'

interface SetupViewProps {
  exercises: Exercise[]
  onStartWorkout: (exercises: string[], workoutName: string) => void
}

export default function SetupView({ exercises, onStartWorkout }: SetupViewProps) {
  const { data: templates = [] } = useTemplates()
  const [view, setView] = useState<'template-grid' | 'custom-workout'>('template-grid')
  const [workoutName, setWorkoutName] = useState('Custom Workout')
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false)

  // Handle selecting a saved template
  const handleSelectTemplate = (templateId: number) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setWorkoutName(template.name)
      const exerciseNames = template.template_exercises
        .map((te) => exercises.find((e) => e.id === te.exercise_id)?.name)
        .filter(Boolean) as string[]
      setSelectedExercises(exerciseNames)
    }
  }

  // Handle start from scratch
  const handleStartFromScratch = () => {
    setView('custom-workout')
    setWorkoutName('Custom Workout')
    setSelectedExercises([])
  }

  // Handle adding exercise from autocomplete
  const handleAddExercise = (exerciseName: string) => {
    if (!selectedExercises.includes(exerciseName)) {
      setSelectedExercises([...selectedExercises, exerciseName])
    }
  }

  // Handle reordering exercises
  const handleReorderExercises = (reordered: string[]) => {
    setSelectedExercises(reordered)
  }

  // Handle removing exercise
  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
  }

  // Handle start workout
  const handleStartWorkout = () => {
    if (selectedExercises.length > 0) {
      onStartWorkout(selectedExercises, workoutName)
    }
  }

  // Template grid view
  if (view === 'template-grid') {
    return (
      <div className="setup-view">
        <p className="setup-subtitle">Pick a template to pre-load exercises, or start from scratch.</p>

        <div className="template-selection-grid">
          {templates.map((template) => (
            <TemplateSelectionCard
              key={template.id}
              template={template}
              onClick={() => handleSelectTemplate(template.id)}
            />
          ))}

          <button className="start-from-scratch-card" onClick={handleStartFromScratch}>
            + Start from Scratch
          </button>
        </div>
      </div>
    )
  }

  // Custom workout setup view
  return (
    <div className="custom-workout-setup">
      <button
        className="floating-add-btn"
        onClick={() => setShowAddExerciseModal(true)}
      >
        + Add Exercise
      </button>

      <AddExerciseModal
        isOpen={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onSelectExercise={handleAddExercise}
      />

      <DraggableExerciseList
        exercises={selectedExercises}
        onReorder={handleReorderExercises}
        onRemove={handleRemoveExercise}
      />

      <button
        style={{
          width: '100%',
          padding: '1rem',
          fontSize: '1.1rem',
          backgroundColor: selectedExercises.length > 0 ? 'var(--primary-accent)' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: selectedExercises.length > 0 ? 'pointer' : 'not-allowed',
          marginTop: '1rem',
        }}
        onClick={handleStartWorkout}
        disabled={selectedExercises.length === 0}
      >
        Start Logging ({selectedExercises.length})
      </button>
    </div>
  )
}
