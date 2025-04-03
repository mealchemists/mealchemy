import { toast } from "react-toastify";
import apiClient from "./apiClient";

const RECIPE_ADD_BY_URL_URI = "recipe-url/";
const RECIPE_ADD_BY_PDF_URI = "recipe-pdf/";
const REVIEW_RECIPES = "recipe-ingredients";

const POLL_DURATION_MINUTES = 3;
const POLL_WAIT_SECONDS = 1;
const POLL_INTERVAL_SECONDS = 15;

export const postRecipeUrl = async (url) => {
  try {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1]; // Get CSRF token from the cookie

    const response = await apiClient.post(
      RECIPE_ADD_BY_URL_URI,
      {
        url,
      }, // The request body
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

export const pollRecipeIngredients = async (extractedRecipeCount: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pollingInterval = POLL_INTERVAL_SECONDS * 1000; 
      const pollingDuration = POLL_DURATION_MINUTES * 60 * 1000; 
      const endTime = Date.now() + pollingDuration; 

      const intervalId = setInterval(async () => {
        try {
          const response = await apiClient.get(REVIEW_RECIPES);
          const data = response.data;
          console.log("Polling response:", response);

          if (response.data.length > extractedRecipeCount) {
            const review_recipe = data.filter((ri) => ri.needs_review == false);
            if (review_recipe.length > 0) {
              toast.error("Added Recipe is invalid Please Fix!");
            } else {
              toast.success("Recipe was Added!");
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
