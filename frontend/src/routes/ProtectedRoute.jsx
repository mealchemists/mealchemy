import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../api/useAuth';

const ProtectedRoute = () => {
    const {isAuthenticated, username, user_id} = useAuth();

    if (isAuthenticated === null) return <p>Loading...</p>;
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
