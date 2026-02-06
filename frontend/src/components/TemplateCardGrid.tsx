/**
 * TemplateCardGrid: Display all templates in a responsive grid
 */

import { Template } from '../api/types'
import TemplateCard from './TemplateCard'

interface TemplateCardGridProps {
  templates: Template[]
  isLoading?: boolean
  onSelect: (templateId: number) => void
  onEdit: (templateId: number) => void
  onAddExercises: (templateId: number) => void
  onDelete: (templateId: number) => void
}

export default function TemplateCardGrid({
  templates,
  isLoading = false,
  onSelect,
  onEdit,
  onAddExercises,
  onDelete,
}: TemplateCardGridProps) {
  if (isLoading) {
    return (
      <div className="template-grid">
        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading templates...
        </p>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="template-empty">
        <p>No templates yet. Create one to get started.</p>
      </div>
    )
  }

  return (
    <div className="template-grid">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={() => onSelect(template.id)}
          onEdit={() => onEdit(template.id)}
          onAddExercises={() => onAddExercises(template.id)}
          onDelete={() => onDelete(template.id)}
        />
      ))}
    </div>
  )
}
