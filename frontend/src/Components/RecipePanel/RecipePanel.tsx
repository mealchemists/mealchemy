import React, { useEffect, useRef, useState } from 'react';
import ListItem from '../ListItem/ListItem';
import RecipeSearch from '../RecipeSearch/RecipeSearch';
import { Recipe, RecipeIngredient, Ingredient, RecipeStep, FilterObject } from '../../Models/models';
import './RecipePanel.css';
import { getRecipeIngredients } from '../../api/recipeIngredientApi';
import { handleFilterApply } from '../../utils/filter';
import Button from '@mui/material/Button';
import { deleteRecipe } from '../../api/recipes';
import { addToShoppingList } from '../../api/shoppingList';
import { useAuth } from '../../api/useAuth';
import { toast } from 'react-toastify';
import { needsReview } from '../../utils/review';
interface RecipePanelProps {
    recipeIngredient: RecipeIngredient[];
    setRecipeIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>; // Set recipe list from parent
    onRecipeSelect: (recipe: RecipeIngredient) => void;
    setRecipeEditMode: (editMode: boolean) => void;
    recipeExtractor: (recipe: RecipeIngredient[]) => void
}

const blankStep: RecipeStep = {
    id: -1,
    step_number: 1,
    description: "",
    recipe: -1
}

const blankRecipe: Recipe = {
    id: -1,
    name: "",
    cook_time: 0,
    prep_time: 0,
    total_time: 0,
    main_ingredient: "Main Ingredient",
    ingredients: [],
    steps: [blankStep],
    image_url: "",
};

const blankRecipeIngredient: RecipeIngredient = {
    id: -1,
    recipe: blankRecipe,
    ingredients: [] as Ingredient[],
    added_by_extractor: false
};


const RecipePanel: React.FC<RecipePanelProps> = ({
    recipeIngredient,
    setRecipeIngredients,
    onRecipeSelect,
    setRecipeEditMode,
    recipeExtractor
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

    const filterApply = (filterObj: FilterObject) => {
        handleFilterApply(filterObj, setRecipeIngredients);
    }


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

    const { isAuthenticated, username, user_id } = useAuth();

    const handleAddShoppingList = async () => {
        console.log(selectedRecipes)
        const selectedRecipeIngredients = recipeIngredient.filter((ri) => selectedRecipes.includes(ri.recipe.id));
        console.log(selectedRecipeIngredients)
        // Loop through each selectedRecipeIngredient and check needsReview
        for (const ri of selectedRecipeIngredients) {
            if (needsReview(ri)) {
                toast.error("Cannot add malformed recipes to shopping list");
                return; 
            }
        }
        addToShoppingList(selectedRecipes, user_id);
        setMultiSelect(false);
        setButtonVisibility(false);
        toast.success('Added to Shopping List!');
    };

    useEffect(() => {
        setSearchRecipes(recipeIngredient);
    }, [recipeIngredient]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="recipe-container">
            <RecipeSearch
                onSelect={handleSelectOption}
                recipeExtractor={recipeExtractor}
                applyFiltering={filterApply}
                recipeIngredientsList={recipeIngredient}
                mainIngredientList={allRecipeIngredients
                    .filter(recipeIngredient => recipeIngredient.recipe.main_ingredient)  // Filter based on `main_ingredient`
                    .map(recipeIngredient => recipeIngredient.recipe.main_ingredient)}
                ref={recipeSearchRef} />
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
                            borderRadius: '10px',
                            marginRight:'3px'

                        }}
                        onClick={handleAddShoppingList}
                        disabled={selectedRecipes.length == 0}>Add to Shopping List</Button>
                </div>
            )}
        </div>
    );
}

export default RecipePanel;
