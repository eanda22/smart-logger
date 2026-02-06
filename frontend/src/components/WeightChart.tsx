/**
 * Weight Chart - Line chart of max weight over time for a selected exercise
 */

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Session } from '../api/types'

interface WeightChartProps {
  sessions: Session[]
}

export default function WeightChart({ sessions }: WeightChartProps) {
  // Extract unique exercises with logged weight (metric1_value !== null)
  const exercises = useMemo(() => {
    const set = new Set<string>()
    sessions.forEach((session) => {
      session.sets.forEach((set_) => {
        if (set_.metric1_value !== null) {
          set.add(set_.exercise)
        }
      })
    })
    return Array.from(set).sort()
  }, [sessions])

  // Default to first exercise or empty
  const [selectedExercise, setSelectedExercise] = useState<string>(exercises[0] || '')

  // Compute chart data when exercise changes
  const chartData = useMemo(() => {
    if (!selectedExercise) return []

    // Find sessions containing the selected exercise with metric1_value !== null
    const relevantSessions = sessions
      .filter((session) =>
        session.sets.some(
          (set_) => set_.exercise === selectedExercise && set_.metric1_value !== null
        )
      )
      .map((session) => {
        const maxWeight = Math.max(
          ...session.sets
            .filter((set_) => set_.exercise === selectedExercise && set_.metric1_value !== null)
            .map((set_) => set_.metric1_value as number)
        )
        return {
          date: session.date.split('T')[0], // YYYY-MM-DD
          fullDate: new Date(session.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          value: maxWeight,
        }
      })

    // Sort ascending by date (API returns DESC)
    relevantSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return relevantSessions
  }, [sessions, selectedExercise])

  // Get the unit for the selected exercise (from first relevant set)
  const unit = useMemo(() => {
    for (const session of sessions) {
      const relevantSet = session.sets.find(
        (set_) => set_.exercise === selectedExercise && set_.metric1_value !== null
      )
      if (relevantSet?.metric1_unit) {
        return relevantSet.metric1_unit
      }
    }
    return ''
  }, [sessions, selectedExercise])

  if (exercises.length === 0) {
    return <div className="weight-chart-placeholder">No weight data yet.</div>
  }

  return (
    <div className="weight-chart-container">
      <div className="weight-chart-select-wrapper">
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="weight-chart-select"
        >
          {exercises.map((ex) => (
            <option key={ex} value={ex}>
              {ex}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="fullDate"
            tick={{ fontSize: 12 }}
            interval={Math.max(0, Math.floor(chartData.length / 6))}
          />
          <YAxis
            label={{ value: unit, angle: -90, position: 'insideLeft', offset: -5 }}
            domain={['dataMin - 10', 'dataMax + 10']}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            formatter={(value: number) => [`${value} ${unit}`, 'Max Weight']}
            labelFormatter={(label) => label}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4a90e2"
            strokeWidth={2}
            dot={{ r: 3, fill: '#4a90e2' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
