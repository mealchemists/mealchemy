import React, { useEffect, useRef, useState } from 'react';
import { Recipe } from '../../Models/models';
import './RecipeContent.css';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const options = [
    'Edit',
    'Delete'
];

const ITEM_HEIGHT = 48;
function RecipeContent({ recipe }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editMode, setEditMode] = useState(false);
    const [showSaveButton, setShowSaveButton] = useState(false);

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
                    <button>Save</button>
                )}

            </div>

            <h1>{recipe.title}</h1>
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
                <IconButton>
                    <EditIcon
                        sx={{
                            color: "#38793b",
                        }} />
                </IconButton>
            </div>

            <div className="imgIngredients">
                <img src={recipe.imageSrc} alt={recipe.title} className="itemImage" />
                <div className="ingredientContainer">
                    <h2>Ingredients</h2>
                    <ul>
                        {recipe.ingredients.map((ingredient) => (
                            <li key={ingredient}>{ingredient}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="instructionContainer">
                <h2>Instructions</h2>
                <div className="instructionContent">
                    <ol>
                        {recipe.instructions.map((instruction) => (
                            <li key={instruction}>{instruction}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default RecipeContent;
