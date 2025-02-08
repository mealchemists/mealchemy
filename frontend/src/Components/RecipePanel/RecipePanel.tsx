import React from 'react';
import ListItem from '../ListItem/ListItem';

function RecipePanel({ recipes, filterTags = [] }) {
    return (
        <div>
            {recipes.map((recipe, index) => (
                <ListItem key={index} recipe={recipe} />
            ))}
        </div>
    )
}

export default RecipePanel;
