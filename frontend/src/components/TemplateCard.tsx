/**
 * TemplateCard: Display a single template with action buttons
 */

import { Template } from '../api/types'

interface TemplateCardProps {
  template: Template
  onSelect: () => void
  onEdit: () => void
  onAddExercises: () => void
  onDelete: () => void
}

export default function TemplateCard({
  template,
  onSelect,
  onEdit,
  onAddExercises,
  onDelete,
}: TemplateCardProps) {
  return (
    <div className="template-card">
      <h3 className="template-card-name">{template.name}</h3>
      <p className="template-card-meta">{template.template_exercises.length} exercises</p>

      <div className="template-card-buttons">
        <button className="btn-primary" onClick={onSelect}>
          Use Template
        </button>
        <button className="btn-secondary" onClick={onAddExercises}>
          Add Exercises
        </button>
        <button className="btn-secondary" onClick={onEdit}>
          Rename
        </button>
        <button className="btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  )
}
