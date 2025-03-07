import React, { useEffect, useState } from 'react';
import ListItem from '../ListItem/ListItem';
import RecipeSearch from '../RecipeSearch/RecipeSearch';
import { Recipe, RecipeIngredient, Ingredient } from '../../Models/models';
import './RecipePanel.css';

const blankRecipe: Recipe = {
    title: "Enter Recipe Title",
    cookTime: 0,
    prepTime: 0,
    totalTime: 0,
    mainIngredient: "Chicken",
    ingredients: ["A whole chicken", "1/3 onions", "1 head of lettuce", "3 tomatoes"],
    steps: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit", " Maecenas mattis quis augue quis facilisis", "Cras et mollis orci"],
    imageSrc: "/salad.jpg"
};

const GET_RECIPE = "http://localhost:8001/api/recipe-ingredients"

function RecipePanel({ onRecipeSelect, setRecipeEditMode}) {
    const [recipesIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [searchRecipes, setSearchRecipes] = useState<Recipe[]>([]);
    const [buttonVisibility, setButtonVisibility] = useState(false);
    const [multiSelect, setMultiSelect] = useState(false);
    const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

   
  // Function to fetch recipes
  const fetchRecipes = async () => {
    console.log("Trying to get recipes...");
    try {
      const response = await fetch(GET_RECIPE);
      if (!response.ok) throw new Error("Failed to fetch recipes");

      const data = await response.json();
      setRecipeIngredients(data); // Set the recipe ingredients
      console.log("Fetched recipe ingredients:", data);

      if (data.length > 0) {
        setRecipes(data.map(item => item.recipe)); // Assuming each item has a `recipe` field
      }
    } catch (error) {
      setError("Error fetching recipes");
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Avoid calling onRecipeSelect on every render; only when the first recipe is available
  useEffect(() => {
    if (recipes.length > 0 && !selectedRecipes.length) {
      onRecipeSelect(recipes[0]); // Select the first recipe if it's not already selected
    }
  }, [recipes, onRecipeSelect, selectedRecipes]); // Depend on recipes to trigger

  // Call fetchRecipes once when the component mounts
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Function to handle recipe selection
  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipes([recipe[0]]); // Update selected recipes array
    onRecipeSelect(recipe); // Trigger onRecipeSelect with the selected recipe
  };


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
