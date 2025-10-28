import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';

/**
 * Protected Route wrapper component
 * Redirects to /auth if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // Redirect to auth page if not authenticated
    return <Navigate to="/auth" replace />;
  }

  return children;
}
