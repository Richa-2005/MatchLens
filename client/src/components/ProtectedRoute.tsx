import { useAuth } from '../context/AuthContext.tsx'
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react';

type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = ({ children } : ProtectedRouteProps ) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if(!isAuthenticated){
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;

}