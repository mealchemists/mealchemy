import React, { useState } from 'react';
import './GridItem.css';
import { Recipe } from '../../Models/models';
import { Chip, Tooltip } from '@mui/material';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen'; // cook time
import FlatwareIcon from '@mui/icons-material/Flatware';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';


function GridItem({ recipe }: { recipe: Recipe }) {
  const tags = [recipe.main_ingredient, recipe.cook_time, recipe.prep_time, recipe.total_time];

  return (
    <div className="gridItemContainer">
      <div className="contentContainer">
        <h3 className="gridItemTitle">{recipe.name}</h3>
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
                   label={tag && tag.length > 20 ? `${tag.substring(0, 20)}...` : tag || ""} 
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
                  }}
                />
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>

  )
}

export default GridItem;
