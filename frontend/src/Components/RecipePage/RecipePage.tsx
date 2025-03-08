import React, { useState, useEffect } from 'react';
import RecipePanel from '../RecipePanel/RecipePanel';
import RecipeContent from '../RecipeContent/RecipeContent';
import { Recipe, RecipeIngredient } from '../../Models/models';
import './RecipePage.css';



function RecipePage() {
    const [selectedRecipeIngredient, setSelectedRecipeIngredient] = useState<RecipeIngredient | null>(null);
    const [editMode, setEditMode] = useState(false);
    
    const handleSelectedRecipe = (recipe: RecipeIngredient) => {
        setSelectedRecipeIngredient(null); // Reset first
        setTimeout(() => {
            setSelectedRecipeIngredient(recipe); // Set the new selection
        }, 0);
    }

    const handleExitEditMode = () => {
        setEditMode(false);
    }

    const handleChangeRecipeMode = (changeEditMode)=>{
        setEditMode(changeEditMode);
    }


    return (
        <div className="mainContainer">
            <div className="sideContainer">
                <RecipePanel onRecipeSelect={handleSelectedRecipe} setRecipeEditMode={handleChangeRecipeMode}/>
            </div>
            <div className="separator"></div>
            {selectedRecipeIngredient && <RecipeContent recipeIngredient={selectedRecipeIngredient} initialEditMode={editMode} exitEditMode = {handleExitEditMode}/>}
        </div>
    );
}

export default RecipePage;
