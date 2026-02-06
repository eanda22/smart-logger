/**
 * Workout page: setup → logging → summary flow
 * Integrates LoggingView and SummaryView with proper state management
 * Bug fixes: #2 (race condition - await POST), #3 (back nav + done button)
 */

import { useState } from 'react'
import SetupView from '../components/SetupView'
import LoggingView from '../components/LoggingView'
import { useExercises } from '../hooks/useExercises'
import { postWorkoutSession } from '../api/client'
import { WorkoutSet, SessionCreate } from '../api/types'
import '../styles/workout.css'

export default function Workout() {
  const [view, setView] = useState<'template' | 'logging'>('template')
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [workoutName, setWorkoutName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data: exercises = [] } = useExercises()

  const handleStartWorkout = (exerciseList: string[], name: string) => {
    setSelectedExercises(exerciseList)
    setWorkoutName(name)
    setSaveError(null)
    setView('logging')
  }

  const handleBack = () => {
    setView('template')
    setSelectedExercises([])
    setWorkoutName('')
    setSaveError(null)
  }

  const handleFinish = async (sets: { [exerciseName: string]: WorkoutSet[] }, workoutDate: string) => {
    setIsSaving(true)
    setSaveError(null)

    try {
      const dateForSave = workoutDate

      // Construct the session object
      const flattenedSets = Object.entries(sets).flatMap(([exerciseName, setSets]) =>
        setSets.map((s) => ({
          exercise: exerciseName,
          set_number: s.set_number,
          metric1_value: s.metric1_value,
          metric1_unit: s.metric1_unit,
          metric2_value: s.metric2_value,
          metric2_unit: s.metric2_unit,
        }))
      )

      const session: SessionCreate = {
        name: workoutName,
        date: dateForSave,
        sets: flattenedSets,
      }

      // BUG FIX #2: AWAIT the POST before transitioning
      await postWorkoutSession(session)

      // Only transition after successful save, reset to template selection
      setSelectedExercises([])
      setWorkoutName('')
      setView('template')
    } catch (error) {
      console.error('Error saving workout:', error)
      setSaveError('Failed to save workout. Please check your connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="workout-header">
        <h1>Log Workout</h1>
      </div>

      {view === 'template' && (
        <SetupView exercises={exercises} onStartWorkout={handleStartWorkout} />
      )}

      {view === 'logging' && (
        <>
          <LoggingView
            exercises={selectedExercises}
            workoutName={workoutName}
            definitions={exercises}
            onBack={handleBack}
            onFinish={handleFinish}
          />
          {saveError && (
            <div className="error-modal">
              <div className="error-content">
                <h3>Error</h3>
                <p>{saveError}</p>
                <button onClick={() => setSaveError(null)}>Dismiss</button>
              </div>
            </div>
          )}
          {isSaving && (
            <div className="loading-overlay">
              <p>Saving workout...</p>
            </div>
          )}
        </>
      )}

    </div>
  )
}
