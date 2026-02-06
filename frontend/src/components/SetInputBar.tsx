/**
 * Single set input row: displays set number, metric inputs, and remove button
 * Pre-fills with historical data if provided
 */

import { useState, useEffect } from 'react'
import { Exercise, WorkoutSet } from '../api/types'
import UnitSelector from './UnitSelector'

interface SetInputBarProps {
  setNumber: number
  definition: Exercise
  initialData?: WorkoutSet
  onRemove: () => void
  onChange: (data: WorkoutSet) => void
  isPreFilledMetric1?: boolean
  isPreFilledMetric2?: boolean
  isPreFilledMetric3?: boolean
  visibleFields?: string[]
}

export default function SetInputBar({
  setNumber,
  definition,
  initialData,
  onRemove,
  onChange,
  isPreFilledMetric1 = false,
  isPreFilledMetric2 = false,
  isPreFilledMetric3 = false,
  visibleFields = ['metric1', 'metric2', 'metric3'],
}: SetInputBarProps) {
  const [metric1Value, setMetric1Value] = useState<string | null>(null)
  const [metric1Unit, setMetric1Unit] = useState(definition.metric1_units[0] || '')
  const [metric2Value, setMetric2Value] = useState<string | null>(null)
  const [metric2Unit, setMetric2Unit] = useState(definition.metric2_units[0] || '')
  const [metric3Value, setMetric3Value] = useState<string | null>(null)
  const [metric3Unit, setMetric3Unit] = useState(definition.metric3_units?.[0] || '')

  // Pre-fill with historical data on mount
  useEffect(() => {
    if (initialData) {
      setMetric1Value(initialData.metric1_value)
      setMetric1Unit(initialData.metric1_unit || definition.metric1_units[0] || '')
      setMetric2Value(initialData.metric2_value)
      setMetric2Unit(initialData.metric2_unit || definition.metric2_units[0] || '')
      setMetric3Value(initialData.metric3_value || null)
      setMetric3Unit(initialData.metric3_unit || (definition.metric3_units?.[0] ?? ''))
    }
  }, [initialData, definition])

  // Notify parent of any change
  const notifyChange = (m1v: string | null, m1u: string, m2v: string | null, m2u: string, m3v: string | null = null, m3u: string = '') => {
    onChange({
      id: initialData?.id || 0,
      exercise: definition.name,
      set_number: setNumber,
      metric1_value: m1v,
      metric1_unit: m1u,
      metric2_value: m2v,
      metric2_unit: m2u,
      metric3_value: m3v,
      metric3_unit: m3u,
    })
  }

  const handleMetric1ValueChange = (value: string) => {
    const stringValue = value === '' ? null : value
    setMetric1Value(stringValue)
    notifyChange(stringValue, metric1Unit, metric2Value, metric2Unit, metric3Value, metric3Unit)
  }

  const handleMetric1UnitChange = (unit: string) => {
    setMetric1Unit(unit)
    notifyChange(metric1Value, unit, metric2Value, metric2Unit, metric3Value, metric3Unit)
  }

  const handleMetric2ValueChange = (value: string) => {
    const stringValue = value === '' ? null : value
    setMetric2Value(stringValue)
    notifyChange(metric1Value, metric1Unit, stringValue, metric2Unit, metric3Value, metric3Unit)
  }

  const handleMetric2UnitChange = (unit: string) => {
    setMetric2Unit(unit)
    notifyChange(metric1Value, metric1Unit, metric2Value, unit, metric3Value, metric3Unit)
  }

  const handleMetric3ValueChange = (value: string) => {
    const stringValue = value === '' ? null : value
    setMetric3Value(stringValue)
    notifyChange(metric1Value, metric1Unit, metric2Value, metric2Unit, stringValue, metric3Unit)
  }

  const handleMetric3UnitChange = (unit: string) => {
    setMetric3Unit(unit)
    notifyChange(metric1Value, metric1Unit, metric2Value, metric2Unit, metric3Value, unit)
  }

  return (
    <div className="set-input-bar">
      <div className="set-number">Set {setNumber}</div>

      {visibleFields.includes('metric1') && (
        <div className={`metric-input ${isPreFilledMetric1 ? 'pre-filled' : ''}`}>
          <label>{definition.metric1_name}</label>
          <input
            type="number"
            step="0.5"
            value={metric1Value !== null ? metric1Value : ''}
            onChange={(e) => handleMetric1ValueChange(e.target.value)}
            placeholder="0"
          />
          <UnitSelector
            units={definition.metric1_units}
            selected={metric1Unit}
            onSelect={handleMetric1UnitChange}
          />
        </div>
      )}

      {visibleFields.includes('metric2') && (
        <div className={`metric-input ${isPreFilledMetric2 ? 'pre-filled' : ''}`}>
          <label>{definition.metric2_name}</label>
          <input
            type="number"
            step="0.5"
            value={metric2Value !== null ? metric2Value : ''}
            onChange={(e) => handleMetric2ValueChange(e.target.value)}
            placeholder="0"
          />
          <UnitSelector
            units={definition.metric2_units}
            selected={metric2Unit}
            onSelect={handleMetric2UnitChange}
          />
        </div>
      )}

      {visibleFields.includes('metric3') && definition.metric3_name && (
        <div className={`metric-input ${isPreFilledMetric3 ? 'pre-filled' : ''}`}>
          <label>{definition.metric3_name}</label>
          <input
            type="number"
            step="0.5"
            value={metric3Value !== null ? metric3Value : ''}
            onChange={(e) => handleMetric3ValueChange(e.target.value)}
            placeholder="0"
          />
          <UnitSelector
            units={definition.metric3_units || []}
            selected={metric3Unit}
            onSelect={handleMetric3UnitChange}
          />
        </div>
      )}

      <button className="remove-button" onClick={onRemove}>
        Remove
      </button>
    </div>
  )
}
