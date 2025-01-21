import React from 'react';
import './ListItem.css';
import Tag from '../Tag/Tag';

function ListItem({ title, tags, imgsrc }) {
    return (
        <div className="itemContainer">
            <img src={imgsrc} alt={title} className="itemImage" />
            <div className="contentContainer">
                <p className="itemTitle">{title}</p>
                <div className="tagsContainer">
                    {tags.map((tag, index) => (
                        <Tag key={index} text={tag} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ListItem;
