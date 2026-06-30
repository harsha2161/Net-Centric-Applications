import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuth();

  if (!token || !user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but doesn't have the required role
    // Redirect to their appropriate dashboard
    if (user.role === 'Admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'Student') {
      return <Navigate to="/studentsdashbourd" replace />;
    } else if (user.role === 'Recruiter') {
      return <Navigate to="/recruiter" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
