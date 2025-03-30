import React, { useState, useEffect } from 'react';
import RecipePanel from '../RecipePanel/RecipePanel';
import RecipeContent from '../RecipeContent/RecipeContent';
import { Recipe, RecipeIngredient } from '../../Models/models';
import './RecipePage.css';
import { deleteRecipe } from '../../api/recipes';


function RecipePage() {
    const [selectedRecipeIngredient, setSelectedRecipeIngredient] = useState<RecipeIngredient | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [recipeIngredient, setRecipeIngredients] = useState<RecipeIngredient[]>([]);

    const handleSelectedRecipe = (recipe: RecipeIngredient) => {
        setSelectedRecipeIngredient(null); // Reset first
        setTimeout(() => {
            setSelectedRecipeIngredient(recipe); // Set the new selection
        }, 0);
    }


    const handleExitEditMode = () => {
        setEditMode(false);
    }

    const handleChangeRecipeMode = (changeEditMode) => {
        setEditMode(changeEditMode);
    }

    const handleDeleteRecipe = async (recipeToDelete: RecipeIngredient) => {
        // Delete the recipe from the list
        await deleteRecipe(recipeToDelete.recipe.id);
        setRecipeIngredients((prevRecipes) => {
            const updatedRecipes = prevRecipes.filter(recipe => recipe !== recipeToDelete);

            if (selectedRecipeIngredient === recipeToDelete) {
                setSelectedRecipeIngredient(null);
            }

            return updatedRecipes;
        });
    };

    const handleUpdateRecipe = (updatedRecipe: RecipeIngredient) => {
        setRecipeIngredients(prevRecipeIngredients => {
            const updatedRecipeIngredients = prevRecipeIngredients.map(recipeIngredient => 
                recipeIngredient.id === updatedRecipe.id ? updatedRecipe : recipeIngredient
            );
            return updatedRecipeIngredients;
        });
    };


    return (
        <div className="mainContainer">
            <div className="sideContainer">
                <RecipePanel
                    recipeIngredient={recipeIngredient}
                    setRecipeIngredients={setRecipeIngredients}
                    onRecipeSelect={handleSelectedRecipe}
                    setRecipeEditMode={handleChangeRecipeMode}

                />
            </div>
            <div className="separator"></div>
            <div className="recipeContentContainer">
                {selectedRecipeIngredient && (
                    <RecipeContent
                        recipeIngredient={selectedRecipeIngredient}
                        initialEditMode={editMode}
                        exitEditMode={handleExitEditMode}
                        onDeleteRecipe={handleDeleteRecipe}
                        onUpdateRecipe={handleUpdateRecipe}
                    />
                )}
            </div>

        </div>
    );
}

export default RecipePage;
