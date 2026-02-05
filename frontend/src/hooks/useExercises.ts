/**
 * TanStack Query hook for exercises
 */

import { useQuery } from '@tanstack/react-query'
import { fetchExercises } from '../api/client'
import { Exercise } from '../api/types'

export function useExercises() {
  return useQuery<Exercise[], Error>({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
  })
}
