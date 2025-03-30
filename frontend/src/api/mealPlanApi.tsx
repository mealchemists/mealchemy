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

export const deleteMealPlan = async (id) => {
  const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];  // Get CSRF token from the cookie
  const url =   `${MEAL_PLAN}/${id}`
  const response = await apiClient.delete(
    url,
    {
      headers: {
          'X-CSRFToken': csrfToken,  // Include CSRF token
      },
      withCredentials: true,  // Ensure cookies are sent with the request
    }
  );
  
  return response.data;
};


export const putMealPlan = async (data) => {
  const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];  // Get CSRF token from the cookie
  // Construct the query string if there are search parameters
  
  const url = MEAL_PLAN
  const response = await apiClient.post(
    url,
    data,
    {
      headers: {
          'X-CSRFToken': csrfToken,  // Include CSRF token
      },
      withCredentials: true,  // Ensure cookies are sent with the request
  }
  );
  
  return response.data;
};

