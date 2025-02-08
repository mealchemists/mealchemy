import React from 'react';
import './ListItem.css';

import { Chip } from '@mui/material';
import {Recipe} from '../../Models/models'

function ListItem({ recipe }) {
    return (
        <div className="itemContainer">
            <img src={recipe.imageSrc} alt={recipe.title} className="itemImage" />
            <div className="contentContainer">
                <p className="itemTitle">{recipe.title}</p>
                <div className="tagsContainer">
                    {recipe.tags.map((tag: string, index:number) => (
                         <Chip 
                         key = {index}
                         label={tag} 
                         variant="outlined" 
                         sx={{
                             color: "#38793b", 
                             backgroundColor:"#f8f8f8",
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
