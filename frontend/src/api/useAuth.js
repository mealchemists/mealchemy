import { useState, useEffect } from "react";
import apiClient from "./apiClient";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await apiClient.get("/check-auth/");
                setIsAuthenticated(response.data.authenticated);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    return isAuthenticated;
};
