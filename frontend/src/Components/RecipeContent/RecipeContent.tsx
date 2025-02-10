import React from 'react';
import RecipePanel from '../RecipePanel/RecipePanel';
import {Recipe} from '../../Models/models';
import './RecipeContent.css';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';

const options = [
    'Select',
    'Add Manually',
    'Add by URL',
    'Add by PDF'
];

const ITEM_HEIGHT = 48;
function RecipeContent({recipe}) {

    return (
        <div className="recipeContent">
            <h1>{recipe.title}</h1>
       </div>
    );
}

export default RecipeContent;
