import apiClient from "./apiClient";

const RECIPE_ADD_BY_URL_URI = "recipe-url/";
const RECIPE_ADD_BY_PDF_URI = "recipe-pdf/"

export const postRecipeUrl = async (url) => {
    try {
        const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];  // Get CSRF token from the cookie

        const response = await apiClient.post(
            RECIPE_ADD_BY_URL_URI,
            {
                url
            },  // The request body
            {
                headers: {
                    'X-CSRFToken': csrfToken,  // Include CSRF token
                },
                withCredentials: true,  // Ensure cookies are sent with the request
            }
        );

        return response;  // Return the response
    } catch (error) {
        console.error('Error posting recipe URL:', error);
        throw error;  // Throw the error to be handled by the calling function
    }
};

export const postRecipePDF = async (file: File) => {
    try {
        const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];  // Get CSRF token from the cookie

        const formData = new FormData();
        formData.append("temp_file", file);

        const response = await apiClient.post(
            RECIPE_ADD_BY_PDF_URI,
            formData,
            {
                headers: {
                    'X-CSRFToken': csrfToken,  // Include CSRF token
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true,  // Ensure cookies are sent with the request
            }
        );

        return response;  // Return the response
    } catch (error) {
        console.error('Error posting recipe URL:', error);
        throw error;  // Throw the error to be handled by the calling function
    }
}

export const deleteRecipe = async (recipe_id) => {
    try {
        const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];  // Get CSRF token from the cookie

        const response = await apiClient.delete(
            `recipe/${recipe_id}`,
            {
                headers: {
                    'X-CSRFToken': csrfToken,  // Include CSRF token
                },
                withCredentials: true,  // Ensure cookies are sent with the request
            }
        );

        return response;  // Return the response
    } catch (error) {
        console.error('Error posting recipe URL:', error);
        throw error;  // Throw the error to be handled by the calling function
    }
};


