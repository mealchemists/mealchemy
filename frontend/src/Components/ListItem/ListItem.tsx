import React, { useState } from 'react';
import './ListItem.css';

import { Chip } from '@mui/material';
import { Recipe, RecipeIngredient } from '../../Models/models'
import Checkbox from '@mui/material/Checkbox';


interface ListItemProps {
    recipeIngredient: RecipeIngredient;
    multiSelect: boolean;
    onCheckboxChange: (recipeName: string, isChecked: boolean) => void;
    onClick: any;
}

const ListItem: React.FC<ListItemProps> = ({ 
    recipeIngredient, 
    multiSelect = false, 
    onCheckboxChange,
    onClick
}) => {
    const recipe = recipeIngredient.recipe;
    const [checked, setChecked] = useState(false);
    const tags = [recipe.main_ingredient, recipe.cook_time, recipe.prep_time, recipe.total_time];
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setChecked(isChecked);
        onCheckboxChange(recipe.name, isChecked); // Notify parent
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
            <img src={recipe.imageSrc} alt={recipe.name} className="itemImage" />
            <div className="contentContainer">
                <p className="itemTitle">{recipe.name}</p>
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
