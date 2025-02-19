import React from 'react';
import RecipePanel from '../RecipePanel/RecipePanel';
import RecipeContent from '../RecipeContent/RecipeContent';
import { Recipe } from '../../Models/models';
import './RecipePage.css';
function RecipePage() {
    const recipe: Recipe = {
        title: "Salad",
        cookTime: 30,
        prepTime:50,
        totalTime:80,
        mainIngredient: "Chicken",
        ingredients:["A whole chicken", "1/3 onions", "1 head of lettuce", "3 tomatoes"],
        instructions: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit", " Maecenas mattis quis augue quis facilisis", "Cras et mollis orci"],
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
