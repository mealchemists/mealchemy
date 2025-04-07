import { toast } from "react-toastify";
import apiClient from "./apiClient";
import { needsReview } from "../utils/review";
import { getCsrfToken } from "./login";

const RECIPE_ADD_BY_URL_URI = "recipe-url/";
const RECIPE_ADD_BY_PDF_URI = "recipe-pdf/";
const REVIEW_RECIPES = "recipe-ingredients";

const POLL_DURATION_MINUTES = 3; // How long we poll for before giving up
const POLL_WAIT_SECONDS = 5; // When polling, how often we request recipe ingredients
const POLL_INTERVAL_SECONDS = 15; // inital wait time before starting the poll period

export const postRecipeUrl = async (url) => {
    try {
        const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1]; // Get CSRF token from the cookie

        const response = await apiClient.post(
            RECIPE_ADD_BY_URL_URI,
            {
                url,
            },
            {
                headers: {
                    "X-CSRFToken": csrfToken, // Include CSRF token
                },
                withCredentials: true, // Ensure cookies are sent with the request
            }
        );

        return response; // Return the response
    } catch (error) {
        console.error("Error posting recipe URL:", error);
        throw error; // Throw the error to be handled by the calling function
    }
};

export const pollRecipeIngredients = async (currentExtractedRecipeCount: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const pollingInterval = POLL_INTERVAL_SECONDS * 1000;
            const pollingDuration = POLL_DURATION_MINUTES * 60 * 1000;
            const endTime = Date.now() + pollingDuration;

            const intervalId = setInterval(async () => {
                try {
                    const response = await apiClient.get(REVIEW_RECIPES);
                    const extracted_recipes = response.data.filter((ri) => ri.added_by_extractor == true);
                   
                    if (extracted_recipes.length > currentExtractedRecipeCount) {
                        const reviewable_recipes = extracted_recipes.filter((ri) => needsReview(ri))
                        console.log("reviewable_Recipes", reviewable_recipes )
                        if (reviewable_recipes.length > 0) {
                            toast.error("Added Recipe is invalid Please Fix!");
                        } else {
                            toast.success("Recipe was successfully added!");
                        }
                        clearInterval(intervalId);
                        resolve();
                    }
                } catch (error) {
                    console.error("Error polling recipe ingredients:", error);
                    clearInterval(intervalId);
                    resolve();
                }
            }, pollingInterval);

            setTimeout(() => {
                clearInterval(intervalId);
                console.log("Polling ended after 5 minutes");
                resolve();
            }, pollingDuration);
        }, POLL_WAIT_SECONDS);
    });
};

export const postRecipePDF = async (file: File) => {
    try {
        const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1]; // Get CSRF token from the cookie

        const formData = new FormData();
        formData.append("temp_file", file);

        const response = await apiClient.post(RECIPE_ADD_BY_PDF_URI, formData, {
            headers: {
                "X-CSRFToken": csrfToken, // Include CSRF token
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true, // Ensure cookies are sent with the request
        });

        return response; // Return the response
    } catch (error) {
        console.error("Error posting recipe URL:", error);
        throw error; // Throw the error to be handled by the calling function
    }
};

export const deleteRecipe = async (recipe_id) => {
    try {
        const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1]; // Get CSRF token from the cookie

        const response = await apiClient.delete(`recipe/${recipe_id}`, {
            headers: {
                "X-CSRFToken": csrfToken, // Include CSRF token
            },
            withCredentials: true, // Ensure cookies are sent with the request
        });

        return response; // Return the response
    } catch (error) {
        console.error("Error posting recipe URL:", error);
        throw error; // Throw the error to be handled by the calling function
    }
};

export const jwtToken = async()=>{
    const response = await apiClient.get('get-jwt-token/5');
    return response.data;
}