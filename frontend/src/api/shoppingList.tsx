import apiClient from "./apiClient";

export const addToShoppingList = async(recipe_ids, user_id) => {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];
    try {
        const response = await apiClient.post(
            `/shopping-list/${user_id}/`, 
            {
                recipe_ids: recipe_ids,
            },
            {
                headers: {
                  'X-CSRFToken': csrfToken,  // Include CSRF token
                },
                withCredentials: true,  // Ensure cookies are sent with the request
            }
        );
    } catch (error) {
        console.error("Error sending recipe IDs:", error);
    }
}

export const getShoppingList = async(user_id, type) => {
    const response = await apiClient.get(`/shopping-list/${user_id}/`,
        {
            params: { type }
        });
    return response.data;
}

export const deleteRecipes = async(recipe_ids, user_id) => {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];
    const response = await apiClient.delete(
        `/shopping-list/${user_id}/`, 
        {
            data: { recipe_ids: recipe_ids },  
            headers: {
                'X-CSRFToken': csrfToken,  
            },
            withCredentials: true,  
        }
    );
    return response.data;
}