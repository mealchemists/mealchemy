import React from 'react';
import RecipePanel from '../RecipePanel/RecipePanel';
import {Recipe} from '../../Models/models';
import './RecipeContent.css';

function RecipeContent({recipe}) {

    return (
        <div className="recipeContent">
            <h1>{recipe.title}</h1>
       </div>
    );
}

export default RecipeContent;
