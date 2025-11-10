import { Authenticator, UseAuthenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';
import { NavBar } from "./components/navbar"
import { AuthUser, UserAttributeKey } from 'aws-amplify/auth';

import { Routes, Route } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { RotarianPage } from "./pages/RotarianPage";
import { CamperPage } from "./pages/camper/CamperPage";
import { createContext } from "react";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useUserQuery } from "./queries/queries";
import { Spinner } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { isUserAdmin, isUserCamper, isUserRotarian } from "./api/auth";
import { UserManagement } from "./pages/UserManagement";
import { CampDashboard } from "./pages/CampDashboard";
import { CampManagementPage } from "./pages/camp/CampManagementPage";
import { ViewCamperPage } from "./pages/ViewCamperPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RotaryClubManagementPage } from "./pages/RotaryClubManagementPage";
import { SubmitRecommendationPage } from "./pages/SubmitRecommendationPage";
import { HelpPage } from "./pages/HelpPage";

function App() {
    return (
        <>
            <Routes>
                <Route path="/submit-recommendation" element={
                    <div id="main">
                        <NavBar title="RYLA 7780 Registration" />
                        <div id="content">
                            <SubmitRecommendationPage />
                        </div>
                    </div>
                } />
                <Route path="*" element={
                    <Authenticator>
                        {({ signOut, user }) => {
                            return <AuthView signOut={signOut} user={user} />
                        }}
                    </Authenticator>
                } />
            </Routes>
            <ToastContainer />
        </>
    );
}

type AuthContextType = {
    groups: string;
    attributes: Partial<Record<UserAttributeKey, string>>;
    identityId?: string;
}

export const AuthContext = createContext<AuthContextType>({
    groups: "",
    attributes: {},
});

interface AuthViewProps {
    signOut: UseAuthenticator["signOut"] | undefined;
    user: AuthUser | undefined;
}

function AuthView({ signOut, user }: AuthViewProps) {

    const { data: userData, isLoading } = useUserQuery(user?.userId);

    if (isLoading) {
        return (
            <div className="loading">
                <Spinner animation="border" role="status" />
            </div>
        )
    }
    else if (userData) {

        const authContextValue = { ...userData };

        const isCamper = isUserCamper(userData.groups);
        const isRotarian = isUserRotarian(userData.groups);
        const isAdmin = isUserAdmin(userData.groups);

        return (
            <AuthContext.Provider value={authContextValue}>
                <div id="main">
                    <NavBar isAdmin={isAdmin} signOut={signOut} title="RYLA 7780 Registration" />
                    <div id="content">
                        <Routes>
                            {/* Home route - accessible to all authenticated users */}
                            <Route path="/" element={<HomePage />} />

                            {/* Profile route - accessible to all authenticated users */}
                            <Route path="/profile" element={<ProfilePage />} />

                            {/* Admin routes - only accessible to admin users */}
                            <Route
                                path="/admin"
                            >
                                {/* <Route index element={
                                    <ProtectedRoute hasAccess={userData.groups.includes('ADMINS')}>
                                        <AdminPage />
                                    </ProtectedRoute>
                                } /> */}
                                <Route path="user-management" element={
                                    <ProtectedRoute hasAccess={userData.groups.includes('ADMINS')}>
                                        <UserManagement />
                                    </ProtectedRoute>
                                } />
                                <Route index element={
                                    <ProtectedRoute hasAccess={userData.groups.includes('ADMINS')}>
                                        <CampDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="camps/:campId/*" element={
                                    <ProtectedRoute hasAccess={userData.groups.includes('ADMINS')}>
                                        <CampManagementPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="rotary-clubs" element={
                                    <ProtectedRoute hasAccess={userData.groups.includes('ADMINS')}>
                                        <RotaryClubManagementPage />
                                    </ProtectedRoute>
                                } />
                            </Route>

                            {/* Rotarian routes - only accessible to rotarian users */}
                            <Route
                                path="/rotarian/*"
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

                            <Route path="/camper-view/:camperSub"
                                element={
                                    <ProtectedRoute hasAccess={isRotarian || isAdmin}>
                                        <ViewCamperPage />
                                    </ProtectedRoute>
                                } />

                            {/* Catch-all route - redirect to home */}
                            <Route path="/help" element={<HelpPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </div>

                </div>
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
