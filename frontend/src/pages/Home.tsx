/**
 * Home page with quick action links
 */

import { Link } from 'react-router-dom'
import '../styles/home.css'

export default function Home() {
  return (
    <div className="home-container">
      <h1>Smart Logger</h1>
      <p>Track your workout progress</p>

      <div className="action-cards">
        <Link to="/workout" className="action-card">
          <h2>📝 Log Workout</h2>
          <p>Record a new workout session</p>
        </Link>

        <Link to="/history" className="action-card">
          <h2>📊 View History</h2>
          <p>Browse your workout history</p>
        </Link>
      </div>
    </div>
  )
}
