import React, { useEffect, useState } from 'react';
import ListItem from '../ListItem/ListItem';
import RecipeSearch from '../RecipeSearch/RecipeSearch';
import { Recipe, RecipeIngredient } from '../../Models/models';
import './RecipePanel.css';
import {getRecipeIngredients} from '../../api/recipeIngredientApi.js';

const blankRecipe: Recipe = {
    title: "Enter Recipe Title",
    cook_time: 0,
    prep_time: 0,
    total_time: 0,
    main_ingredient: "Chicken",
    ingredients: ["A whole chicken", "1/3 onions", "1 head of lettuce", "3 tomatoes"],
    steps: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit", " Maecenas mattis quis augue quis facilisis", "Cras et mollis orci"],
    imageSrc: "/salad.jpg"
};

function RecipePanel({ onRecipeSelect, setRecipeEditMode }) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [recipeIngredient, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
    const [searchRecipes, setSearchRecipes] = useState<RecipeIngredient[]>(recipeIngredient);
    const [buttonVisibility, setButtonVisibility] = useState(false);
    const [multiSelect, setMultiSelect] = useState(false);
    const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecipes = async () => { 
      try {
            const response = await getRecipeIngredients();
            if (response.status != 200) throw new Error("Failed to fetch recipes");

            const data: RecipeIngredient[] = response.data; 
            setRecipeIngredients(data);
        } catch (error) {
            setError("Error fetching recipes");
            console.error("Error fetching recipes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    // TODO convert this to recipe ingredients instead
    const handleCheckboxChange = (recipeName: string, isChecked: boolean) => {
        setSelectedRecipes((prevSelected) =>
            isChecked ? [...prevSelected, recipeName] : prevSelected.filter(name => name !== recipeName)
        );
        console.log(recipeName);
    };

    // TODO convert this to recipe ingredients instead
    const handleAddManualRecipe = () => {
        setRecipeEditMode(true);
        setRecipes(prevRecipes => [...prevRecipes, blankRecipe]);
        onRecipeSelect(blankRecipe);
    };

    const handleSelectOption = (option: string) => {
        if (option === "") {
            setButtonVisibility(false);
            setMultiSelect(false);
        } else if (option === "Select") {
            setButtonVisibility(true);
            setMultiSelect(true);
        } else if (option === "Add Manually") {
            handleAddManualRecipe();
        }
    };

    const handleDelete = () => {
        // TODO: Delete from database
        setButtonVisibility(false);
    };

    const handleAddShoppingList = () => {
        setButtonVisibility(false);
    };

    useEffect(() => {
        setSearchRecipes(recipeIngredient); 
    }, [recipeIngredient]);

    const handleSearchRecipe = (searchInput: string) => {
    if (!searchInput.trim()) {
        setRecipeIngredients(recipeIngredient); // Reset to the original list when empty
        return;
    }

    const filtered = recipeIngredient.filter(
        item => item.recipe && item.recipe.title.toLowerCase().includes(searchInput.toLowerCase())
    );

    setRecipeIngredients(filtered);
};
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="recipe-container">

            <RecipeSearch onSelect={handleSelectOption} searchRecipe={handleSearchRecipe} />
            {searchRecipes.map((recipe, index) => (
                <ListItem key={index} recipeIngredient={recipe} multiSelect={multiSelect} onCheckboxChange={handleCheckboxChange} onClick={() => onRecipeSelect(recipe)} />
            ))}

            {buttonVisibility && (
                <div className="button-container">
                    <button className="delete-button" onClick={handleDelete}>Delete</button>
                    <button className="shopping-list-button" onClick={handleAddShoppingList}>Add to Shopping List</button>
                </div>
            )}
        </div>
    );
}

export default RecipePanel;
