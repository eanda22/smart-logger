/**
 * History page with calendar view and session details
 */

import { useState } from 'react'
import CalendarGrid from '../components/CalendarGrid'
import { useSessions } from '../hooks/useSessions'
import '../styles/history.css'

export default function History() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set())

  const { data: sessions = [] } = useSessions()

  // Get sessions for selected day
  const sessionsForDay = selectedDay
    ? sessions.filter((session) => {
        const sessionDate = new Date(session.date)
        return (
          sessionDate.getDate() === selectedDay &&
          sessionDate.getMonth() === selectedMonth &&
          sessionDate.getFullYear() === selectedYear
        )
      })
    : []

  // Toggle session expansion
  const toggleSessionExpanded = (sessionId: number) => {
    const newExpanded = new Set(expandedSessions)
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId)
    } else {
      newExpanded.add(sessionId)
    }
    setExpandedSessions(newExpanded)
  }

  // Handle month change
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
    setSelectedDay(null) // Clear selection when changing months
  }

  return (
    <div className="history-container">
      <h1>Workout History</h1>

      <CalendarGrid
        sessions={sessions}
        selectedDay={selectedDay}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onDaySelect={setSelectedDay}
        onMonthChange={handleMonthChange}
      />

      <div id="workout-details-container">
        {selectedDay === null ? (
          <div className="placeholder-text">
            <p>Select a day to view workouts</p>
          </div>
        ) : sessionsForDay.length === 0 ? (
          <div className="no-workout-card">
            <p>No workouts on this day</p>
          </div>
        ) : (
          sessionsForDay.map((session) => (
            <div key={session.id} className="session-card">
              <div
                className="session-header"
                onClick={() => toggleSessionExpanded(session.id)}
                style={{ cursor: 'pointer' }}
              >
                <h2>
                  {session.name} ({new Date(session.date).toLocaleDateString()})
                </h2>
              </div>

              {expandedSessions.has(session.id) && (
                <div className="session-content">
                  {/* Group sets by exercise */}
                  {(() => {
                    const exerciseGroups: { [key: string]: typeof session.sets } = {}
                    session.sets.forEach((set) => {
                      if (!exerciseGroups[set.exercise]) {
                        exerciseGroups[set.exercise] = []
                      }
                      exerciseGroups[set.exercise].push(set)
                    })

                    return Object.entries(exerciseGroups).map(([exerciseName, sets]) => (
                      <div key={exerciseName} className="exercise-group">
                        <h3>{exerciseName}</h3>
                        <table className="sets-table">
                          <thead>
                            <tr>
                              <th>Set</th>
                              <th>
                                {sets[0]?.metric1_unit || 'Metric 1'}
                              </th>
                              <th>
                                {sets[0]?.metric2_unit || 'Metric 2'}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sets.map((set) => (
                              <tr key={set.id}>
                                <td>{set.set_number}</td>
                                <td>
                                  {set.metric1_value !== null
                                    ? `${set.metric1_value} ${set.metric1_unit || ''}`
                                    : '-'}
                                </td>
                                <td>
                                  {set.metric2_value !== null
                                    ? `${set.metric2_value} ${set.metric2_unit || ''}`
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))
                  })()}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
