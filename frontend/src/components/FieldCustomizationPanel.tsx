/**
 * Field Customization Panel: Gear icon with modal to toggle visible fields per exercise
 */

import { useState } from 'react'
import { Exercise } from '../api/types'

interface FieldCustomizationPanelProps {
  exercise: Exercise
  visibleFields: string[]
  onVisibleFieldsChange: (visibleFields: string[]) => void
}

export default function FieldCustomizationPanel({
  exercise,
  visibleFields,
  onVisibleFieldsChange,
}: FieldCustomizationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleField = (field: string) => {
    const newFields = visibleFields.includes(field)
      ? visibleFields.filter((f) => f !== field)
      : [...visibleFields, field]
    onVisibleFieldsChange(newFields)
  }

  // Determine which fields are available for this exercise
  const availableFields = [
    { key: 'metric1', label: exercise.metric1_name },
    { key: 'metric2', label: exercise.metric2_name },
  ]

  if (exercise.metric3_name) {
    availableFields.push({ key: 'metric3', label: exercise.metric3_name })
  }

  return (
    <div className="field-customization-panel">
      <button
        className="field-customization-icon"
        onClick={() => setIsOpen(!isOpen)}
        title="Customize visible fields"
      >
        ⚙️
      </button>

      <div className={`field-customization-modal ${isOpen ? 'visible' : ''}`}>
          <div className="field-customization-content">
            <h4 className="field-customization-title">Track These Fields</h4>
            <div className="field-toggles">
              {availableFields.map(({ key, label }) => (
                <label key={key} className="field-toggle">
                  <input
                    type="checkbox"
                    checked={visibleFields.includes(key)}
                    onChange={() => handleToggleField(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              Done
            </button>
          </div>
      </div>
    </div>
  )
}
