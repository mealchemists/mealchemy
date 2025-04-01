import { useState, useEffect } from "react";
import apiClient from "./apiClient";

export const useAuth = () => {
    const [authData, setAuthData] = useState<{
        isAuthenticated: boolean | null,
        username: string | null,
        user_id: number | null
    }>({
        isAuthenticated: null,
        username: null,
        user_id: null
    });
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await apiClient.get("/check-auth/");
                setAuthData({
                    isAuthenticated: response.data.authenticated,
                    username: response.data.username || null, 
                    user_id: response.data.user_id || null
                });
            } catch (error) {
                setAuthData({ isAuthenticated: false, username: null, user_id: null });
            }
        };

        checkAuth();
    }, []);

    return authData;
};
