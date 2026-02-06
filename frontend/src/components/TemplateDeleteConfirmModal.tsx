/**
 * TemplateDeleteConfirmModal: Confirmation modal before deleting a template
 */

interface TemplateDeleteConfirmModalProps {
  isOpen: boolean
  templateName: string
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

export default function TemplateDeleteConfirmModal({
  isOpen,
  templateName,
  onConfirm,
  onCancel,
  isLoading,
}: TemplateDeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <h2>Delete Template?</h2>
        <p>
          Delete <strong>"{templateName}"</strong>? This cannot be undone.
        </p>

        <div className="modal-buttons">
          <button className="btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
          <button className="btn-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
