/**
 * Workout page: setup → logging → summary flow
 * Integrates LoggingView and SummaryView with proper state management
 * Bug fixes: #2 (race condition - await POST), #3 (back nav + done button)
 */

import { useState } from 'react'
import SetupView from '../components/SetupView'
import LoggingView from '../components/LoggingView'
import SummaryView from '../components/SummaryView'
import { useExercises } from '../hooks/useExercises'
import { postWorkoutSession } from '../api/client'
import { WorkoutSet, SessionCreate } from '../api/types'
import '../styles/workout.css'

export default function Workout() {
  const [view, setView] = useState<'setup' | 'logging' | 'summary'>('setup')
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDate, setWorkoutDate] = useState('')
  const [allSets, setAllSets] = useState<{ [exerciseName: string]: WorkoutSet[] }>({})
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
    setView('setup')
    setSelectedExercises([])
    setWorkoutName('')
    setWorkoutDate('')
    setAllSets({})
    setSaveError(null)
  }

  const handleFinish = async (sets: { [exerciseName: string]: WorkoutSet[] }) => {
    setIsSaving(true)
    setSaveError(null)

    try {
      // Get workout date from sets or use today
      const dateForSave = workoutDate || new Date().toISOString().split('T')[0]

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

      // Only transition after successful save
      setWorkoutDate(dateForSave)
      setAllSets(sets)
      setView('summary')
    } catch (error) {
      console.error('Error saving workout:', error)
      setSaveError('Failed to save workout. Please check your connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDone = () => {
    // BUG FIX #3: Clear state completely and return to setup
    setView('setup')
    setSelectedExercises([])
    setWorkoutName('')
    setWorkoutDate('')
    setAllSets({})
    setSaveError(null)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="workout-header">
        <h1>Log Workout</h1>
      </div>

      {view === 'setup' && (
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

      {view === 'summary' && (
        <SummaryView
          allSets={allSets}
          definitions={exercises}
          onDone={handleDone}
        />
      )}
    </div>
  )
}
