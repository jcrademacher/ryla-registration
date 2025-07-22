import React, { useContext } from 'react';
import { Navigate } from 'react-router';
import { AuthContext } from '../App';
import { NotFoundPage } from './NotFoundPage';
import { RoleSelectionPage } from './RoleSelectionPage';
import { isUserAdmin, isUserNew, isUserCamper, isUserRotarian } from '../api/auth';

export const HomePage: React.FC = () => {

    const authContext = useContext(AuthContext);
    const userGroups = authContext?.groups ?? [] as string[];
    
    const isAdmin = isUserAdmin(userGroups);
    const isRotarian = isUserRotarian(userGroups);
    const isNew = isUserNew(userGroups);
    const isCamper = isUserCamper(userGroups);

    if(isAdmin) {
        return (
            <Navigate to="/admin" replace/>
        );
    }

    if(isRotarian) {
        return (
            <Navigate to="/rotarian" replace/>
        );
    }

    if(isCamper) {
        return (
            <Navigate to="/camper/profile" replace/>
        );
    }

    // Show role selection page for NEW users
    if(isNew) {
        return <RoleSelectionPage />;
    }

    // Fallback
    return (
        <div>
            <p>Welcome to the RYLA 7780 Registration Portal. Please wait while we review your application.</p>
        </div>
    );
}; 