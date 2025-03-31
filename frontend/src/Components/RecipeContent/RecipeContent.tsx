import React, { useEffect, useRef, useState } from 'react';
import { Ingredient, Recipe, RecipeIngredient } from '../../Models/models';
import './RecipeContent.css';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { Button, Chip, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EditTagModal from '../EditTagModal/EditTagModal';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {deleteRecipeIngredients, putRecipeIngredients} from '../../api/recipeIngredientApi';



const options = [
    'Edit',
    'Delete'
];


const ITEM_HEIGHT = 48;


interface RecipeContentProps {
    recipeIngredient: RecipeIngredient;
    initialEditMode?: boolean;
    exitEditMode: () => void;
    onDeleteRecipe: (recipe: RecipeIngredient) => void; // Adjusted prop type
    onUpdateRecipe: (recipe: RecipeIngredient) => void; // Adjusted prop type
}

const RecipeContent: React.FC<RecipeContentProps> = ({ 
    recipeIngredient, 
    initialEditMode = false, 
    exitEditMode,
    onDeleteRecipe,
    onUpdateRecipe
}) => {
    const [recipe, setRecipe] = useState(recipeIngredient.recipe)
    // 3 dot menu, edit and delete options
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editMode, setEditMode] = useState(initialEditMode);

    // Edit Tag Modal
    const [openEditTagModal, setOpenEditTagModal] = useState(false);
    const handleOpenTagModal = () => setOpenEditTagModal(true);
    const handleCloseTagModal = () => setOpenEditTagModal(false);

    // Add Ingredient Modal
    const [openAddIngredientModal, setOpenAddIngredientModal] = useState(false);
    const handleOpenIngredientModal = () => setOpenAddIngredientModal(true);
    const handleCloseIngredientModal = () => setOpenAddIngredientModal(false);
    
    // For tags
    const [mainIngredient, setMainIngredient] = useState(String(recipe.main_ingredient));
    const [cookTime, setCookTime] = useState(String(recipe.cook_time));
    const [prepTime, setPrepTime] = useState(String(recipe.prep_time));
    const [totalTime, setTotalTime] = useState(String(recipe.total_time));

    const [tags, setTags] = useState([mainIngredient, cookTime, prepTime, totalTime]);
    const [error, setError] = useState("");

    const deleteRecipe = async (id) => {
         try {
            const response = await deleteRecipeIngredients(id);
            console.log(response)
            // Notify parent to delete the recipe from the list
            onDeleteRecipe(recipeIngredient);
        } catch (error) {
            setError("Error fetching recipes");
            console.error("Error fetching recipes:", error);
        }
    }

    const putRecipe = async(data: RecipeIngredient) => {
        try {

            const response = await putRecipeIngredients(data);
            console.log(response)
        } catch (error) {
            setError("Error fetching recipes");
            console.error("Error fetching recipes:", error);
        }
    }

    useEffect(() => {
        setTags([
            mainIngredient, 
            String(cookTime), 
            String(prepTime), 
            String(totalTime)
        ]);
    }, [mainIngredient, cookTime, prepTime, totalTime]);


    // For editing the actual recipe content
    const [title, setTitle] = useState(recipe.name);
    const [ingredients, setIngredients] = useState<Ingredient[]>(recipeIngredient.ingredients);
    const [instructions, setInstructions] = useState<string>(recipe.steps);

    const openOptions = Boolean(anchorEl);

    // Keep tags in sync with individual state variables
    useEffect(() => {
        setTags([mainIngredient, cookTime, prepTime, totalTime]);
    }, [mainIngredient, cookTime, prepTime, totalTime]);


    const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleOptionsClose = () => {
        setAnchorEl(null);
    };
    const handleCancel = () => {
        setEditMode(false);
        exitEditMode();
    }

    const handleOptionsSelect = (option: string) => {
        if (option === "Edit") {
            // make buttons visible
            setAnchorEl(null);
            setEditMode(true);
            handleOptionsClose();
        } else if (option == "Delete") {
            deleteRecipe(recipeIngredient.id);
            console.log(recipeIngredient.id)
        }
    };

    const handleApplyTagChanges = (
        tempMainIngredient: string, 
        tempCookTime: number, 
        tempPrepTime: number, 
        tempTotalTime: number
    ) => {
        setMainIngredient(tempMainIngredient);
        setCookTime(String(tempCookTime));
        setPrepTime(String(tempPrepTime));
        setTotalTime(String(tempTotalTime));
        
        // Create the updated recipe object with changes
        console.log(tempCookTime)
        const updatedRecipe = {
            ...recipeIngredient,
            recipe: {
                ...recipe,
                main_ingredient: tempMainIngredient,
                cook_time: Number(tempCookTime),
                prep_time: Number(tempPrepTime),
                total_time: Number(tempTotalTime)
            }
        };
        console.log(updatedRecipe);
        putRecipe(updatedRecipe);
        handleCloseTagModal();
    };

    const handleSave = (newTitle = title, newIngredients = ingredients, newInstructions = instructions) => {
        // const filteredIngredients = newIngredients.filter(ingredient => ingredient.trim() !== "");
        // const filteredInstructions = newInstructions.filter(instruction => instruction.trim() !== "");

        // setTitle(newTitle);
        // setIngredients(filteredIngredients);
        // setInstructions(filteredInstructions);
        // setEditMode(false);
        // exitEditMode();
        // TODO: Save to database
    };

    const handleIngredientChange = (index, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const handleAddIngredient = () => {
        // setIngredients([...ingredients, ""]); // Add an empty ingredient field

    };

    // const handleInstructionChange = (index, value) => {
    //     const newInstructions = [...instructions];
    //     newInstructions[index] = value;
    //     setInstructions(newInstructions);
    // };

    // const handleAddInstruction = () => {
    //     setInstructions([...instructions, ""]); // Add an empty ingredient field
    // };

    return (
        <div className="recipeContent">
            <div className="buttonContainer">
                {editMode ? (
                    <Button 
                    variant="contained" 
                    sx = {{
                        backgroundColor: '#d2d2d2',
                        borderRadius:'10px',
                        color:'black'
                    }} 
                    onClick={handleCancel} autoFocus>Cancel</Button>
                ) : (
                    <IconButton
                        aria-label="more"
                        id="long-button"
                        aria-controls={openOptions ? 'long-menu' : undefined}
                        aria-expanded={openOptions ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={handleOptionsClick}
                    >
                        <MoreHorizOutlinedIcon sx={{ color: "#38793b" }} />
                    </IconButton>
                )}

                <Menu
                    id="long-menu"
                    MenuListProps={{
                        'aria-labelledby': 'long-button',
                    }}
                    anchorEl={anchorEl}
                    open={openOptions}
                    onClose={handleOptionsClose}
                    slotProps={{
                        paper: {
                            style: {
                                maxHeight: ITEM_HEIGHT * 4.5,
                                width: '20ch',
                            },
                        },
                    }}
                    disableEnforceFocus
                >
                    {options.map((option) => (
                        <MenuItem key={option} onClick={() => handleOptionsSelect(option)}>
                            {option}
                        </MenuItem>
                    ))}
                </Menu>

                {editMode && (
                    <Button 
                    variant = "contained"
                    sx = {{
                        backgroundColor:'#6bb2f4',
                        color:'white',
                        borderRadius:'10px'
                    }}
                    onClick={() => handleSave(title, ingredients, instructions)}>Save</Button>
                )}

            </div>

            {editMode ? (
                <TextField
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    variant="outlined"
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            fontSize: "24px", // Match h1 size
                            fontWeight: "bold",
                            textAlign: "center"
                        },
                    }}
                />
            ) : (
                <h1>{title}</h1>
            )}
            <div className="tagContainer">
                <span className="tagLabel">Tags:</span>
                {tags.map((tag, index) => (
                    <Chip
                        key={index}
                        label={tag}
                        variant="outlined"
                        sx={{
                            color: "#38793b",
                            backgroundColor: "white",
                            fontWeight: "bold",
                            border: "3px solid #38793b",
                            "& .MuiChip-deleteIcon": { color: "#38793b" },
                            "& .MuiChip-deleteIcon:hover": {
                                color: "#b0dbb2",
                            },
                        }}
                    />
                ))}
                <IconButton onClick={handleOpenTagModal}>
                    <EditIcon
                        sx={{
                            color: "#38793b",
                        }} />
                </IconButton>

            </div>
            <EditTagModal
                mainIngredient={mainIngredient}
                cookTime={cookTime}
                prepTime={prepTime}
                onApplyTagChanges={handleApplyTagChanges}
                open={openEditTagModal}
                onClose={handleCloseTagModal}
            ></EditTagModal> 
            <div className="imgIngredients">
                <img src={recipe.imageSrc} alt={recipe.name} className="itemImage" />
                <div className="ingredientContainer">
                    <h2>Ingredients</h2>
                    {editMode ? (
                        <>
                            <ul>
                                {ingredients.map((ingredient, index) => (
                                    <li key={ingredient.name}> {/* Use id as the key */}
                                        <TextField
                                            value={ingredient.name}  // Display ingredient name
                                            onChange={(e) => handleIngredientChange(index, e.target.value)}  // Update ingredient name
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    fontSize: "14px",
                                                },
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <Button 
                            variant = "contained"
                            sx = {{
                                backgroundColor: '#b0dbb2',
                                color:'white',
                                borderRadius:'white'
                            }}
                            onClick={handleAddIngredient}>Add Ingredient</Button>
                        </>
                    ) : (
                        <ul>
                            {ingredients.map((ingredient) => (
                                <li key={ingredient.name}>{ingredient.name}</li> 
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="instructionContainer">
                <h2>Instructions</h2>
                <div className="instructionContent">
                    {editMode ? (
                        <>
                            {/* <ul>
                                {instructions.map((instruction, index) => (
                                    <li key={index}>
                                        <TextField
                                            value={instruction}
                                            onChange={(e) => handleInstructionChange(index, e.target.value)}
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    fontSize: "14px",
                                                    width: "100%",
                                                },
                                                "& .MuiInputBase-input": {
                                                    width: "350px",
                                                },
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <Button 
                            variant = "contained"
                            sx = {{
                            backgroundColor:'#b0dbb2',
                            color:'white',
                            borderRadius:'10px'
                            }}
                             onClick={handleAddInstruction}>Add Instruction</Button> */}

                        </>
                    ) : (
                       <ul>
                        {instructions.split('\n').map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                        ))}
                    </ul>
                    )}
                </div>
            </div>
        </div>
    );
    
}

export default RecipeContent;
