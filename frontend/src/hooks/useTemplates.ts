/**
 * TanStack Query hooks for templates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchTemplates,
  fetchTemplate,
  postTemplate,
  putTemplate,
  patchTemplate,
  deleteTemplate,
  postAddExerciseToTemplate,
  deleteExerciseFromTemplate,
  putReorderTemplateExercises,
} from '../api/client'
import { Template, TemplateCreate } from '../api/types'

/**
 * Fetch all templates
 */
export function useTemplates() {
  return useQuery<Template[], Error>({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  })
}

/**
 * Fetch a single template by ID
 */
export function useTemplate(templateId: number) {
  return useQuery<Template, Error>({
    queryKey: ['template', templateId],
    queryFn: () => fetchTemplate(templateId),
  })
}

/**
 * Create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (template: TemplateCreate) => postTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

/**
 * Update a template (full update)
 */
export function useUpdateTemplate(templateId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (template: TemplateCreate) => putTemplate(templateId, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template', templateId] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

/**
 * Partially update a template
 */
export function usePatchTemplate(templateId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (template: TemplateCreate) => patchTemplate(templateId, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template', templateId] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

/**
 * Delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (templateId: number) => deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

/**
 * Add an exercise to a template
 */
export function useAddExerciseToTemplate(templateId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (exerciseId: number) => postAddExerciseToTemplate(templateId, exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template', templateId] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

/**
 * Remove an exercise from a template
 */
export function useRemoveExerciseFromTemplate(templateId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (exerciseId: number) => deleteExerciseFromTemplate(templateId, exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template', templateId] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

/**
 * Reorder exercises in a template
 */
export function useReorderTemplateExercises(templateId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (exerciseIds: number[]) => putReorderTemplateExercises(templateId, exerciseIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template', templateId] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}
