/**
 * Hook for managing exercise field configuration (visible fields)
 */

import { useMutation } from '@tanstack/react-query'
import { patchExerciseFieldConfig } from '../api/client'

/**
 * Mutation hook for updating exercise field config (which fields are visible)
 */
export function useUpdateFieldConfig() {
  return useMutation({
    mutationFn: ({
      exerciseId,
      visibleFields,
    }: {
      exerciseId: number
      visibleFields: string[]
    }) =>
      patchExerciseFieldConfig(exerciseId, {
        visible_fields: visibleFields,
      }),
  })
}
