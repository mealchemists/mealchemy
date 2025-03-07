import React, { useState, useEffect } from 'react';
import RecipePanel from '../RecipePanel/RecipePanel';
import RecipeContent from '../RecipeContent/RecipeContent';
import { Recipe } from '../../Models/models';
import './RecipePage.css';



function RecipePage() {
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [editMode, setEditMode] = useState(false);
    
    const handleSelectedRecipe = (recipe: Recipe) => {
        setSelectedRecipe(null); // Reset first
        setTimeout(() => {
            setSelectedRecipe(recipe); // Set the new selection
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
            {selectedRecipe && <RecipeContent recipe={selectedRecipe} initialEditMode={editMode} exitEditMode = {handleExitEditMode}/>}
        </div>
    );
}

export default RecipePage;
