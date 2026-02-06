/**
 * Exercise field configuration by category
 * Defines default metric names and units for each exercise category
 */

import { Exercise } from '../api/types'

export interface FieldMetadata {
  metric1_name: string
  metric1_units: string[]
  metric2_name: string
  metric2_units: string[]
  metric3_name: string | null
  metric3_units: string[] | null
}

// Default field metadata for each category type
const categoryDefaults: Record<string, FieldMetadata> = {
  strength: {
    metric1_name: 'Weight',
    metric1_units: ['lbs', 'kg'],
    metric2_name: 'Reps',
    metric2_units: ['reps'],
    metric3_name: null,
    metric3_units: null,
  },
  cardio: {
    metric1_name: 'Duration',
    metric1_units: ['min', 'sec'],
    metric2_name: 'Distance',
    metric2_units: ['mi', 'km'],
    metric3_name: 'Heart Rate',
    metric3_units: ['bpm'],
  },
  flexibility: {
    metric1_name: 'Hold Time',
    metric1_units: ['sec', 'min'],
    metric2_name: 'Reps',
    metric2_units: ['reps'],
    metric3_name: null,
    metric3_units: null,
  },
  recovery: {
    metric1_name: 'Duration',
    metric1_units: ['min'],
    metric2_name: 'Intensity',
    metric2_units: ['1-10'],
    metric3_name: null,
    metric3_units: null,
  },
}

/**
 * Get field metadata for a given category type
 * @param categoryType - The category type (strength, cardio, flexibility, recovery)
 * @returns Field metadata with metric names and units
 */
export function getFieldsForCategory(categoryType: string): FieldMetadata {
  return categoryDefaults[categoryType] || categoryDefaults['strength']
}

/**
 * Get field metadata for a specific exercise
 * Uses exercise's own metric names/units if available, otherwise falls back to category defaults
 * @param exercise - The exercise object
 * @returns Field metadata with metric names and units from exercise or category defaults
 */
export function getFieldsForExercise(exercise: Exercise): FieldMetadata {
  return {
    metric1_name: exercise.metric1_name || categoryDefaults[exercise.category_type]?.metric1_name || 'Weight',
    metric1_units: exercise.metric1_units || categoryDefaults[exercise.category_type]?.metric1_units || [],
    metric2_name: exercise.metric2_name || categoryDefaults[exercise.category_type]?.metric2_name || 'Reps',
    metric2_units: exercise.metric2_units || categoryDefaults[exercise.category_type]?.metric2_units || [],
    metric3_name: exercise.metric3_name || categoryDefaults[exercise.category_type]?.metric3_name || null,
    metric3_units: exercise.metric3_units || categoryDefaults[exercise.category_type]?.metric3_units || null,
  }
}

/**
 * Check if an exercise has metric3
 * @param exercise - The exercise object
 * @returns Boolean indicating if metric3 should be shown
 */
export function hasMetric3(exercise: Exercise): boolean {
  return Boolean(exercise.metric3_name || getFieldsForCategory(exercise.category_type).metric3_name)
}
