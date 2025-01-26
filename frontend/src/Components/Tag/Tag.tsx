import React from 'react';
import './Tag.css';
import CloseIcon from '@mui/icons-material/Close';

interface TagProps{
  text:string;
  onRemove?: () => void;
  removable:boolean;
}

function Tag({text, onRemove, removable }: TagProps) {
  return (
    <div className="tag">
      <p>{text}</p>
      {removable && (
          <span className="removeTag" onClick={() => onRemove()}>
              <CloseIcon/>
          </span>
        )}
      </div>
  );
}

export default Tag;
