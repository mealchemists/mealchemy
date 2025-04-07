import apiClient from "./apiClient";

export const getAisles = async(user_id) => {
    const response = await apiClient.get(`/aisles/${user_id}`);
    return response.data;
}

export const addAisle = async(aisle_name, user_id) => {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1]; 
    
    try {
        const response = await apiClient.post(
            `/aisles/${user_id}`, 
            {
                "name":aisle_name
            },
            {
                headers: {
                  'X-CSRFToken': csrfToken,  // Include CSRF token
                },
                withCredentials: true,  // Ensure cookies are sent with the request
              }
        );
        return response.data;
    } catch (error) {
        console.error("Error sending recipe IDs:", error);
        return null;
    }
}
