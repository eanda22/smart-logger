/**
 * Calendar grid component for history page
 * Displays one month at a time with navigation
 */

import { Session } from '../api/types'

interface CalendarGridProps {
  sessions: Session[]
  selectedDay: number | null
  selectedMonth: number
  selectedYear: number
  onDaySelect: (day: number) => void
  onMonthChange: (month: number, year: number) => void
}

export default function CalendarGrid({
  sessions,
  selectedDay,
  selectedMonth,
  selectedYear,
  onDaySelect,
  onMonthChange,
}: CalendarGridProps) {
  // Helper to check if a day has workouts
  const dayHasWorkout = (day: number): boolean => {
    return sessions.some((session) => {
      const sessionDate = new Date(session.date)
      return (
        sessionDate.getDate() === day &&
        sessionDate.getMonth() === selectedMonth &&
        sessionDate.getFullYear() === selectedYear
      )
    })
  }

  // Get first day of month (0 = Sunday)
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay()
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()

  // Calculate if today
  const today = new Date()
  const isToday = (day: number): boolean => {
    return (
      day === today.getDate() &&
      selectedMonth === today.getMonth() &&
      selectedYear === today.getFullYear()
    )
  }

  // Generate calendar grid cells
  const calendarDays = []

  // Empty cells before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Handle month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      onMonthChange(11, selectedYear - 1)
    } else {
      onMonthChange(selectedMonth - 1, selectedYear)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onMonthChange(0, selectedYear + 1)
    } else {
      onMonthChange(selectedMonth + 1, selectedYear)
    }
  }

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button className="nav-btn" onClick={handlePrevMonth}>
          ←
        </button>
        <h2>{monthName}</h2>
        <button className="nav-btn" onClick={handleNextMonth}>
          →
        </button>
      </div>

      <div className="calendar-grid-header">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day empty"></div>
          }

          const classes = ['calendar-day']
          if (dayHasWorkout(day)) classes.push('has-workout')
          if (isToday(day)) classes.push('today')
          if (selectedDay === day) classes.push('selected')

          return (
            <div
              key={day}
              className={classes.join(' ')}
              onClick={() => onDaySelect(day)}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
