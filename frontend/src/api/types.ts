/**
 * TypeScript interfaces for Smart Logger API
 */

export interface Exercise {
  id: number
  name: string
  category: string
  metric1_name: string
  metric1_units: string[]
  metric2_name: string
  metric2_units: string[]
}

export interface WorkoutSet {
  id: number
  exercise: string
  set_number: number
  metric1_value: number | null
  metric1_unit: string | null
  metric2_value: number | null
  metric2_unit: string | null
}

export interface Session {
  id: number
  name: string
  date: string
  created_at: string
  sets: WorkoutSet[]
}

export interface WorkoutSetCreate {
  exercise: string
  set_number: number
  metric1_value: number | null
  metric1_unit: string | null
  metric2_value: number | null
  metric2_unit: string | null
}

export interface SessionCreate {
  name: string
  date: string
  sets: WorkoutSetCreate[]
}
