import React from 'react';
import ListItem from '../ListItem/ListItem';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import Tag from '../Tag/Tag';

function RecipePanel({ recipes, filterTags = [] }) {
    return (
        <div>
            {recipes.map((recipe, index) => (
                <ListItem key={index} recipe={recipe} />
            ))}
        </div>
    )
}

export default RecipePanel;
