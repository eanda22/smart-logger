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
}

export default function SetInputBar({
  setNumber,
  definition,
  initialData,
  onRemove,
  onChange,
}: SetInputBarProps) {
  const [metric1Value, setMetric1Value] = useState<number | null>(null)
  const [metric1Unit, setMetric1Unit] = useState(definition.metric1_units[0] || '')
  const [metric2Value, setMetric2Value] = useState<number | null>(null)
  const [metric2Unit, setMetric2Unit] = useState(definition.metric2_units[0] || '')

  // Pre-fill with historical data on mount
  useEffect(() => {
    if (initialData) {
      setMetric1Value(initialData.metric1_value)
      setMetric1Unit(initialData.metric1_unit || definition.metric1_units[0] || '')
      setMetric2Value(initialData.metric2_value)
      setMetric2Unit(initialData.metric2_unit || definition.metric2_units[0] || '')
    }
  }, [initialData, definition])

  // Notify parent of any change
  const notifyChange = (m1v: number | null, m1u: string, m2v: number | null, m2u: string) => {
    onChange({
      id: initialData?.id || 0,
      exercise: definition.name,
      set_number: setNumber,
      metric1_value: m1v,
      metric1_unit: m1u,
      metric2_value: m2v,
      metric2_unit: m2u,
    })
  }

  const handleMetric1ValueChange = (value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    setMetric1Value(numValue)
    notifyChange(numValue, metric1Unit, metric2Value, metric2Unit)
  }

  const handleMetric1UnitChange = (unit: string) => {
    setMetric1Unit(unit)
    notifyChange(metric1Value, unit, metric2Value, metric2Unit)
  }

  const handleMetric2ValueChange = (value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    setMetric2Value(numValue)
    notifyChange(metric1Value, metric1Unit, numValue, metric2Unit)
  }

  const handleMetric2UnitChange = (unit: string) => {
    setMetric2Unit(unit)
    notifyChange(metric1Value, metric1Unit, metric2Value, unit)
  }

  return (
    <div className="set-input-bar">
      <div className="set-number">Set {setNumber}</div>

      <div className="metric-input">
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

      <div className="metric-input">
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

      <button className="remove-button" onClick={onRemove}>
        Remove
      </button>
    </div>
  )
}
