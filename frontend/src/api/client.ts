/**
 * Typed API client for Smart Logger backend
 */

import { Exercise, WorkoutSet, Session, SessionCreate, Template, TemplateCreate } from './types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

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

/**
 * Fetch all templates
 */
export async function fetchTemplates(): Promise<Template[]> {
  try {
    const response = await fetch(`${API_URL}/templates`)
    if (!response.ok) throw new Error('Failed to fetch templates')
    return await response.json()
  } catch (error) {
    console.error('Error fetching templates:', error)
    return []
  }
}

/**
 * Fetch a single template by ID
 */
export async function fetchTemplate(templateId: number): Promise<Template> {
  try {
    const response = await fetch(`${API_URL}/templates/${templateId}`)
    if (!response.ok) throw new Error('Failed to fetch template')
    return await response.json()
  } catch (error) {
    console.error(`Error fetching template ${templateId}:`, error)
    throw error
  }
}

/**
 * Create a new template
 */
export async function postTemplate(template: TemplateCreate): Promise<Template> {
  try {
    const response = await fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    })
    if (!response.ok) throw new Error('Failed to create template')
    return await response.json()
  } catch (error) {
    console.error('Error creating template:', error)
    throw error
  }
}

/**
 * Update a template (full update)
 */
export async function putTemplate(templateId: number, template: TemplateCreate): Promise<Template> {
  try {
    const response = await fetch(`${API_URL}/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    })
    if (!response.ok) throw new Error('Failed to update template')
    return await response.json()
  } catch (error) {
    console.error(`Error updating template ${templateId}:`, error)
    throw error
  }
}

/**
 * Partially update a template
 */
export async function patchTemplate(templateId: number, template: TemplateCreate): Promise<Template> {
  try {
    const response = await fetch(`${API_URL}/templates/${templateId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    })
    if (!response.ok) throw new Error('Failed to update template')
    return await response.json()
  } catch (error) {
    console.error(`Error updating template ${templateId}:`, error)
    throw error
  }
}

/**
 * Delete a template by ID
 */
export async function deleteTemplate(templateId: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/templates/${templateId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete template')
  } catch (error) {
    console.error(`Error deleting template ${templateId}:`, error)
    throw error
  }
}

/**
 * Add an exercise to a template
 */
export async function postAddExerciseToTemplate(templateId: number, exerciseId: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/templates/${templateId}/exercises?exercise_id=${exerciseId}`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to add exercise to template')
  } catch (error) {
    console.error(`Error adding exercise ${exerciseId} to template ${templateId}:`, error)
    throw error
  }
}

/**
 * Remove an exercise from a template
 */
export async function deleteExerciseFromTemplate(templateId: number, exerciseId: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/templates/${templateId}/exercises/${exerciseId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to remove exercise from template')
  } catch (error) {
    console.error(`Error removing exercise ${exerciseId} from template ${templateId}:`, error)
    throw error
  }
}

/**
 * Reorder exercises in a template
 */
export async function putReorderTemplateExercises(
  templateId: number,
  exerciseIds: number[]
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/templates/${templateId}/exercises/sort`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exerciseIds),
    })
    if (!response.ok) throw new Error('Failed to reorder exercises')
  } catch (error) {
    console.error(`Error reordering exercises in template ${templateId}:`, error)
    throw error
  }
}

/**
 * Update exercise field_config (visible fields)
 */
export async function patchExerciseFieldConfig(
  exerciseId: number,
  fieldConfig: Record<string, unknown>
): Promise<Exercise> {
  try {
    const response = await fetch(`${API_URL}/exercises/${exerciseId}/field-config`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fieldConfig),
    })
    if (!response.ok) throw new Error('Failed to update exercise field config')
    return await response.json()
  } catch (error) {
    console.error(`Error updating field config for exercise ${exerciseId}:`, error)
    throw error
  }
}
