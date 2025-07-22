import { Authenticator, UseAuthenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';
import { NavBar } from "./components/navbar"
import { AuthUser, UserAttributeKey } from 'aws-amplify/auth';

import { Routes, Route } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { AdminPage } from "./pages/AdminPage";
import { RotarianPage } from "./pages/RotarianPage";
import { CamperPage } from "./pages/camper/CamperPage";
import { createContext, useEffect, useState } from "react";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useUserQuery } from "./queries/queries";
import { Spinner } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { isUserCamper } from "./api/auth";
import { UserManagement } from "./pages/UserManagement";
import { CampDashboard } from "./pages/CampDashboard";

function App() {
    return (
        <Authenticator>
            {({ signOut, user }) => {
                return <AuthView signOut={signOut} user={user} />
            }}
        </Authenticator>
    );
}

type AuthContextType = {
    user: AuthUser | null;
    groups: string;
    attributes: Partial<Record<UserAttributeKey, string>>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    groups: "",
    attributes: {}
});

interface AuthViewProps {
    signOut: UseAuthenticator["signOut"] | undefined;
    user: AuthUser | undefined;
}

function AuthView({ signOut, user }: AuthViewProps) {

    const { data: userData, isLoading } = useUserQuery(user);

    

    if (isLoading) {
        return (
            <div className="loading">
                <Spinner animation="border" role="status"/>
            </div>
        )
    }
    else if(userData){

        const authContextValue = {
            user: userData.user,
            groups: userData.groups,
            attributes: userData.attributes
        }

        const isCamper = isUserCamper(userData.groups);

        return (
            <AuthContext.Provider value={authContextValue}>
                <div id="main">
                    <NavBar signOut={signOut} title="RYLA 7780 Registration" />
                    <div id="content">
                        <Routes>
                            {/* Home route - accessible to all authenticated users */}
                            <Route path="/" element={<HomePage />} />

                            {/* Admin routes - only accessible to admin users */}
                            <Route
                                path="/admin/*"
                                element={
                                    <ProtectedRoute hasAccess={userData.groups.includes('ADMINS')}>
                                        <Routes>
                                            <Route path="*" element={<AdminPage />} />
                                            <Route path="/user-management" element={<UserManagement />} />
                                            <Route path="/camp-dashboard" element={<CampDashboard />} />
                                        </Routes>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Rotarian routes - only accessible to rotarian users */}
                            <Route
                                path="/rotarian"
                                element={
                                    <ProtectedRoute hasAccess={userData.groups.includes('ROTARIANS')}>
                                        <RotarianPage

                                        />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Camper routes - only accessible to camper users */}
                            <Route
                                path="/camper/*"
                                element={
                                    <ProtectedRoute hasAccess={isCamper}>
                                        <CamperPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Catch-all route - redirect to home */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </div>
                    
                </div>
                <ToastContainer />
            </AuthContext.Provider>
        )
    }
    else {
        return (
            <div className="error">
                <p>Error loading user data. Please try again.</p>
            </div>
        )
    }
}

export default App;
