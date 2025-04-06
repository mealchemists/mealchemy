import {FilterObject } from '../Models/models';
import { getRecipeIngredients } from '../api/recipeIngredientApi';

// This function receives the filter object and applies it to the GET request
export const handleFilterApply = async (filterObj: FilterObject, setRecipeIngredients) => {
    // Construct the query string based on the filters
    const { searchQuery, sortBy, range, mainIngredient, needs_review } = filterObj;
    const queryParams = new URLSearchParams();
    // Add filters to query params (example)
    if (searchQuery) queryParams.append('search', searchQuery);
    if (needs_review) queryParams.append('needs_review', 'true')
    if (sortBy) queryParams.append('ordering', sortBy);
    if (range.length) queryParams.append('cook_time_min', range[0].toString());
    if (range.length > 1) queryParams.append('cook_time_max', range[1].toString());
    if (mainIngredient) queryParams.append('main_ingredient', mainIngredient);

    try {
        // Call the API with the search parameter
        const response = await getRecipeIngredients(queryParams);

        // Set the recipe ingredients with the API response
        setRecipeIngredients(response);
    } catch (error) {
        console.error('Error fetching recipe ingredients:', error);
        // Optionally, you can handle errors (e.g., display a message to the user)
    }
};