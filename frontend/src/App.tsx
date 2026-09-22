import Landing from './pages/Landing'
import AdminDashboard from './pages/AdminDashboard'
import DrawEngine from './pages/DrawEngine'
import ScoreEntry from './pages/ScoreEntry'
import ScoreEdit from './pages/ScoreEdit'
import MonthlyDraw from './pages/MonthlyDraw'
import AdminCharity from './pages/AdminCharity'
import MemberDashboard from './pages/MumberDashboard'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import { useAuth } from './context/AuthContext'

const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate replace to="/login" />
  if (!isAdmin) return <Navigate replace to="/dashboard" />
  return children
}

const MemberOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate replace to="/login" />
  if (isAdmin) return <Navigate replace to="/admin" />
  return children
}

const App = () => {
  return (
    <Routes>
      <Route element={<Landing />} path="/" />
      <Route element={<Login />} path="/login" />
      <Route element={<Register />} path="/register" />
      <Route element={<MemberOnlyRoute><MemberDashboard /></MemberOnlyRoute>} path="/dashboard" />
      <Route element={<ScoreEntry />} path="/score-entry" />
      <Route element={<ScoreEdit />} path="/score-edit/:id" />
      <Route element={<MonthlyDraw />} path="/draw" />
      <Route element={<AdminOnlyRoute><AdminCharity /></AdminOnlyRoute>} path="/admin/charity" />
      <Route element={<AdminDashboard />} path="/admin" />
      <Route element={<DrawEngine />} path="/admin/draw" />
    </Routes>
  )
}

export default App
