/**
 * TypeScript interfaces for Smart Logger API
 */

export interface Exercise {
  id: number
  name: string
  category: string
  category_type: string
  metric1_name: string
  metric1_units: string[]
  metric2_name: string
  metric2_units: string[]
  metric3_name?: string | null
  metric3_units?: string[] | null
  field_config?: Record<string, unknown> | null
}

export interface WorkoutSet {
  id: number
  exercise: string
  set_number: number
  metric1_value: string | null
  metric1_unit: string | null
  metric2_value: string | null
  metric2_unit: string | null
  metric3_value?: string | null
  metric3_unit?: string | null
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
  metric1_value: string | null
  metric1_unit: string | null
  metric2_value: string | null
  metric2_unit: string | null
  metric3_value?: string | null
  metric3_unit?: string | null
}

export interface SessionCreate {
  name: string
  date: string
  sets: WorkoutSetCreate[]
}

export interface TemplateExercise {
  exercise_id: number
  sort_order: number
}

export interface Template {
  id: number
  name: string
  created_at: string
  updated_at: string
  template_exercises: TemplateExercise[]
}

export interface TemplateCreate {
  name: string
  exercise_ids?: number[]
}
