/**
 * Home page / Dashboard with analytics widgets
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CalendarGrid from '../components/CalendarGrid'
import ContributionGraph from '../components/ContributionGraph'
import WeightChart from '../components/WeightChart'
import { useSessions } from '../hooks/useSessions'
import '../styles/dashboard.css'

export default function Home() {
  const navigate = useNavigate()
  const { data: sessions = [] } = useSessions()

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [graphYear, setGraphYear] = useState(new Date().getFullYear())

  const handleDaySelect = (day: number) => {
    navigate('/history', { state: { month: selectedMonth, year: selectedYear, day } })
  }

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Smart Logger</h1>
        <Link to="/templates" className="templates-button">
          Templates
        </Link>
      </div>

      <Link to="/workout" className="log-workout-btn">
        + Log Workout
      </Link>

      <div className="widget-card">
        <h2>Activity</h2>
        <ContributionGraph sessions={sessions} year={graphYear} onYearChange={setGraphYear} />
      </div>

      <div className="dashboard-bottom-row">
        <CalendarGrid
          sessions={sessions}
          selectedDay={null}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onDaySelect={handleDaySelect}
          onMonthChange={handleMonthChange}
        />

        <div className="widget-card">
          <h2>Weight Progress</h2>
          <WeightChart sessions={sessions} />
        </div>
      </div>
    </div>
  )
}
