import { toast } from "react-toastify";
import apiClient from "./apiClient";

const RECIPE_ADD_BY_URL_URI = "recipe-url/";
const RECIPE_ADD_BY_PDF_URI = "recipe-pdf/"
const REVIEW_RECIPES = "recipe-ingredients?needs_review=true"

const POLL_DURATION_MINUTES = 3 
const POLL_WAIT_SECONDS = 20
const POLL_INTERVAL_SECONDS = 15

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

export const pollRecipeIngredients = async () => {
    setTimeout(async () => {
        const pollingInterval = POLL_INTERVAL_SECONDS * 1000;  // Poll every 15 seconds
        const pollingDuration = POLL_DURATION_MINUTES * 60 * 1000;  // 5 minutes in milliseconds
        const endTime = Date.now() + pollingDuration; // End time for the polling (5 minutes from now)

        // Polling logic: keep calling the endpoint every 15 seconds for 3 minutes
        const intervalId = setInterval(async () => {
            try {
                const response = await apiClient.get(REVIEW_RECIPES);
                console.log('Polling response:', response);
                
               if (response.data.length > 0) {
                    console.log('Review process completed');
                    toast.error('Recipes Need Review!');  // Notify that the review is complete
                    clearInterval(intervalId);  // Stop polling
                    return true;  // Successfully completed, exit polling
                }
            } catch (error) {
                console.error('Error polling recipe ingredients:', error);
                clearInterval(intervalId);  // Stop polling on error
            }
        }, pollingInterval);

        // Stop polling after 5 minutes
        setTimeout(() => {
            clearInterval(intervalId);  // Clear the interval after 5 minutes
            console.log('Polling ended after 5 minutes');
        }, pollingDuration);

    }, POLL_WAIT_SECONDS * 1000);  // Wait for 20 seconds before starting the polling
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


