import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

function RoleRoute({ allowedRoles }) {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" />
  }

  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/login" />
}

export default RoleRoute
