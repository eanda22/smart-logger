/**
 * Logging view: multi-exercise logging with pre-fill from history
 * Fetches latest sets for each exercise and pre-fills inputs
 * Uses category-aware rendering (Strength, Cardio, Flexibility, Recovery)
 */

import { useState, useEffect } from 'react'
import { Exercise, WorkoutSet } from '../api/types'
import { fetchLatestSets } from '../api/client'
import StrengthExerciseCard from './StrengthExerciseCard'
import CardioExerciseCard from './CardioExerciseCard'
import FlexibilityExerciseCard from './FlexibilityExerciseCard'
import RecoveryExerciseCard from './RecoveryExerciseCard'
import AddExerciseModal from './AddExerciseModal'
import '../styles/category.css'

interface LoggingViewProps {
  exercises: string[]
  workoutName: string
  definitions: Exercise[]
  onBack: () => void
  onFinish: (allSets: { [exerciseName: string]: WorkoutSet[] }, workoutDate: string) => void
}

export default function LoggingView({
  exercises,
  workoutName,
  definitions,
  onBack,
  onFinish,
}: LoggingViewProps) {
  const [workoutDate, setWorkoutDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [sets, setSets] = useState<{ [exerciseName: string]: WorkoutSet[] }>({})
  const [loadingExercises, setLoadingExercises] = useState<Set<string>>(new Set())
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false)

  // Initialize sets: fetch historical data and create empty rows
  useEffect(() => {
    const initializeSets = async () => {
      const newSets: { [exerciseName: string]: WorkoutSet[] } = {}

      for (const exerciseName of exercises) {
        setLoadingExercises((prev) => new Set(prev).add(exerciseName))

        // Fetch historical sets for this exercise
        const historicalSets = await fetchLatestSets(exerciseName)
        const definition = definitions.find((d) => d.name === exerciseName)

        // Determine number of sets based on category type
        const isSingleEntry =
          definition?.category_type === 'cardio' ||
          definition?.category_type === 'recovery'
        const numSets = isSingleEntry ? 1 : 3

        // Initialize with appropriate number of rows: pre-fill from history if available
        const exerciseSets: WorkoutSet[] = []
        for (let i = 0; i < numSets; i++) {
          if (i < historicalSets.length) {
            // Pre-fill with historical data
            exerciseSets.push({
              id: 0,
              exercise: exerciseName,
              set_number: i + 1,
              metric1_value: historicalSets[i].metric1_value,
              metric1_unit: historicalSets[i].metric1_unit,
              metric2_value: historicalSets[i].metric2_value,
              metric2_unit: historicalSets[i].metric2_unit,
              metric3_value: historicalSets[i].metric3_value,
              metric3_unit: historicalSets[i].metric3_unit,
            })
          } else {
            // Empty row
            exerciseSets.push({
              id: 0,
              exercise: exerciseName,
              set_number: i + 1,
              metric1_value: null,
              metric1_unit: definition?.metric1_units[0] || '',
              metric2_value: null,
              metric2_unit: definition?.metric2_units[0] || '',
              metric3_value: null,
              metric3_unit: definition?.metric3_units?.[0] || '',
            })
          }
        }

        newSets[exerciseName] = exerciseSets
        setLoadingExercises((prev) => {
          const updated = new Set(prev)
          updated.delete(exerciseName)
          return updated
        })
      }

      setSets(newSets)
    }

    initializeSets()
  }, [exercises, definitions])

  const handleSetChange = (exerciseName: string, index: number, newData: WorkoutSet) => {
    setSets((prev) => ({
      ...prev,
      [exerciseName]: [
        ...prev[exerciseName].slice(0, index),
        newData,
        ...prev[exerciseName].slice(index + 1),
      ],
    }))
  }

  const handleAddSet = (exerciseName: string) => {
    const definition = definitions.find((d) => d.name === exerciseName)

    // Prevent adding sets to single-entry exercises (cardio/recovery)
    if (
      definition?.category_type === 'cardio' ||
      definition?.category_type === 'recovery'
    ) {
      return
    }

    const currentCount = sets[exerciseName]?.length || 0
    setSets((prev) => ({
      ...prev,
      [exerciseName]: [
        ...(prev[exerciseName] || []),
        {
          id: 0,
          exercise: exerciseName,
          set_number: currentCount + 1,
          metric1_value: null,
          metric1_unit: definition?.metric1_units[0] || '',
          metric2_value: null,
          metric2_unit: definition?.metric2_units[0] || '',
          metric3_value: null,
          metric3_unit: definition?.metric3_units?.[0] || '',
        },
      ],
    }))
  }

  const handleRemoveSet = (exerciseName: string, index: number) => {
    setSets((prev) => ({
      ...prev,
      [exerciseName]: prev[exerciseName].filter((_, i) => i !== index),
    }))
  }

  const handleFinish = () => {
    onFinish(sets, workoutDate)
  }

  const handleAddExercise = async (exerciseName: string) => {
    // Skip if already added
    if (exercises.includes(exerciseName)) {
      return
    }

    setLoadingExercises((prev) => new Set(prev).add(exerciseName))

    try {
      const definition = definitions.find((d) => d.name === exerciseName)
      if (!definition) return

      // Fetch historical sets for smart defaults
      const historicalSets = await fetchLatestSets(exerciseName)

      // Determine number of sets based on category type
      const isSingleEntry =
        definition.category_type === 'cardio' ||
        definition.category_type === 'recovery'
      const numSets = isSingleEntry ? 1 : 3

      // Initialize sets with smart defaults
      const exerciseSets: WorkoutSet[] = []
      for (let i = 0; i < numSets; i++) {
        if (i < historicalSets.length) {
          exerciseSets.push({
            id: 0,
            exercise: exerciseName,
            set_number: i + 1,
            metric1_value: historicalSets[i].metric1_value,
            metric1_unit: historicalSets[i].metric1_unit,
            metric2_value: historicalSets[i].metric2_value,
            metric2_unit: historicalSets[i].metric2_unit,
            metric3_value: historicalSets[i].metric3_value,
            metric3_unit: historicalSets[i].metric3_unit,
          })
        } else {
          exerciseSets.push({
            id: 0,
            exercise: exerciseName,
            set_number: i + 1,
            metric1_value: null,
            metric1_unit: definition.metric1_units[0] || '',
            metric2_value: null,
            metric2_unit: definition.metric2_units[0] || '',
            metric3_value: null,
            metric3_unit: definition.metric3_units?.[0] || '',
          })
        }
      }

      setSets((prev) => ({
        ...prev,
        [exerciseName]: exerciseSets,
      }))
    } catch (error) {
      console.error('Error adding exercise:', error)
    } finally {
      setLoadingExercises((prev) => {
        const updated = new Set(prev)
        updated.delete(exerciseName)
        return updated
      })
    }
  }

  return (
    <div className="logging-view">
      <div className="logging-header">
        <h2>{workoutName}</h2>
        <div className="date-picker">
          <label>Date:</label>
          <input
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
          />
        </div>
      </div>

      <div className="exercises-list">
        {exercises.map((exerciseName) => {
          const definition = definitions.find((d) => d.name === exerciseName)
          const isLoading = loadingExercises.has(exerciseName)

          if (!definition) return null

          // Render category-specific card based on category_type
          switch (definition.category_type) {
            case 'strength':
              return (
                <StrengthExerciseCard
                  key={exerciseName}
                  exerciseName={exerciseName}
                  definition={definition}
                  sets={sets[exerciseName] || []}
                  onSetChange={(index, newData) =>
                    handleSetChange(exerciseName, index, newData)
                  }
                  onAddSet={() => handleAddSet(exerciseName)}
                  onRemoveSet={(index) => handleRemoveSet(exerciseName, index)}
                  isLoading={isLoading}
                />
              )

            case 'cardio':
              return (
                <CardioExerciseCard
                  key={exerciseName}
                  exerciseName={exerciseName}
                  definition={definition}
                  sets={sets[exerciseName] || []}
                  onSetChange={(index, newData) =>
                    handleSetChange(exerciseName, index, newData)
                  }
                  isLoading={isLoading}
                />
              )

            case 'flexibility':
              return (
                <FlexibilityExerciseCard
                  key={exerciseName}
                  exerciseName={exerciseName}
                  definition={definition}
                  sets={sets[exerciseName] || []}
                  onSetChange={(index, newData) =>
                    handleSetChange(exerciseName, index, newData)
                  }
                  onAddSet={() => handleAddSet(exerciseName)}
                  onRemoveSet={(index) => handleRemoveSet(exerciseName, index)}
                  isLoading={isLoading}
                />
              )

            case 'recovery':
              return (
                <RecoveryExerciseCard
                  key={exerciseName}
                  exerciseName={exerciseName}
                  definition={definition}
                  sets={sets[exerciseName] || []}
                  onSetChange={(index, newData) =>
                    handleSetChange(exerciseName, index, newData)
                  }
                  isLoading={isLoading}
                />
              )

            default:
              // Fallback to strength card for unknown types
              return (
                <StrengthExerciseCard
                  key={exerciseName}
                  exerciseName={exerciseName}
                  definition={definition}
                  sets={sets[exerciseName] || []}
                  onSetChange={(index, newData) =>
                    handleSetChange(exerciseName, index, newData)
                  }
                  onAddSet={() => handleAddSet(exerciseName)}
                  onRemoveSet={(index) => handleRemoveSet(exerciseName, index)}
                  isLoading={isLoading}
                />
              )
          }
        })}

        <button
          className="floating-add-btn"
          onClick={() => setShowAddExerciseModal(true)}
        >
          + Add Exercise
        </button>
      </div>

      <AddExerciseModal
        isOpen={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onSelectExercise={handleAddExercise}
      />

      <div className="logging-footer">
        <button className="back-button" onClick={onBack}>
          Back
        </button>
        <button className="finish-button" onClick={handleFinish}>
          Finish Workout
        </button>
      </div>
    </div>
  )
}
