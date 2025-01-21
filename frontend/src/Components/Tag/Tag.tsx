import React from 'react';
import './Tag.css';

function Tag({text}) {
  return (
    <div className="tag"><p>{text}</p></div>
  );
}

export default Tag;
