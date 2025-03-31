import apiClient from "./apiClient";

const RECIPE_ADD_BY_URL_URI = "recipe-url/";

export const postRecipeUrl = async (url) => {
  try {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];  // Get CSRF token from the cookie

    const response = await apiClient.post(
      RECIPE_ADD_BY_URL_URI, 
      { 
        "payload": {
          "url": url,
        },
        "task_type": "web" 
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

