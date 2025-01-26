import React from 'react';
import './ListItem.css';
import Tag from '../Tag/Tag';
import {Recipe} from '../../Models/models'

function ListItem({ recipe }) {
    return (
        <div className="itemContainer">
            <img src={recipe.imageSrc} alt={recipe.title} className="itemImage" />
            <div className="contentContainer">
                <p className="itemTitle">{recipe.title}</p>
                <div className="tagsContainer">
                    {recipe.tags.map((tag, index) => (
                        <Tag key={index} text={tag} removable = {false} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ListItem;
