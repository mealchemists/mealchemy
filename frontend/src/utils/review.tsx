import { RecipeIngredient } from "../Models/models";

export const needsReview = (recipeIngredient: RecipeIngredient): boolean => {
    if (recipeIngredient.needs_review) return true;
    if (recipeIngredient.recipe?.needs_review) return true;

    return recipeIngredient.ingredients?.some(
        (ingredient) => ingredient.needs_review
    ) ?? false;
};
