import apiClient from "./apiClient";

export const addToShoppingList = async(recipe_ids, user_id) => {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];  // Get CSRF token from the cookie

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
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error sending recipe IDs:", error);
    }
}

export const getShoppingList = async(user_id) => {
    const response = await apiClient.get(`/shopping-list/${user_id}/`);
    return response.data.shopping_list;
}