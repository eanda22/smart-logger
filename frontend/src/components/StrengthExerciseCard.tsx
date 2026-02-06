/**
 * Strength Exercise Card: Set-based input for strength exercises
 * Shows Weight/Reps per set with optional BW (bodyweight) toggle
 */

import { useState, useMemo, useEffect } from 'react'
import { Exercise, WorkoutSet } from '../api/types'
import SetInputBar from './SetInputBar'
import FieldCustomizationPanel from './FieldCustomizationPanel'
import { useUpdateFieldConfig } from '../hooks/useFieldConfig'

interface StrengthExerciseCardProps {
  exerciseName: string
  definition: Exercise
  sets: WorkoutSet[]
  onSetChange: (index: number, newData: WorkoutSet) => void
  onAddSet: () => void
  onRemoveSet: (index: number) => void
  isLoading: boolean
}

export default function StrengthExerciseCard({
  exerciseName,
  definition,
  sets,
  onSetChange,
  onAddSet,
  onRemoveSet,
  isLoading,
}: StrengthExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  // Initialize from saved field_config or use defaults
  const savedFields = (definition.field_config as any)?.visible_fields || ['metric1', 'metric2']
  const [visibleFields, setVisibleFields] = useState<string[]>(savedFields)
  const updateFieldConfig = useUpdateFieldConfig()
  const [bwToggles, setBwToggles] = useState<{ [key: number]: boolean }>(() => {
    // Initialize from existing data: check if metric1_value === "BW"
    const initial: { [key: number]: boolean } = {}
    sets.forEach((set, idx) => {
      initial[idx] = set.metric1_value === 'BW'
    })
    return initial
  })

  // Memoize BW state updates to keep in sync with sets
  useMemo(() => {
    setBwToggles((prev) => {
      const updated = { ...prev }
      sets.forEach((set, idx) => {
        updated[idx] = set.metric1_value === 'BW'
      })
      return updated
    })
  }, [sets])

  const handleBwToggle = (index: number) => {
    const currentSet = sets[index]
    let newMetric1Value: string | null

    if (bwToggles[index]) {
      // Currently BW, switch to empty/last numeric value
      newMetric1Value = null
    } else {
      // Currently numeric, switch to BW
      newMetric1Value = 'BW'
    }

    const updatedSet: WorkoutSet = {
      ...currentSet,
      metric1_value: newMetric1Value,
    }

    onSetChange(index, updatedSet)

    // Toggle state
    setBwToggles((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

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
    <div className="strength-exercise-card">
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
                  <div key={index} className="strength-set-row">
                    <div className="set-input-with-toggle">
                      {bwToggles[index] ? (
                        <div className="bw-display">
                          <div className="set-number">Set {set.set_number}</div>
                          <div className="bw-badge">BW</div>
                          <div className="metric-input">
                            <label>{definition.metric2_name}</label>
                            <input
                              type="number"
                              value={set.metric2_value || ''}
                              onChange={(e) => {
                                const newValue =
                                  e.target.value === '' ? null : e.target.value
                                onSetChange(index, {
                                  ...set,
                                  metric2_value: newValue,
                                })
                              }}
                              placeholder="e.g., 5"
                            />
                            <select
                              value={set.metric2_unit || ''}
                              onChange={(e) => {
                                onSetChange(index, {
                                  ...set,
                                  metric2_unit: e.target.value,
                                })
                              }}
                            >
                              {(definition.metric2_units || []).map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <SetInputBar
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
                      )}
                    </div>

                    <button
                      className={`bw-toggle-btn ${bwToggles[index] ? 'active' : ''}`}
                      onClick={() => handleBwToggle(index)}
                      title="Toggle bodyweight"
                    >
                      BW
                    </button>

                    {bwToggles[index] && (
                      <button
                        className="remove-set-btn"
                        onClick={() => onRemoveSet(index)}
                        title="Remove set"
                      >
                        ✕
                      </button>
                    )}
                  </div>
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
