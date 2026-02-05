/**
 * TanStack Query hook for workout sessions
 */

import { useQuery } from '@tanstack/react-query'
import { fetchSessions } from '../api/client'
import { Session } from '../api/types'

export function useSessions() {
  return useQuery<Session[], Error>({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
  })
}
