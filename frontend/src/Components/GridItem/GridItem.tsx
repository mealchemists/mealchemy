import React, { useState } from 'react';
import './GridItem.css';
import { Recipe } from '../../Models/models';
import { Chip } from '@mui/material';


function GridItem({ recipe }: { recipe: Recipe }) {
    const tags = [recipe.main_ingredient, recipe.cook_time, recipe.prep_time, recipe.total_time];

    return (
        <div className="gridItemContainer">
        <div className="contentContainer">
          <h3 className="gridItemTitle">{}</h3>
          <img src={recipe.imageSrc} alt={recipe.name} className="gridItemImage" />
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
      
    )
}

export default GridItem;
