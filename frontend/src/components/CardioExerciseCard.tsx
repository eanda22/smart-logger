/**
 * Cardio Exercise Card: Single-entry form for cardio exercises
 * Shows Duration/Distance/Heart Rate in a vertical form layout
 */

import { useState, useEffect } from 'react'
import { Exercise, WorkoutSet } from '../api/types'
import FieldCustomizationPanel from './FieldCustomizationPanel'
import { useUpdateFieldConfig } from '../hooks/useFieldConfig'

interface CardioExerciseCardProps {
  exerciseName: string
  definition: Exercise
  sets: WorkoutSet[]
  onSetChange: (index: number, newData: WorkoutSet) => void
  isLoading: boolean
}

export default function CardioExerciseCard({
  exerciseName,
  definition,
  sets,
  onSetChange,
  isLoading,
}: CardioExerciseCardProps) {
  // Initialize from saved field_config or use defaults
  const savedFields =
    (definition.field_config as any)?.visible_fields || ['metric1', 'metric2', 'metric3']
  const [visibleFields, setVisibleFields] = useState<string[]>(savedFields)
  const updateFieldConfig = useUpdateFieldConfig()

  const currentSet = sets[0] || {
    id: 0,
    exercise: exerciseName,
    set_number: 1,
    metric1_value: null,
    metric1_unit: definition.metric1_units?.[0] || '',
    metric2_value: null,
    metric2_unit: definition.metric2_units?.[0] || '',
    metric3_value: null,
    metric3_unit: definition.metric3_units?.[0] || '',
  }

  const [metric1Value, setMetric1Value] = useState<string | null>(
    currentSet.metric1_value || null
  )
  const [metric1Unit, setMetric1Unit] = useState(
    currentSet.metric1_unit || definition.metric1_units?.[0] || ''
  )
  const [metric2Value, setMetric2Value] = useState<string | null>(
    currentSet.metric2_value || null
  )
  const [metric2Unit, setMetric2Unit] = useState(
    currentSet.metric2_unit || definition.metric2_units?.[0] || ''
  )
  const [metric3Value, setMetric3Value] = useState<string | null>(
    currentSet.metric3_value || null
  )
  const [metric3Unit, setMetric3Unit] = useState(
    currentSet.metric3_unit || definition.metric3_units?.[0] || ''
  )

  // Update local state when set changes
  useEffect(() => {
    setMetric1Value(currentSet.metric1_value || null)
    setMetric1Unit(currentSet.metric1_unit || definition.metric1_units?.[0] || '')
    setMetric2Value(currentSet.metric2_value || null)
    setMetric2Unit(currentSet.metric2_unit || definition.metric2_units?.[0] || '')
    setMetric3Value(currentSet.metric3_value || null)
    setMetric3Unit(currentSet.metric3_unit || definition.metric3_units?.[0] || '')
  }, [currentSet, definition])

  // Persist field customization to backend
  useEffect(() => {
    if (visibleFields.length > 0 && definition.id) {
      updateFieldConfig.mutate({
        exerciseId: definition.id,
        visibleFields,
      })
    }
  }, [visibleFields, definition.id])

  const handleMetric1ValueChange = (value: string) => {
    const newValue = value === '' ? null : value
    setMetric1Value(newValue)
    onSetChange(0, {
      ...currentSet,
      metric1_value: newValue,
      metric1_unit: metric1Unit,
    })
  }

  const handleMetric1UnitChange = (unit: string) => {
    setMetric1Unit(unit)
    onSetChange(0, {
      ...currentSet,
      metric1_unit: unit,
    })
  }

  const handleMetric2ValueChange = (value: string) => {
    const newValue = value === '' ? null : value
    setMetric2Value(newValue)
    onSetChange(0, {
      ...currentSet,
      metric2_value: newValue,
      metric2_unit: metric2Unit,
    })
  }

  const handleMetric2UnitChange = (unit: string) => {
    setMetric2Unit(unit)
    onSetChange(0, {
      ...currentSet,
      metric2_unit: unit,
    })
  }

  const handleMetric3ValueChange = (value: string) => {
    const newValue = value === '' ? null : value
    setMetric3Value(newValue)
    onSetChange(0, {
      ...currentSet,
      metric3_value: newValue,
      metric3_unit: metric3Unit,
    })
  }

  const handleMetric3UnitChange = (unit: string) => {
    setMetric3Unit(unit)
    onSetChange(0, {
      ...currentSet,
      metric3_unit: unit,
    })
  }

  return (
    <div className="cardio-exercise-card">
      <div className="exercise-header">
        <span className="exercise-name">{exerciseName}</span>
        <FieldCustomizationPanel
          exercise={definition}
          visibleFields={visibleFields}
          onVisibleFieldsChange={setVisibleFields}
        />
      </div>

      <div className="exercise-body">
        {isLoading && <p className="loading">Loading history...</p>}

        {!isLoading && (
          <div className="single-entry-form">
            {/* Metric 1 */}
            {visibleFields.includes('metric1') && (
            <div className={`cardio-form-row ${metric1Value !== null && currentSet.id !== 0 ? 'pre-filled' : ''}`}>
              <label>{definition.metric1_name}</label>
              <div className="metric-input-row">
                <input
                  type="number"
                  value={metric1Value || ''}
                  onChange={(e) => handleMetric1ValueChange(e.target.value)}
                  placeholder="e.g., 30"
                />
                <select
                  value={metric1Unit}
                  onChange={(e) => handleMetric1UnitChange(e.target.value)}
                >
                  {(definition.metric1_units || []).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            )}

            {/* Metric 2 */}
            {visibleFields.includes('metric2') && (
            <div className={`cardio-form-row ${metric2Value !== null && currentSet.id !== 0 ? 'pre-filled' : ''}`}>
              <label>{definition.metric2_name}</label>
              <div className="metric-input-row">
                <input
                  type="number"
                  value={metric2Value || ''}
                  onChange={(e) => handleMetric2ValueChange(e.target.value)}
                  placeholder="e.g., 3"
                />
                <select
                  value={metric2Unit}
                  onChange={(e) => handleMetric2UnitChange(e.target.value)}
                >
                  {(definition.metric2_units || []).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            )}

            {/* Metric 3 (if exists, e.g., Heart Rate for cardio) */}
            {visibleFields.includes('metric3') && definition.metric3_name && (
              <div className={`cardio-form-row ${metric3Value !== null && currentSet.id !== 0 ? 'pre-filled' : ''}`}>
                <label>{definition.metric3_name}</label>
                <div className="metric-input-row">
                  <input
                    type="number"
                    value={metric3Value || ''}
                    onChange={(e) => handleMetric3ValueChange(e.target.value)}
                    placeholder="e.g., 140"
                  />
                  <select
                    value={metric3Unit}
                    onChange={(e) => handleMetric3UnitChange(e.target.value)}
                  >
                    {(definition.metric3_units || []).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
