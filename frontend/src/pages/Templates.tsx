/**
 * Templates page: Manage all workout templates (create, edit, delete)
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '../hooks/useTemplates'
import { patchTemplate } from '../api/client'
import { TemplateCreate } from '../api/types'
import TemplateCardGrid from '../components/TemplateCardGrid'
import TemplateModal from '../components/TemplateModal'
import TemplateDeleteConfirmModal from '../components/TemplateDeleteConfirmModal'
import AddExerciseModal from '../components/AddExerciseModal'
import '../styles/templates.css'
import '../styles/exercises.css'

export default function Templates() {
  const { data: templates = [], isLoading } = useTemplates()
  const queryClient = useQueryClient()
  const createMutation = useCreateTemplate()
  const deleteMutation = useDeleteTemplate()

  // Mutation for updating template
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TemplateCreate }) => patchTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null)
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null)
  const [addingExercisesToTemplateId, setAddingExercisesToTemplateId] = useState<number | null>(null)

  // Get template being edited or having exercises added
  const editingTemplate = templates.find((t) => t.id === editingTemplateId)
  const deletingTemplate = templates.find((t) => t.id === deletingTemplateId)
  const addingExercisesToTemplate = templates.find((t) => t.id === addingExercisesToTemplateId)

  const handleCreateClick = () => {
    setShowCreateModal(true)
  }

  const handleSaveTemplate = (name: string) => {
    if (editingTemplateId) {
      updateMutation.mutate(
        { id: editingTemplateId, data: { name } },
        {
          onSuccess: () => {
            setEditingTemplateId(null)
          },
        }
      )
    } else {
      createMutation.mutate(
        { name },
        {
          onSuccess: () => {
            setShowCreateModal(false)
          },
        }
      )
    }
  }

  const handleEditTemplate = (templateId: number) => {
    setEditingTemplateId(templateId)
  }

  const handleDeleteTemplate = (templateId: number) => {
    setDeletingTemplateId(templateId)
  }

  const handleConfirmDelete = () => {
    if (deletingTemplateId) {
      deleteMutation.mutate(deletingTemplateId, {
        onSuccess: () => {
          setDeletingTemplateId(null)
        },
      })
    }
  }

  const handleCancelModal = () => {
    setShowCreateModal(false)
    setEditingTemplateId(null)
  }

  const handleAddExercisesToTemplate = (templateId: number) => {
    setAddingExercisesToTemplateId(templateId)
  }

  return (
    <div className="templates-page">
      <div className="templates-header">
        <h1>Manage Templates</h1>
        <button className="btn-primary" onClick={handleCreateClick}>
          + Create Template
        </button>
      </div>

      <TemplateCardGrid
        templates={templates}
        isLoading={isLoading}
        onSelect={() => {}} // Templates page doesn't use templates, just manages them
        onEdit={handleEditTemplate}
        onAddExercises={handleAddExercisesToTemplate}
        onDelete={handleDeleteTemplate}
      />

      <TemplateModal
        isOpen={showCreateModal || editingTemplateId !== null}
        template={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={handleCancelModal}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <TemplateDeleteConfirmModal
        isOpen={deletingTemplateId !== null}
        templateName={deletingTemplate?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTemplateId(null)}
        isLoading={deleteMutation.isPending}
      />

      {addingExercisesToTemplate && addingExercisesToTemplateId !== null && (
        <AddExerciseModal
          isOpen={true}
          templateId={addingExercisesToTemplateId}
          templateExerciseIds={addingExercisesToTemplate.template_exercises.map((te) => te.exercise_id)}
          onClose={() => setAddingExercisesToTemplateId(null)}
          onSuccess={() => {
            setAddingExercisesToTemplateId(null)
          }}
        />
      )}
    </div>
  )
}
