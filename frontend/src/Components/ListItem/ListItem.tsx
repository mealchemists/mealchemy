import React, { useEffect, useState } from 'react';
import './ListItem.css';

import { Chip, Tooltip } from '@mui/material';
import { Recipe, RecipeIngredient } from '../../Models/models'
import Checkbox from '@mui/material/Checkbox';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen'; // cook time
import FlatwareIcon from '@mui/icons-material/Flatware';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Avatar from "@mui/material/Avatar";
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import { WarningAmber as WarningIcon } from "@mui/icons-material";

interface ListItemProps {
    recipeIngredient: RecipeIngredient;
    multiSelect: boolean;
    onCheckboxChange: (recipeName: Number, isChecked: boolean) => void;
    onClick: any;
    isChecked: boolean;
}

const ListItem: React.FC<ListItemProps> = ({
    recipeIngredient,
    multiSelect = false,
    onCheckboxChange,
    onClick,
    isChecked = false
}) => {
    const recipe = recipeIngredient.recipe;
    const ingredients = recipeIngredient.ingredients;
    const [checked, setChecked] = useState(isChecked);
    const tags = [recipe.main_ingredient, recipe.cook_time, recipe.prep_time, recipe.total_time];
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setChecked(isChecked);
        onCheckboxChange(recipe.id, isChecked); // Notify parent
    };

    const checkNeedsReview = () => {
        console.log(recipeIngredient.needs_review)
        console.log(recipe.needs_review)
        console.log(ingredients)
        if (recipeIngredient.needs_review || recipe.needs_review || ingredients.some(item => item.needs_review)) {
            return true
        }
        return false
    }

    useEffect(() => {
        setChecked(isChecked);
    }, [isChecked]);

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
            <Avatar
                src={recipe.image_url}
                alt={recipe.name}
                variant = "square"
                sx={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "6rem",
                    backgroundColor: "#f0f0f0"
                }}
            >
                <DinnerDiningIcon sx={{ 
                    fontSize: "inherit",
                    color:'#38793b'
                    }}/>
            </Avatar>
            <div className="contentContainer">
                <p className="itemTitle" 
                    style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        maxWidth: "200px"  // Adjust as needed
                    }}>
                    {checkNeedsReview() && (
                        <Tooltip title="Needs Review" arrow>
                            <WarningIcon sx={{ color: "red", marginRight: "8px" }} />
                        </Tooltip>
                    )}
                    
                    <Tooltip title={recipe.name.length > 12 ? recipe.name : ""} arrow>
                        <span>{recipe.name.length > 12 ? `${recipe.name.substring(0, 12)}...` : recipe.name}</span>
                    </Tooltip>
                </p>
                <div className="tagsContainer">
                    {tags.map((tag: string, index: number) => {
                        let icon = null;
                        let tooltipLabel = "";

                        if (index === 1) {
                            icon = <SoupKitchenIcon />;
                            tooltipLabel = "Cook Time";
                        }
                        if (index === 2) {
                            icon = <FlatwareIcon />;
                            tooltipLabel = "Prep Time";
                        }
                        if (index === 3) {
                            icon = <HourglassBottomIcon />;
                            tooltipLabel = "Total Time";
                        }
                        return (
                            <Tooltip key={index} title={tooltipLabel} arrow disableHoverListener={!tooltipLabel}>
                                
                                <Chip
                                    label={tag && tag.length > 18 ? `${tag.substring(0, 18)}...` : tag || ""} 
                                    icon={icon}
                                    variant="outlined"
                                    sx={{
                                        color: "#38793b",
                                        backgroundColor: "#f8f8f8",
                                        fontWeight: "bold",
                                        border: "3px solid #38793b",
                                        "& .MuiChip-icon": {
                                            color: "#38793b",
                                        },
                                        textOverflow:"ellipses"
                                    }}
                                />
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default ListItem;
