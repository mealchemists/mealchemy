import React, { useEffect, useRef, useState } from 'react';
import { Recipe } from '../../Models/models';
import './RecipeContent.css';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { Autocomplete, Box, Chip, FormControl, InputAdornment, Modal, OutlinedInput, TextField, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EditTagModal from '../EditTagModal/EditTagModal';

const options = [
    'Edit',
    'Delete'
];


const ITEM_HEIGHT = 48;
function RecipeContent({ recipe, initialEditMode = false, exitEditMode }) {

    // 3 dot menu, edit and delete options
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editMode, setEditMode] = useState(initialEditMode);

    // Edit Tag Modal
    const [openEditTagModal, setOpenEditTagModal] = useState(false);
    const handleOpenTagModal = () => setOpenEditTagModal(true);
    const handleCloseTagModal = () => setOpenEditTagModal(false);

    // For tags
    const [mainIngredient, setMainIngredient] = useState(recipe.mainIngredient);
    const [cookTime, setCookTime] = useState(recipe.cookTime);
    const [prepTime, setPrepTime] = useState(recipe.prepTime);
    const [totalTime, setTotalTime] = useState(recipe.totalTime);

    const [tags, setTags] = useState([mainIngredient, cookTime, prepTime, totalTime]);


    // For editing the actual recipe content
    const [title, setTitle] = useState(recipe.title);
    const [ingredients, setIngredients] = useState<string[]>(recipe.ingredients);
    const [instructions, setInstructions] = useState<string[]>(recipe.instructions);

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
        }
    };

    const handleApplyTagChanges = (tempMainIngredient, tempCookTime, tempPrepTime, tempTotalTime) => {
        setMainIngredient(tempMainIngredient);
        setCookTime(tempCookTime);
        setPrepTime(tempPrepTime);
        setTotalTime(tempTotalTime);
        handleCloseTagModal();

        // TODO: Update database
    }

    const handleSave = (newTitle = title, newIngredients = ingredients, newInstructions = instructions) => {
        setTitle(newTitle);
        setIngredients(newIngredients);
        setInstructions(newInstructions);
        console.log(newIngredients);
        setEditMode(false);
        exitEditMode();
        // TODO: Save to database
    };

    const handleIngredientChange = (index, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const handleInstructionChange = (index, value) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
    };

    return (
        <div className="recipeContent">
            <div className="buttonContainer">
                {editMode ? (
                    <button onClick={handleCancel} autoFocus>Cancel</button>
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
                    <button onClick={() => handleSave(title, ingredients, instructions)}>Save</button>
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
                open = {openEditTagModal}
                onClose = {handleCloseTagModal}
                ></EditTagModal>
            <div className="imgIngredients">
                <img src={recipe.imageSrc} alt={recipe.title} className="itemImage" />
                <div className="ingredientContainer">
                    <h2>Ingredients</h2>
                    {editMode ? (
                        <ul>
                            {ingredients.map((ingredient, index) => (
                                <li key={index}>
                                    <TextField
                                        value={ingredient}
                                        onChange={(e) => handleIngredientChange(index, e.target.value)}
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
                    ) : (
                        <ul>
                            {ingredients.map((ingredient) => (
                                <li key={ingredient}>{ingredient}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="instructionContainer">
                <h2>Instructions</h2>
                <div className="instructionContent">
                    {editMode ? (
                        <ul>
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
                    ) : (
                        <ul>
                            {instructions.map((instruction) => (
                                <li key={instruction}>{instruction}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RecipeContent;
