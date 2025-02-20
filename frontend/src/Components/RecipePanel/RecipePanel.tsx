import React, { useEffect, useState } from 'react';
import ListItem from '../ListItem/ListItem';
import RecipeSearch from '../RecipeSearch/RecipeSearch';
import { Recipe } from '../../Models/models';
import './RecipePanel.css';

const blankRecipe: Recipe = {
    title: "Enter Recipe Title",
    cookTime: 0,
    prepTime: 0,
    totalTime: 0,
    mainIngredient: "Chicken",
    ingredients: ["A whole chicken", "1/3 onions", "1 head of lettuce", "3 tomatoes"],
    instructions: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit", " Maecenas mattis quis augue quis facilisis", "Cras et mollis orci"],
    imageSrc: "/salad.jpg"
};

function RecipePanel({ onRecipeSelect, setRecipeEditMode}) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [searchRecipes, setSearchRecipes] = useState<Recipe[]>(recipes);

    const [buttonVisibility, setButtonVisibility] = useState(false);
    const [multiSelect, setMultiSelect] = useState(false);
    const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

    const handleCheckboxChange = (recipeName: string, isChecked: boolean) => {
        setSelectedRecipes((prevSelected) =>
            isChecked ? [...prevSelected, recipeName] : prevSelected.filter(name => name !== recipeName)
        );
        console.log(recipeName);
    };

    const handleAddManualRecipe = () =>{
        setRecipeEditMode(true);
        setRecipes(prevRecipes => [...prevRecipes, blankRecipe]);
        onRecipeSelect(blankRecipe);
    }

    useEffect(()=> {
        const recipe1: Recipe = {
            title: "Salad",
            cookTime: 30,
            prepTime: 50,
            totalTime: 80,
            mainIngredient: "Chicken",
            ingredients: ["A whole chicken", "1/3 onions", "1 head of lettuce", "3 tomatoes"],
            instructions: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit", " Maecenas mattis quis augue quis facilisis", "Cras et mollis orci"],
            imageSrc: "/salad.jpg"
        };

        const recipe2: Recipe = {
            title: "Soup",
            cookTime: 20,
            prepTime: 20,
            totalTime: 40,
            mainIngredient: "Beef",
            ingredients: ["A whole chicken", "1/3 onions", "1 head of lettuce", "3 tomatoes"],
            instructions: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit", " Maecenas mattis quis augue quis facilisis", "Cras et mollis orci"],
            imageSrc: "/salad.jpg"
        };

        setRecipes([recipe1, recipe2]);
        onRecipeSelect(recipe1);
    }, [])

    const handleSelectOption = (option: string) => {
        if (option === "") {
            setButtonVisibility(false);
            setMultiSelect(false);
        } else if (option === "Select") {
            setButtonVisibility(true);
            setMultiSelect(true);
        } else if (option === "Add Manually"){
            handleAddManualRecipe();
        }

    }
    const handleDelete = () => {
        // TODO: Delete from database
        setButtonVisibility(false);
    }
    const handleAddShoppingList = () => {
        setButtonVisibility(false);
    }

    useEffect(() => {
        setSearchRecipes(recipes); // Ensure filtered list updates when recipes change
    }, [recipes]);

    const handleSearchRecipe = (searchInput) => {
        const filtered = recipes.filter(recipe =>
            recipe.title.toLowerCase().includes(searchInput.toLowerCase())
        );
    
        setSearchRecipes(filtered);
    }
    return (
        <div className="recipe-container">
            <RecipeSearch onSelect={handleSelectOption} searchRecipe = {handleSearchRecipe}></RecipeSearch>
            {searchRecipes.map((recipe, index) => (
                <ListItem key={index} recipe={recipe} multiSelect={multiSelect} onCheckboxChange={handleCheckboxChange}  onClick={() => onRecipeSelect(recipe)}/>
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
