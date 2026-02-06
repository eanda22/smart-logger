/**
 * Utilities for handling BW (bodyweight) toggle logic in strength exercises
 */

import { WorkoutSet } from '../api/types'

/**
 * Initialize BW toggle state from existing sets
 * Checks if metric1_value === "BW" for each set
 */
export function initializeBwToggles(sets: WorkoutSet[]): { [key: number]: boolean } {
  const initial: { [key: number]: boolean } = {}
  sets.forEach((set, idx) => {
    initial[idx] = set.metric1_value === 'BW'
  })
  return initial
}

/**
 * Update BW toggle state when sets change
 * Ensures toggle state stays in sync with actual values
 */
export function updateBwToggles(
  prev: { [key: number]: boolean },
  sets: WorkoutSet[]
): { [key: number]: boolean } {
  const updated = { ...prev }
  sets.forEach((set, idx) => {
    updated[idx] = set.metric1_value === 'BW'
  })
  return updated
}

/**
 * Calculate new metric1_value when BW toggle is clicked
 * Returns 'BW' if currently not BW, null if currently BW
 */
export function calculateNewBwValue(currentToggleState: boolean): string | null {
  return currentToggleState ? null : 'BW'
}
