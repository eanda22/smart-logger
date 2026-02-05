/**
 * Logging view: multi-exercise logging with pre-fill from history
 * Fetches latest sets for each exercise and pre-fills inputs
 */

import { useState, useEffect } from 'react'
import { Exercise, WorkoutSet } from '../api/types'
import { fetchLatestSets } from '../api/client'
import SetInputBar from './SetInputBar'

interface LoggingViewProps {
  exercises: string[]
  workoutName: string
  definitions: Exercise[]
  onBack: () => void
  onFinish: (allSets: { [exerciseName: string]: WorkoutSet[] }) => void
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
  const [expanded, setExpanded] = useState<{ [exerciseName: string]: boolean }>({})
  const [loadingExercises, setLoadingExercises] = useState<Set<string>>(new Set())

  // Initialize sets: fetch historical data and create empty rows
  useEffect(() => {
    const initializeSets = async () => {
      const newSets: { [exerciseName: string]: WorkoutSet[] } = {}

      for (const exerciseName of exercises) {
        setLoadingExercises((prev) => new Set(prev).add(exerciseName))

        // Fetch historical sets for this exercise
        const historicalSets = await fetchLatestSets(exerciseName)

        // Initialize with 3 rows: pre-fill from history if available
        const exerciseSets: WorkoutSet[] = []
        for (let i = 0; i < 3; i++) {
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
            })
          } else {
            // Empty row
            exerciseSets.push({
              id: 0,
              exercise: exerciseName,
              set_number: i + 1,
              metric1_value: null,
              metric1_unit: definitions.find((d) => d.name === exerciseName)?.metric1_units[0] || '',
              metric2_value: null,
              metric2_unit: definitions.find((d) => d.name === exerciseName)?.metric2_units[0] || '',
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

      // Expand first exercise by default
      if (exercises.length > 0) {
        setExpanded({ [exercises[0]]: true })
      }
    }

    initializeSets()
  }, [exercises, definitions])

  const handleToggleExpand = (exerciseName: string) => {
    setExpanded((prev) => ({
      ...prev,
      [exerciseName]: !prev[exerciseName],
    }))
  }

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
    const currentCount = sets[exerciseName]?.length || 0
    const definition = definitions.find((d) => d.name === exerciseName)
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
    onFinish(sets)
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
          const isExpanded = expanded[exerciseName] || false
          const isLoading = loadingExercises.has(exerciseName)

          if (!definition) return null

          return (
            <div key={exerciseName} className="exercise-card">
              <div
                className={`exercise-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => handleToggleExpand(exerciseName)}
              >
                <span className="exercise-name">{exerciseName}</span>
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded && (
                <div className="exercise-body">
                  {isLoading && <p className="loading">Loading history...</p>}

                  {!isLoading && (
                    <>
                      <div className="set-inputs">
                        {sets[exerciseName]?.map((set, index) => (
                          <SetInputBar
                            key={index}
                            setNumber={set.set_number}
                            definition={definition}
                            initialData={set}
                            onRemove={() => handleRemoveSet(exerciseName, index)}
                            onChange={(newData) =>
                              handleSetChange(exerciseName, index, newData)
                            }
                          />
                        ))}
                      </div>

                      <div className="set-controls">
                        <button className="add-button" onClick={() => handleAddSet(exerciseName)}>
                          + Add Set
                        </button>
                        {(sets[exerciseName]?.length || 0) > 3 && (
                          <button
                            className="remove-last-button"
                            onClick={() =>
                              handleRemoveSet(
                                exerciseName,
                                (sets[exerciseName]?.length || 1) - 1
                              )
                            }
                          >
                            - Remove Last
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

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
