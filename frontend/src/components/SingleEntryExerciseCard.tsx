/**
 * Single-entry exercise card: Unified component for cardio, recovery, and other single-set exercises
 * Renders 1-3 metrics based on definition and field visibility
 */

import { useState, useEffect } from 'react'
import { Exercise, WorkoutSet } from '../api/types'
import FieldCustomizationPanel from './FieldCustomizationPanel'
import { useUpdateFieldConfig } from '../hooks/useFieldConfig'

interface SingleEntryExerciseCardProps {
  exerciseName: string
  definition: Exercise
  sets: WorkoutSet[]
  onSetChange: (index: number, newData: WorkoutSet) => void
  isLoading: boolean
  cardType?: 'cardio' | 'recovery' // For styling/context
}

export default function SingleEntryExerciseCard({
  exerciseName,
  definition,
  sets,
  onSetChange,
  isLoading,
  cardType = 'cardio',
}: SingleEntryExerciseCardProps) {
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

  const [metrics, setMetrics] = useState({
    metric1Value: currentSet.metric1_value || null as string | null,
    metric1Unit: currentSet.metric1_unit || definition.metric1_units?.[0] || '',
    metric2Value: currentSet.metric2_value || null as string | null,
    metric2Unit: currentSet.metric2_unit || definition.metric2_units?.[0] || '',
    metric3Value: currentSet.metric3_value || null as string | null,
    metric3Unit: currentSet.metric3_unit || definition.metric3_units?.[0] || '',
  })

  // Update local state when set changes
  useEffect(() => {
    setMetrics({
      metric1Value: currentSet.metric1_value || null,
      metric1Unit: currentSet.metric1_unit || definition.metric1_units?.[0] || '',
      metric2Value: currentSet.metric2_value || null,
      metric2Unit: currentSet.metric2_unit || definition.metric2_units?.[0] || '',
      metric3Value: currentSet.metric3_value || null,
      metric3Unit: currentSet.metric3_unit || definition.metric3_units?.[0] || '',
    })
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
    setMetrics((prev) => ({ ...prev, metric1Value: newValue }))
    onSetChange(0, {
      ...currentSet,
      metric1_value: newValue,
      metric1_unit: metrics.metric1Unit,
    })
  }

  const handleMetric1UnitChange = (unit: string) => {
    setMetrics((prev) => ({ ...prev, metric1Unit: unit }))
    onSetChange(0, {
      ...currentSet,
      metric1_unit: unit,
    })
  }

  const handleMetric2ValueChange = (value: string) => {
    const newValue = value === '' ? null : value
    setMetrics((prev) => ({ ...prev, metric2Value: newValue }))
    onSetChange(0, {
      ...currentSet,
      metric2_value: newValue,
      metric2_unit: metrics.metric2Unit,
    })
  }

  const handleMetric2UnitChange = (unit: string) => {
    setMetrics((prev) => ({ ...prev, metric2Unit: unit }))
    onSetChange(0, {
      ...currentSet,
      metric2_unit: unit,
    })
  }

  const handleMetric3ValueChange = (value: string) => {
    const newValue = value === '' ? null : value
    setMetrics((prev) => ({ ...prev, metric3Value: newValue }))
    onSetChange(0, {
      ...currentSet,
      metric3_value: newValue,
      metric3_unit: metrics.metric3Unit,
    })
  }

  const handleMetric3UnitChange = (unit: string) => {
    setMetrics((prev) => ({ ...prev, metric3Unit: unit }))
    onSetChange(0, {
      ...currentSet,
      metric3_unit: unit,
    })
  }

  const containerClass = cardType === 'recovery' ? 'recovery-exercise-card' : 'cardio-exercise-card'
  const formRowClass = cardType === 'recovery' ? 'recovery-form-row' : 'cardio-form-row'

  return (
    <div className={containerClass}>
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
              <div className={`${formRowClass} ${metrics.metric1Value !== null && currentSet.id !== 0 ? 'pre-filled' : ''}`}>
                <label>{definition.metric1_name}</label>
                <div className="metric-input-row">
                  <input
                    type="number"
                    value={metrics.metric1Value || ''}
                    onChange={(e) => handleMetric1ValueChange(e.target.value)}
                    placeholder="e.g., 30"
                  />
                  <select
                    value={metrics.metric1Unit}
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
              <div className={`${formRowClass} ${metrics.metric2Value !== null && currentSet.id !== 0 ? 'pre-filled' : ''}`}>
                <label>{definition.metric2_name}</label>
                <div className="metric-input-row">
                  <input
                    type="number"
                    value={metrics.metric2Value || ''}
                    onChange={(e) => handleMetric2ValueChange(e.target.value)}
                    placeholder="e.g., 3"
                  />
                  <select
                    value={metrics.metric2Unit}
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
              <div className={`${formRowClass} ${metrics.metric3Value !== null && currentSet.id !== 0 ? 'pre-filled' : ''}`}>
                <label>{definition.metric3_name}</label>
                <div className="metric-input-row">
                  <input
                    type="number"
                    value={metrics.metric3Value || ''}
                    onChange={(e) => handleMetric3ValueChange(e.target.value)}
                    placeholder="e.g., 140"
                  />
                  <select
                    value={metrics.metric3Unit}
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
