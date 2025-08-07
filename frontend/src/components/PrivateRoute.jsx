import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loading message="Verifying authentication..." />
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

export default PrivateRoute
