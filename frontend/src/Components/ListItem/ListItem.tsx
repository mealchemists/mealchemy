import React, { useState } from 'react';
import './ListItem.css';

import { Chip } from '@mui/material';
import { Recipe } from '../../Models/models'
import Checkbox from '@mui/material/Checkbox';

function ListItem({ recipe, multiSelect, onCheckboxChange, onClick}) {
    const [checked, setChecked] = useState(false);
    const tags = [recipe.mainIngredient, recipe.cookTime, recipe.prepTime, recipe.totalTime];
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setChecked(isChecked);
        onCheckboxChange(recipe.title, isChecked); // Notify parent
    };

    return (
        <div className="itemContainer" onClick={onClick}>
            {multiSelect && (
                <Checkbox
                    sx={{
                        color: "#38793b",
                        '&.Mui-checked': {
                            color: "#38793b",
                        },
                    }}
                    checked={checked}
                    onChange={handleChange} 
                />
            )
            }
            <img src={recipe.imageSrc} alt={recipe.title} className="itemImage" />
            <div className="contentContainer">
                <p className="itemTitle">{recipe.title}</p>
                <div className="tagsContainer">
                    {tags.map((tag: string, index: number) => (
                        <Chip
                            key={index}
                            label={tag}
                            variant="outlined"
                            sx={{
                                color: "#38793b",
                                backgroundColor: "#f8f8f8",
                                fontWeight: "bold",
                                border: "3px solid #38793b",

                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ListItem;
