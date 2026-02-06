/**
 * Flexibility Exercise Card: Set-based input for flexibility exercises
 * Shows Hold Time/Reps per set (no BW toggle)
 */

import { useState, useEffect } from 'react'
import { Exercise, WorkoutSet } from '../api/types'
import SetInputBar from './SetInputBar'
import FieldCustomizationPanel from './FieldCustomizationPanel'
import { useUpdateFieldConfig } from '../hooks/useFieldConfig'

interface FlexibilityExerciseCardProps {
  exerciseName: string
  definition: Exercise
  sets: WorkoutSet[]
  onSetChange: (index: number, newData: WorkoutSet) => void
  onAddSet: () => void
  onRemoveSet: (index: number) => void
  isLoading: boolean
}

export default function FlexibilityExerciseCard({
  exerciseName,
  definition,
  sets,
  onSetChange,
  onAddSet,
  onRemoveSet,
  isLoading,
}: FlexibilityExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  // Initialize from saved field_config or use defaults
  const savedFields = (definition.field_config as any)?.visible_fields || ['metric1', 'metric2']
  const [visibleFields, setVisibleFields] = useState<string[]>(savedFields)
  const updateFieldConfig = useUpdateFieldConfig()

  // Persist field customization to backend
  useEffect(() => {
    if (visibleFields.length > 0 && definition.id) {
      updateFieldConfig.mutate({
        exerciseId: definition.id,
        visibleFields,
      })
    }
  }, [visibleFields, definition.id])

  return (
    <div className="flexibility-exercise-card">
      <div className={`exercise-header ${isExpanded ? 'expanded' : ''}`}>
        <div
          className="exercise-header-content"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="exercise-name">{exerciseName}</span>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
        <FieldCustomizationPanel
          exercise={definition}
          visibleFields={visibleFields}
          onVisibleFieldsChange={setVisibleFields}
        />
      </div>

      {isExpanded && (
        <div className="exercise-body">
          {isLoading && <p className="loading">Loading history...</p>}

          {!isLoading && (
            <>
              <div className="set-grid-header">
                <span>Set</span>
                <span>{definition.metric1_name}</span>
                <span>{definition.metric2_name}</span>
                <span></span>
                <span></span>
              </div>
              <div className="set-inputs">
                {sets.map((set, index) => (
                  <SetInputBar
                    key={index}
                    setNumber={set.set_number}
                    definition={definition}
                    initialData={set}
                    onRemove={() => onRemoveSet(index)}
                    onChange={(newData) => onSetChange(index, newData)}
                    isPreFilledMetric1={set.metric1_value !== null && set.id !== 0}
                    isPreFilledMetric2={set.metric2_value !== null && set.id !== 0}
                    isPreFilledMetric3={set.metric3_value !== null && set.id !== 0}
                    visibleFields={visibleFields}
                  />
                ))}
              </div>

              <div className="set-controls">
                <button className="add-button" onClick={onAddSet}>
                  + Add Set
                </button>
                {sets.length > 3 && (
                  <button
                    className="remove-last-button"
                    onClick={() => onRemoveSet(sets.length - 1)}
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
}
