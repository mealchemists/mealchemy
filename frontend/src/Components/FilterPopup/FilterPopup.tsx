import React, { useEffect, useState } from 'react';
import './FilterPopup.css';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

import Slider from '@mui/material/Slider';

interface FilterPopupProps {
  onClose?: (e: React.MouseEvent) => void;
  onFilterChange?: (selectedFilters: string[]) => void;
  selectedFilters: string[];
  sliderRange: number[]; 
  onSliderChange: (event: Event, newValue: number | number[]) => void; 
}

function valuetext(range: number) {
  return `${range}mins`;
}


export default function FilterPopup({ onClose, onFilterChange, selectedFilters,sliderRange, onSliderChange }: FilterPopupProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTags, setFilterTags] = useState<string[]>(selectedFilters);



  const applyFilters = (e:React.MouseEvent) => {
    // Pass the selected filters to a parent component or do something with them
    onFilterChange(filterTags);

    // Close the popup
    onClose(e);
  };

  const handleFilterChange = (value: string) => {
    setFilterTags((prevFilters) => {
      if (prevFilters.includes(value)) {
        // Remove the filter if it's already selected
        return prevFilters.filter((item) => item !== value);
      } else {
        // Add the filter if it's not already selected
        return [...prevFilters, value];
      }
    });
  };

  const resetFilters = () => {
    setFilterTags([]);
  };


  return (
    <div className="filterPopup" onClick={(e) => e.stopPropagation()}>
      <div className="popupContent">
        <div className="xContainer">
          <a onClick={onClose}><CloseIcon /></a>
        </div>
        <br></br>
        <div className="popupTitleContainer">
          <h3>
            Filters
          </h3>
        </div>

        <div className="popupContentContainer">
          <p>Cooking Time</p>
            <Slider
              getAriaLabel={() => 'Temperature range'}
              value={sliderRange}
              onChange={onSliderChange}
              valueLabelDisplay="auto"
              getAriaValueText={valuetext}
              disableSwap
              step={10}
              sx={{
                color: "#38793b", // Change track & thumb color
                '& .MuiSlider-thumb': { backgroundColor: "#38793b" }, // Thumb color
                '& .MuiSlider-track': { backgroundColor: "#38793b" }, // Track color
                '& .MuiSlider-rail': { backgroundColor: "#b0dbb2" }, // Rail (inactive track)
              }}
            />

          <p>Tags</p>
              
              
        </div>

        <div className="popupButtonContainer">
          <div className="popupFirst">
            <button className="reset-button" onClick={resetFilters}>
              Reset
            </button>
          </div>
          <div className="popupMiddle"></div>
          <div className="popupLast">
            <button className="apply-button" onClick={applyFilters}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}