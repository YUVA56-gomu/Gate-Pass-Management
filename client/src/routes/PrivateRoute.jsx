import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

function PrivateRoute() {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return user ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoute
