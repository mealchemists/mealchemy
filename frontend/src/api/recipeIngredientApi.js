import apiClient from "./apiClient";

const RECIPE_INGREDIENT_URI = "recipe-ingredients";

export const getRecipeIngredients = async () => {
  const response = await apiClient.get(RECIPE_INGREDIENT_URI);
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

export const createRecipeIngredients = async (recipeData) => {
  const response = await apiClient.post(RECIPE_INGREDIENT_URI, recipeData);
  return response.data;
};

