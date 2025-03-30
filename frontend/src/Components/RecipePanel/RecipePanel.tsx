import React, { useEffect, useRef, useState } from 'react';
import ListItem from '../ListItem/ListItem';
import RecipeSearch from '../RecipeSearch/RecipeSearch';
import { Recipe, RecipeIngredient, Ingredient } from '../../Models/models';
import './RecipePanel.css';
import { getRecipeIngredients } from '../../api/recipeIngredientApi';
import Button from '@mui/material/Button';
import { deleteRecipe } from '../../api/recipes';

interface RecipePanelProps {
    recipeIngredient: RecipeIngredient[];
    setRecipeIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>; // Set recipe list from parent
    onRecipeSelect: (recipe: RecipeIngredient) => void;
    setRecipeEditMode: (editMode: boolean) => void;
}

const blankRecipe: Recipe = {
    id: -1,
    name: "",
    cook_time: 0,
    prep_time: 0,
    total_time: 0,
    main_ingredient: "Main Ingredient",
    ingredients: [],
    steps: "Enter instructions here",
    image_url: "",
};

const blankRecipeIngredient:RecipeIngredient = {
    id:-1,
    recipe: blankRecipe,
    ingredients: [] as Ingredient[], 
};

const RecipePanel: React.FC<RecipePanelProps> = ({
    recipeIngredient,
    setRecipeIngredients,
    onRecipeSelect,
    setRecipeEditMode
}) => {
    const [searchRecipes, setSearchRecipes] = useState<RecipeIngredient[]>(recipeIngredient);
    const [allRecipeIngredients, setAllRecipeIngredients] = useState<RecipeIngredient[]>([]);
    const [buttonVisibility, setButtonVisibility] = useState(false);
    const [multiSelect, setMultiSelect] = useState(false);
    const [selectedRecipes, setSelectedRecipes] = useState<Number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const recipeSearchRef = useRef<any>(null);

    const fetchRecipes = async () => {
        try {
            const response = await getRecipeIngredients();
            console.log(response);
            setRecipeIngredients(response);
            setAllRecipeIngredients(response);
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
    const handleCheckboxChange = (recipeId: Number, isChecked: boolean) => {
        setSelectedRecipes((prevSelected) => {
            if (isChecked) {
                // Add the selected recipe to the array
                return [...prevSelected, recipeId];
            } else {
                // Remove the selected recipe from the array
                return prevSelected.filter((id) => id !== recipeId);
            }
        });
    };


    // TODO convert this to recipe ingredients instead
    const handleAddManualRecipe = () => {
        setRecipeEditMode(true);
        setAllRecipeIngredients(prevRecipes => [...prevRecipes, blankRecipeIngredient]);
        onRecipeSelect(blankRecipeIngredient);
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

    const handleDelete = async () => {
        if (selectedRecipes.length === 0) {
            return;
        }
        try {
            // Loop through each selected recipe and send the delete request
            for (const recipeId of selectedRecipes) {
                const recipeToDelete = recipeIngredient.find(
                    recipeIngredient => recipeIngredient.recipe.id === recipeId
                );
                if (recipeToDelete) {
                    await deleteRecipe(recipeToDelete.recipe.id);
                }
            }

            // After deletion, update the state and clear selected recipes
            const updatedRecipes = recipeIngredient.filter(
                recipeIngredient => !selectedRecipes.includes(recipeIngredient.recipe.id)
            );
            setRecipeIngredients(updatedRecipes);
            setSelectedRecipes([]);
            setMultiSelect(false);
            setButtonVisibility(false);
            if (recipeSearchRef.current) {
                // uses handleCancel in recipeSearch
                recipeSearchRef.current.handleCancel();
            }
            onRecipeSelect(null);
        } catch (error) {
            console.error("Error deleting recipes:", error);
            alert("There was an error deleting the selected recipes.");
        }
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
            setRecipeIngredients(response);
        } catch (error) {
            console.error('Error fetching recipe ingredients:', error);
            // Optionally, you can handle errors (e.g., display a message to the user)
        }
    };
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="recipe-container">

            <RecipeSearch onSelect={handleSelectOption} searchRecipe={handleSearchRecipe} ref={recipeSearchRef} />
            <div className='recipeListContainer'>
                {searchRecipes.map((recipeIngredient, index) => (
                    <ListItem
                        key={index}
                        recipeIngredient={recipeIngredient}
                        multiSelect={multiSelect}
                        onCheckboxChange={handleCheckboxChange}
                        isChecked={selectedRecipes.includes(recipeIngredient.recipe.id)}
                        onClick={() => onRecipeSelect(recipeIngredient)}
                    />
                ))}
            </div>

            {buttonVisibility && (
                <div className="button-container">
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: 'red',
                            color: 'white',
                            borderRadius: '10px'
                        }}
                        onClick={handleDelete}>Delete</Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#6bb2f4',
                            color: 'white',
                            borderRadius: '10px'
                        }}
                        onClick={handleAddShoppingList}>Add to Shopping List</Button>
                </div>
            )}
        </div>
    );
}

export default RecipePanel;
