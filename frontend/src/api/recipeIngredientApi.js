import apiClient from "./apiClient";

const RECIPE_INGREDIENT_URI = "recipe-ingredients";

export const getRecipeIngredients = async () => {
  const response = await apiClient.get(RECIPE_INGREDIENT_URI);
  return response;
};

export const createRecipeIngredients = async (recipeData) => {
  const response = await apiClient.post(RECIPE_INGREDIENT_URI, recipeData);
  return response.data;
};

