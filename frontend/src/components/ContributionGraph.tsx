/**
 * Contribution Graph - GitHub-style 52-week heatmap of workout days
 */

import { useMemo } from 'react'
import { Session } from '../api/types'

interface ContributionGraphProps {
  sessions: Session[]
  year: number
  onYearChange: (year: number) => void
}

export default function ContributionGraph({ sessions, year, onYearChange }: ContributionGraphProps) {
  // Build date → count map
  const dateCountMap = useMemo(() => {
    const map = new Map<string, number>()
    sessions.forEach((session) => {
      const dateStr = session.date.split('T')[0] // YYYY-MM-DD
      map.set(dateStr, (map.get(dateStr) || 0) + 1)
    })
    return map
  }, [sessions])

  // Calculate full calendar year grid
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yearStart = new Date(year, 0, 1) // January 1
  const yearEnd = new Date(year, 11, 31) // December 31

  // Find Sunday on or before January 1
  const gridStart = new Date(yearStart)
  const daysFromSunday = yearStart.getDay()
  gridStart.setDate(yearStart.getDate() - daysFromSunday)
  gridStart.setHours(0, 0, 0, 0)

  // Find Saturday on or after December 31
  const gridEnd = new Date(yearEnd)
  const dayOfWeekEnd = yearEnd.getDay()
  // Add days to get to the next Saturday (or stay if already Saturday)
  const daysToAdd = dayOfWeekEnd === 6 ? 0 : (6 - dayOfWeekEnd + 7) % 7 || 6
  gridEnd.setDate(yearEnd.getDate() + daysToAdd)
  gridEnd.setHours(0, 0, 0, 0)

  // Calculate total weeks - ensure it's at least enough to cover the full year
  let totalWeeks = Math.ceil((gridEnd.getTime() - gridStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
  // Ensure we have enough weeks to include December
  const decemberStart = new Date(year, 11, 1)
  const decemberSunday = new Date(decemberStart)
  decemberSunday.setDate(decemberStart.getDate() - decemberStart.getDay())
  const decemberWeeks = Math.floor((decemberSunday.getTime() - gridStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
  if (decemberWeeks + 4 >= totalWeeks) {
    // December might be cut off, extend grid
    totalWeeks = decemberWeeks + 5
  }

  // Generate weeks × 7 days grid for entire year
  const cells: Array<{ date: Date; count: number }> = []
  for (let col = 0; col < totalWeeks; col++) {
    for (let row = 0; row < 7; row++) {
      const cellDate = new Date(gridStart)
      cellDate.setDate(gridStart.getDate() + col * 7 + row)

      const dateStr = cellDate.toISOString().split('T')[0]
      const count = dateCountMap.get(dateStr) || 0
      cells.push({ date: cellDate, count })
    }
  }

  // Helper: get color based on count
  const getColor = (count: number): string => {
    if (count === 0) return '#ebedf0'
    if (count === 1) return '#9be9a8'
    if (count === 2) return '#40c463'
    return '#216e39'
  }

  // Helper: format date for tooltip
  const formatTooltip = (date: Date, count: number): string => {
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const workoutText = count === 0 ? 'no workouts' : `${count} workout${count > 1 ? 's' : ''}`
    return `${monthDay} — ${workoutText}`
  }

  // Helper: get day-of-week label for all 7 days
  const getDayLabel = (row: number): string | null => {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return labels[row] || null
  }

  // Helper: get month label for column
  // Calculate month start columns for consistent 12-month display
  const monthStartCols = useMemo(() => {
    const cols: Record<number, string> = {}
    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(year, m, 1)
      const daysFromSunday = monthStart.getDay()
      const monthSunday = new Date(monthStart)
      monthSunday.setDate(monthStart.getDate() - daysFromSunday)

      const weeksOffset = Math.floor((monthSunday.getTime() - gridStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (weeksOffset >= 0 && weeksOffset < totalWeeks) {
        const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' })
        cols[weeksOffset] = monthName
      }
    }
    return cols
  }, [year, gridStart, totalWeeks])

  const getMonthLabel = (col: number): string | null => {
    return monthStartCols[col] || null
  }

  const currentYear = new Date().getFullYear()
  const canGoForward = year < currentYear

  return (
    <div className="contribution-graph-container">
      {/* Year navigation header */}
      <div className="contribution-year-header">
        <button
          className="contribution-year-arrow"
          onClick={() => onYearChange(year - 1)}
          title="Previous year"
        >
          ← Previous Year
        </button>
        <div className="contribution-year-display">{year}</div>
        <button
          className="contribution-year-arrow"
          onClick={() => onYearChange(year + 1)}
          disabled={!canGoForward}
          title={canGoForward ? 'Next year' : 'Cannot view future years'}
        >
          Next Year →
        </button>
      </div>

      <div className="contribution-graph">
        {/* Top row: month labels */}
        <div className="contribution-row">
          <div style={{ width: '40px' }} /> {/* Spacer for day labels */}
          {Array.from({ length: totalWeeks }).map((_, col) => (
            <div key={`month-${col}`} className="contribution-month-label">
              {getMonthLabel(col)}
            </div>
          ))}
        </div>

        {/* Contribution cells grid + day labels */}
        {Array.from({ length: 7 }).map((_, row) => (
          <div key={`row-${row}`} className="contribution-row">
            <div className="contribution-day-label">{getDayLabel(row)}</div>
            {cells
              .filter((_, idx) => idx % 7 === row)
              .map((cell, col) => (
                <div
                  key={`cell-${col}-${row}`}
                  className="contribution-cell"
                  style={{ backgroundColor: getColor(cell.count) }}
                  title={formatTooltip(cell.date, cell.count)}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
