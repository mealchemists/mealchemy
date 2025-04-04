import React, { useState, useEffect } from 'react';
import RecipePanel from '../RecipePanel/RecipePanel';
import RecipeContent from '../RecipeContent/RecipeContent';
import { Recipe, RecipeIngredient } from '../../Models/models';
import './RecipePage.css';
import { deleteRecipe } from '../../api/recipes';
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getRecipeIngredients } from '../../api/recipeIngredientApi';


function RecipePage() {
    const [selectedRecipeIngredient, setSelectedRecipeIngredient] = useState<RecipeIngredient | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [recipeIngredient, setRecipeIngredients] = useState<RecipeIngredient[]>([]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:800px)");

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSelectedRecipe = (recipe: RecipeIngredient) => {
        setSelectedRecipeIngredient(null); // Reset first
        setTimeout(() => {
            setSelectedRecipeIngredient(recipe); // Set the new selection
        }, 0);
    }


    const handleExitEditMode = () => {
        setEditMode(false);
    }

    const handleChangeRecipeMode = (changeEditMode) => {
        setEditMode(changeEditMode);
    }

    const handleDeleteRecipe = async (recipeToDelete: RecipeIngredient) => {
        // Delete the recipe from the list
        await deleteRecipe(recipeToDelete.recipe.id);
        setRecipeIngredients((prevRecipes) => {
            const updatedRecipes = prevRecipes.filter(recipe => recipe !== recipeToDelete);

            if (selectedRecipeIngredient === recipeToDelete) {
                setSelectedRecipeIngredient(null);
            }

            return updatedRecipes;
        });
    };

    const handleUpdateRecipe = (updatedRecipe: RecipeIngredient) => {
        setRecipeIngredients(prevRecipeIngredients => {
            // Check if the updatedRecipe already exists by id
            const existingRecipeIndex = prevRecipeIngredients.findIndex(recipeIngredient => recipeIngredient.id === updatedRecipe.id);

            if (existingRecipeIndex !== -1) {
                // If found, update the existing recipe ingredient
                const updatedRecipeIngredients = [...prevRecipeIngredients];
                updatedRecipeIngredients[existingRecipeIndex] = updatedRecipe;
                console.log("Updated recipe:", updatedRecipeIngredients);
                return updatedRecipeIngredients;
            } else {
                // If not found, add the new recipe ingredient
                const updatedRecipeIngredients = [...prevRecipeIngredients, updatedRecipe];
                console.log("Added new recipe:", updatedRecipeIngredients);
                return updatedRecipeIngredients;
            }
        });
    };

    const handleExtractor = async (recipeIngredients: RecipeIngredient[]) => {
        try {
            const response = await getRecipeIngredients();
            setRecipeIngredients(response);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        };
    }


    return (
        <div className="mainContainer">
            {isMobile && (
                <IconButton onClick={toggleSidebar} className="menuButton">
                    <MenuIcon fontSize="large" />
                </IconButton>
            )}

            {/* Sidebar for Desktop */}
            {!isMobile ? (
                <div className="sideContainer">
                    <RecipePanel
                        recipeIngredient={recipeIngredient}
                        recipeExtractor={handleExtractor}
                        setRecipeIngredients={setRecipeIngredients}
                        onRecipeSelect={handleSelectedRecipe}
                        setRecipeEditMode={handleChangeRecipeMode}
                    />
                </div>

            ) : (
                <Drawer anchor="left" open={isSidebarOpen} onClose={toggleSidebar}
                    slotProps={{
                        paper: {
                            sx: {
                                backgroundColor: '#f8f8f8' // Ensure it's a valid hex color
                            }
                        }
                    }}
                >
                    <div className="sideContainer">
                        <RecipePanel
                            recipeIngredient={recipeIngredient}
                            recipeExtractor={handleExtractor}
                            setRecipeIngredients={setRecipeIngredients}
                            onRecipeSelect={handleSelectedRecipe}
                            setRecipeEditMode={handleChangeRecipeMode}
                        />
                    </div>
                </Drawer>
            )}
            {!isMobile && (
                <div className="separator"></div>
            )}

            <div className="recipeContentContainer">
                {selectedRecipeIngredient ? (
                    <RecipeContent
                        recipeIngredient={selectedRecipeIngredient}
                        initialEditMode={editMode}
                        exitEditMode={handleExitEditMode}
                        onDeleteRecipe={handleDeleteRecipe}
                        onUpdateRecipe={handleUpdateRecipe}
                    />
                ) : (
                    <div style={{ textAlign: "center", marginTop: "20px", fontSize: "1.2rem" }}>
                        Create a recipe or select a recipe to start!
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecipePage;
