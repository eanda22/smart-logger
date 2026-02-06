/**
 * TemplateSelectionCard: Simple clickable card for template selection in workout setup
 */

import { Template } from '../api/types'

interface TemplateSelectionCardProps {
  template: Template
  onClick: () => void
}

export default function TemplateSelectionCard({ template, onClick }: TemplateSelectionCardProps) {
  return (
    <button className="template-selection-card" onClick={onClick}>
      <div className="template-selection-icon">💪</div>
      <h3>{template.name}</h3>
      <p>{template.template_exercises.length} exercises</p>
    </button>
  )
}
