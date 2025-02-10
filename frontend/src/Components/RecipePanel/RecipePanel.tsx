import React, { useState } from 'react';
import ListItem from '../ListItem/ListItem';
import RecipeSearch from '../RecipeSearch/RecipeSearch';
import { Handshake } from '@mui/icons-material';
import './RecipePanel.css';

function RecipePanel({ recipes, filterTags = [] }) {
    const [buttonVisibility, setButtonVisibility] = useState(false);
    const [multiSelect, setMultiSelect] = useState(false);
    const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

    const handleCheckboxChange = (recipeName: string, isChecked: boolean) => {
        setSelectedRecipes((prevSelected) =>
            isChecked ? [...prevSelected, recipeName] : prevSelected.filter(name => name !== recipeName)
        );
        console.log(recipeName);
    };
    const handleSelect = (option: string) => {
        if (option === "") {
            setButtonVisibility(false);
            setMultiSelect(false);
        } else if (option === "Select") {
            console.log(option);
            setButtonVisibility(true);
            setMultiSelect(true);
        }

    }
    const handleDelete = () => {
        setButtonVisibility(false);

    }
    const handleAddShoppingList = () => {
        setButtonVisibility(false);
    }
    return (
        <div className="recipe-container">
            <RecipeSearch onSelect={handleSelect}></RecipeSearch>
            {recipes.map((recipe, index) => (
                <ListItem key={index} recipe={recipe} multiSelect={multiSelect} onCheckboxChange={handleCheckboxChange} />
            ))}

            {buttonVisibility && (
                <div className="button-container">
                    <button className="delete-button" onClick={handleDelete}>Delete</button>
                    <button className="shopping-list-button" onClick={handleAddShoppingList}>Add to Shopping List</button>
                </div>
            )
            }

        </div>
    )
}

export default RecipePanel;
