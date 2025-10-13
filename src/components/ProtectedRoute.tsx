import React from 'react';
import { Navigate } from 'react-router';

interface ProtectedRouteProps {
    children: React.ReactNode;
    hasAccess: boolean | null | undefined;
    fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    hasAccess, 
    fallbackPath='/'
}) => {
    // const navigate = useNavigate();
    // console.log("hasAccess", hasAccess);
    if (!hasAccess) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
}; 