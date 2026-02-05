/**
 * Typed API client for Smart Logger backend
 */

import { Exercise, WorkoutSet, Session, SessionCreate } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/**
 * Fetch all exercises
 */
export async function fetchExercises(): Promise<Exercise[]> {
  try {
    const response = await fetch(`${API_URL}/exercises`)
    if (!response.ok) throw new Error('Failed to fetch exercises')
    return await response.json()
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return []
  }
}

/**
 * Fetch all sessions with nested sets
 */
export async function fetchSessions(): Promise<Session[]> {
  try {
    const response = await fetch(`${API_URL}/sessions`)
    if (!response.ok) throw new Error('Failed to fetch sessions')
    return await response.json()
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
}

/**
 * Fetch latest sets for a given exercise name
 */
export async function fetchLatestSets(exerciseName: string): Promise<WorkoutSet[]> {
  try {
    const encodedName = encodeURIComponent(exerciseName)
    const response = await fetch(`${API_URL}/exercises/latest-sets-by-name?name=${encodedName}`)
    if (!response.ok) throw new Error('Failed to fetch latest sets')
    return await response.json()
  } catch (error) {
    console.error(`Error fetching latest sets for ${exerciseName}:`, error)
    return []
  }
}

/**
 * Fetch unique exercise names from the latest session with given name
 */
export async function fetchLatestSessionExercises(sessionName: string): Promise<string[]> {
  try {
    const encodedName = encodeURIComponent(sessionName)
    const response = await fetch(`${API_URL}/sessions/latest-exercises-by-name?name=${encodedName}`)
    if (!response.ok) throw new Error('Failed to fetch session exercises')
    return await response.json()
  } catch (error) {
    console.error(`Error fetching exercises for session ${sessionName}:`, error)
    return []
  }
}

/**
 * Create a new workout session with nested sets
 */
export async function postWorkoutSession(session: SessionCreate): Promise<Session> {
  try {
    const response = await fetch(`${API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    })
    if (!response.ok) throw new Error('Failed to create session')
    return await response.json()
  } catch (error) {
    console.error('Error creating session:', error)
    throw error
  }
}
