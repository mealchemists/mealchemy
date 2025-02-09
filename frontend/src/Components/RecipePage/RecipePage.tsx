import React from 'react';
import RecipePanel from '../RecipePanel/RecipePanel';
import RecipeContent from '../RecipeContent/RecipeContent';
import RecipeSearch from '../RecipeSearch/RecipeSearch';
import { Recipe } from '../../Models/models';
import './RecipePage.css';
function RecipePage() {
    const recipe: Recipe = {
        title: "Salad",
        cookingTime: 30,
        tags: ["Healthy", "Vegetarian", "Quick"],
        imageSrc: "/salad.jpg"
    };

    return (
        <div className="mainContainer">
            <div className="sideContainer">
                
                <RecipePanel recipes={[recipe]} />
            </div>
            <div className="separator"></div> 
            <RecipeContent recipe={recipe}></RecipeContent>
        </div>
    );
}

export default RecipePage;
