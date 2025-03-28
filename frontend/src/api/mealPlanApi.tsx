import apiClient from "./apiClient";
import { Recipe, RecipeIngredient } from '../Models/models';

const MEAL_PLAN = "meal-plan";

export const getMealPlans = async (searchParams = {}) => {
  // Construct the query string if there are search parameters
  const queryString = new URLSearchParams(searchParams).toString();
  
  const url =   `${MEAL_PLAN}?${queryString}`
  const response = await apiClient.get(url);
  
  return response.data;
};
