import React, { useEffect, useRef, useState } from 'react';
import { Recipe } from '../../Models/models';
import './RecipeContent.css';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { Autocomplete, Box, Chip, FormControl, InputAdornment, Modal, OutlinedInput, TextField, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const options = [
    'Edit',
    'Delete'
];

const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 },
    { title: "Schindler's List", year: 1993 },
    { title: 'Pulp Fiction', year: 1994 },
    {
        title: 'The Lord of the Rings: The Return of the King',
        year: 2003,
    }
]
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


const ITEM_HEIGHT = 48;
function RecipeContent({ recipe }) {

    // 3 dot menu, edit and delete options
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editMode, setEditMode] = useState(false);

    // Edit Tag Modal
    const [openEditTagModal, setOpenEditTagModal] = useState(false);
    const handleOpenTagModal = () => setOpenEditTagModal(true);
    const handleCloseTagModal = () => setOpenEditTagModal(false);

    // Edit Tag Modal seleted tag
    const [selectedTag, setSelectedTag] = useState("")

    // For editing the actual recipe content
    const [title, setTitle] = useState(recipe.title);
    const [ingredients, setIngredients] = useState<string[]>(recipe.ingredients);
    const [instructions, setInstructions] = useState<string[]>(recipe.instructions);

    const openOptions = Boolean(anchorEl);

    const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleOptionsClose = () => {
        setAnchorEl(null);
    };
    const handleCancel = () => {
        setEditMode(false);
    }

    const handleOptionsSelect = (option: string) => {
        if (option === "Edit") {
            // make buttons visible
            setAnchorEl(null);
            setEditMode(true);
            handleOptionsClose();
        }
    };

    const handleSave = (newTitle = title, newIngredients = ingredients, newInstructions = instructions) => {
        setTitle(newTitle);
        setIngredients(newIngredients);
        setInstructions(newInstructions);
        console.log(newIngredients);
        setEditMode(false);

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
                            textAlign:"center"
                        },
                    }}
                />
            ) : (
                <h1>{title}</h1>
            )}
            <div className="tagContainer">
                <span className="tagLabel">Tags:</span>
                {recipe.tags.map((tag) => (
                    <Chip
                        key={tag}
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
                <Modal
                    open={openEditTagModal}
                    onClose={handleCloseTagModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <div>
                            <h3>
                                Edit Tags
                            </h3>
                            <div className="editModalContentContainer">
                                {/* Key Ingredient */}
                                <div className="editModalInputRow">
                                    <label>Key Ingredient:</label>
                                    <Autocomplete
                                        id="tags-outlined"
                                        options={top100Films.map((option) => option.title)}
                                        value={selectedTag}
                                        onChange={(event, newValue) => setSelectedTag(newValue)}
                                        freeSolo
                                        renderTags={() => null}
                                        renderInput={(params) => (
                                            <TextField
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        height: "40px",
                                                        width: "150px",
                                                        border: "2px solid #b0dbb2",
                                                        borderRadius: "10px",
                                                        "& fieldset": { border: "none" },
                                                        "&:hover fieldset": { border: "none" },
                                                        "&.Mui-focused fieldset": { border: "none" },
                                                        padding: "5px",
                                                    },
                                                }}
                                                {...params}
                                            />
                                        )}
                                    />
                                    <button style={{ height: "40px" }}>Add</button>
                                </div>

                                {/* Cook Time */}
                                <div className="editModalInputRow">
                                    <label>Cook Time:</label>
                                    <TextField
                                        sx={{
                                            width: "15ch",
                                            "& .MuiOutlinedInput-root": {
                                                height: "40px",
                                                "& input": { height: "100%", padding: "10px" },
                                            },
                                        }}
                                        slotProps={{
                                            input: {
                                                endAdornment: <InputAdornment position="end">min(s)</InputAdornment>,
                                            },
                                        }}
                                    />
                                </div>

                                {/* Preparation Time */}
                                <div className="editModalInputRow">
                                    <label>Preparation Time:</label>
                                    <TextField
                                        sx={{
                                            width: "15ch",
                                            "& .MuiOutlinedInput-root": {
                                                height: "40px",
                                                "& input": { height: "100%", padding: "10px" },
                                            },
                                        }}
                                        slotProps={{
                                            input: {
                                                endAdornment: <InputAdornment position="end">min(s)</InputAdornment>,
                                            },
                                        }}
                                    />
                                </div>

                                {/* Total Time */}
                                <div className="editModalInputRow">
                                    <label>Total Time:</label>
                                    <TextField
                                        disabled
                                        type="number"
                                        sx={{
                                            width: "15ch",
                                            "& .MuiOutlinedInput-root": {
                                                height: "40px",
                                                "& input": { height: "100%", padding: "10px" },
                                            },
                                        }}
                                        slotProps={{
                                            input: {
                                                endAdornment: <InputAdornment position="end" sx={{ fontSize: "20px" }}>min(s)</InputAdornment>,
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button>Done</button>
                    </Box>
                </Modal>
            </div>

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
