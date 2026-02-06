/**
 * TemplateModal: Modal for creating/editing template names
 */

import { useState, useEffect } from 'react'
import { Template } from '../api/types'

interface TemplateModalProps {
  isOpen: boolean
  template?: Template
  onSave: (name: string) => void
  onCancel: () => void
  isLoading: boolean
}

export default function TemplateModal({
  isOpen,
  template,
  onSave,
  onCancel,
  isLoading,
}: TemplateModalProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(template?.name || '')
    }
  }, [isOpen, template])

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="template-modal">
        <h2>{template ? 'Edit Template' : 'Create Template'}</h2>

        <input
          type="text"
          placeholder="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength={100}
          autoFocus
          className="form-input"
        />

        <div className="modal-buttons">
          <button className="btn-primary" onClick={handleSubmit} disabled={isLoading || !name.trim()}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button className="btn-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
