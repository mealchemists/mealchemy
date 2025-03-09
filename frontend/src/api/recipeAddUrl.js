import apiClient from "./apiClient";

const RECIPE_ADD_BY_URL_URI = "recipe-url/";

export const postRecipeUrl = async (url) => {
  const response = await apiClient.post(RECIPE_ADD_BY_URL_URI, { url });
  return response;
};


