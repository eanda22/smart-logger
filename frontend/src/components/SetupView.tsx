/**
 * Workout setup view: template selection, exercise autocomplete, draggable list
 */

import { useState } from 'react'
import { Exercise } from '../api/types'
import { fetchLatestSessionExercises } from '../api/client'
import ExerciseAutocomplete from './ExerciseAutocomplete'
import DraggableExerciseList from './DraggableExerciseList'

interface SetupViewProps {
  exercises: Exercise[]
  onStartWorkout: (exercises: string[], workoutName: string) => void
}

export default function SetupView({ exercises, onStartWorkout }: SetupViewProps) {
  const [workoutName, setWorkoutName] = useState('New Custom Workout')
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Extract unique categories from exercises
  const categories = Array.from(new Set(exercises.map((ex) => ex.category))).sort()

  // Template options: "New Custom Workout" + categories
  const templateOptions = ['New Custom Workout', ...categories]

  // Handle template selection
  const handleTemplateChange = async (templateName: string) => {
    setWorkoutName(templateName)
    setSelectedExercises([])

    if (templateName === 'New Custom Workout') {
      // Clear exercises for custom workout
      return
    }

    // Try to fetch exercises from latest session with this name
    setLoading(true)
    try {
      const templateExercises = await fetchLatestSessionExercises(templateName)

      if (templateExercises.length > 0) {
        // Use exercises from latest session
        setSelectedExercises(templateExercises)
      } else {
        // Fallback: get all exercises from this category
        const categoryExercises = exercises
          .filter((ex) => ex.category === templateName)
          .map((ex) => ex.name)

        setSelectedExercises(categoryExercises)
      }
    } catch (error) {
      console.error('Error fetching template exercises:', error)
      // Fallback: get all exercises from this category
      const categoryExercises = exercises
        .filter((ex) => ex.category === templateName)
        .map((ex) => ex.name)

      setSelectedExercises(categoryExercises)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="card">
      <div className="form-group">
        <label htmlFor="template-select">Workout Template</label>
        <select
          id="template-select"
          value={workoutName}
          onChange={(e) => handleTemplateChange(e.target.value)}
          disabled={loading}
        >
          {templateOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading exercises...</p>}

      <ExerciseAutocomplete
        exercises={exercises}
        existingExercises={selectedExercises}
        onSelect={handleAddExercise}
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
          borderRadius: '6px',
          cursor: selectedExercises.length > 0 ? 'pointer' : 'not-allowed',
        }}
        onClick={handleStartWorkout}
        disabled={selectedExercises.length === 0}
      >
        Start Logging ({selectedExercises.length})
      </button>
    </div>
  )
}
