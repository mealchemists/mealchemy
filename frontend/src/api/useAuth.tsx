import { useState, useEffect } from "react";
import apiClient from "./apiClient";

export const useAuth = () => {
    const [authData, setAuthData] = useState<{
        isAuthenticated: boolean | null,
        username: string | null
    }>({
        isAuthenticated: null,
        username: null,
    });
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await apiClient.get("/check-auth/");
                setAuthData({
                    isAuthenticated: response.data.authenticated,
                    username: response.data.username || null, 
                });
            } catch (error) {
                setAuthData({ isAuthenticated: false, username: null });
            }
        };

        checkAuth();
    }, []);

    return authData;
};
