import React, { useState } from 'react';
import ListItem from '../ListItem/ListItem';
import RecipeSearch from '../RecipeSearch/RecipeSearch';
import { Handshake } from '@mui/icons-material';
import './RecipePanel.css';

function RecipePanel({ recipes, filterTags = [] }) {
    const [buttonVisibility, setButtonVisibility] = useState(false);
    const handleSelect = (option: string) => {
        if (option === "Select") {
            console.log(option);
            setButtonVisibility(true);
        }

    }
    return (
        <div className="recipe-container">
            <RecipeSearch onSelect={handleSelect}></RecipeSearch>
            {recipes.map((recipe, index) => (
                <ListItem key={index} recipe={recipe} />
            ))}

            {buttonVisibility && (
                <div className="button-container">
                    <button className="delete-button">Delete</button>
                    <button className="shopping-list-button">Add to Shopping List</button>
                </div>
            )

            }

        </div>
    )
}

export default RecipePanel;
