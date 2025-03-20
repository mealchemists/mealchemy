import React, { useEffect, useState } from 'react';
import ListItem from '../ListItem/ListItem';
import RecipeSearch from '../RecipeSearch/RecipeSearch';
import { Recipe, RecipeIngredient } from '../../Models/models';
import './RecipePanel.css';
import {getRecipeIngredients} from '../../api/recipeIngredientApi.js';

interface RecipePanelProps {
    recipeIngredient: RecipeIngredient[];
    setRecipeIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>; // Set recipe list from parent
    onRecipeSelect: (recipe: RecipeIngredient) => void;
    setRecipeEditMode: (editMode: boolean) => void;
}

const RecipePanel: React.FC<RecipePanelProps> = ({ 
    recipeIngredient, 
    setRecipeIngredients, 
    onRecipeSelect, 
    setRecipeEditMode 
}) => {
    const [searchRecipes, setSearchRecipes] = useState<RecipeIngredient[]>(recipeIngredient);
    const [buttonVisibility, setButtonVisibility] = useState(false);
    const [multiSelect, setMultiSelect] = useState(false);
    const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchRecipes = async () => { 
      try {
            const response = await getRecipeIngredients();
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
    };

    // TODO convert this to recipe ingredients instead
    const handleAddManualRecipe = () => {
        // setRecipeEditMode(true);
        // setRecipes(prevRecipes => [...prevRecipes, blankRecipe]);
        // onRecipeSelect(blankRecipe);
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

    const handleSearchRecipe = async (searchInput: string) => {
        // If searchInput is empty or just whitespace, reset to the original list
        if (!searchInput.trim()) {
          setRecipeIngredients(recipeIngredient); // Reset to the original list
          return;
        }
        
        try {
          // Call the API with the search parameter
          const response = await getRecipeIngredients({ search: searchInput.trim() });
      
          // Set the recipe ingredients with the API response
          setRecipeIngredients(response.data); // Assuming 'data' contains the list of ingredients
        } catch (error) {
          console.error('Error fetching recipe ingredients:', error);
          // Optionally, you can handle errors (e.g., display a message to the user)
        }
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
