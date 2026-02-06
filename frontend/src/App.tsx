import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Workout from './pages/Workout'
import History from './pages/History'
import Templates from './pages/Templates'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/workout" element={<Workout />} />
      <Route path="/history" element={<History />} />
      <Route path="/templates" element={<Templates />} />
    </Routes>
  )
}
