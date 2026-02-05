/**
 * Summary view: displays completed workout in a proper table structure
 * BUG FIX #1: Uses semantic <table>, <thead>, <tbody> (not bare divs)
 */

import { Exercise, WorkoutSet } from '../api/types'

interface SummaryViewProps {
  allSets: { [exerciseName: string]: WorkoutSet[] }
  definitions: Exercise[]
  onDone: () => void
}

export default function SummaryView({ allSets, definitions, onDone }: SummaryViewProps) {
  // Flatten sets for table display
  const flattenedSets = Object.entries(allSets).flatMap(([_, setSets]) => setSets)

  // Find exercise definition to get metric names
  const getDefinition = (exerciseName: string) => {
    return definitions.find((d) => d.name === exerciseName)
  }

  // Get metric names from first exercise (they're all the same in workout)
  const firstExerciseName = flattenedSets[0]?.exercise
  const firstDefinition = firstExerciseName ? getDefinition(firstExerciseName) : undefined

  return (
    <div className="summary-view">
      <div className="summary-header">
        <h2>Workout Complete!</h2>
      </div>

      <div className="summary-table-container">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Set #</th>
              <th>
                {firstDefinition?.metric1_name}
                <br />
                <span className="metric-unit">({firstDefinition?.metric1_units[0] || ''})</span>
              </th>
              <th>
                {firstDefinition?.metric2_name}
                <br />
                <span className="metric-unit">({firstDefinition?.metric2_units[0] || ''})</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {flattenedSets.map((set, index) => (
              <tr key={index}>
                <td className="exercise-name">{set.exercise}</td>
                <td className="set-number">{set.set_number}</td>
                <td className="metric-value">
                  {set.metric1_value !== null ? (
                    <>
                      {set.metric1_value} <span className="unit">{set.metric1_unit}</span>
                    </>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="metric-value">
                  {set.metric2_value !== null ? (
                    <>
                      {set.metric2_value} <span className="unit">{set.metric2_unit}</span>
                    </>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary-footer">
        <button className="done-button" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  )
}
