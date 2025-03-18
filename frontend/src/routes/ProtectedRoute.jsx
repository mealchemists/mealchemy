import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../api/useAuth.js';

const ProtectedRoute = () => {
    const isAuthenticated = useAuth();

    if (isAuthenticated === null) return <p>Loading...</p>;
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
