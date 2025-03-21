import apiClient from "./apiClient";

const RECIPE_INGREDIENT_URI = "recipe-ingredients";

export const getRecipeIngredients = async (searchParams = {}) => {
  // Construct the query string if there are search parameters
  const queryString = new URLSearchParams(searchParams).toString();
  
  // Create the final URI with query parameters
  const url = queryString ? `${RECIPE_INGREDIENT_URI}?${queryString}` : RECIPE_INGREDIENT_URI;

  // Send the GET request to the API
  const response = await apiClient.get(url);
  
  return response;
};

// export const deleteRecipeIngredients = async (id) => {
//   const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];  // Get CSRF token from the cookie

//   const response = await apiClient.delete(RECIPE_INGREDIENT_URI + '/' + String(id));
//   return response;
// }

export const deleteRecipeIngredients = async (id) => {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];  // Get CSRF token from the cookie

    const response = await apiClient.delete(
        `${RECIPE_INGREDIENT_URI}/${id}`, 
        {
            headers: {
                'X-CSRFToken': csrfToken,  // Include CSRF token
            },
            withCredentials: true,  // Ensure cookies are sent with the request
        }
    );
    return response;

};

export const putRecipeIngredients = async (data) => {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];

    try {
        const response = await apiClient.put(
            RECIPE_INGREDIENT_URI,  
            data,  
            {
                headers: {
                    'X-CSRFToken': csrfToken,  // Include CSRF token
                },
                withCredentials: true,  // Ensure cookies are sent with the request
            }
        );
        return response;
    } catch (error) {
        // Handle error response
        console.error("Error updating recipe ingredients:", error);
        throw error;  // Optionally, rethrow or handle the error as needed
    }
};

export const createRecipeIngredients = async (recipeData) => {
  const response = await apiClient.post(RECIPE_INGREDIENT_URI, recipeData);
  return response.data;
};

