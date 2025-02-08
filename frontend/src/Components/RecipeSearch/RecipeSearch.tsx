

import { useState } from 'react';
import './RecipeSearch.css';
import { Chip } from '@mui/material';

import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import FilterPopup from '../FilterPopup/FilterPopup';
import { Recipe } from '../../Models/models'

function RecipeSearch() {
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState<boolean>(false);
    const [filterTags, setFilterTags] = useState([]);
    const [sliderRange, setSliderRange] = useState<number[]>([0, 10]); //replace 10 with max number

    const handleFilterClick = (event?: React.MouseEvent) => {
        event?.stopPropagation();
        setIsFilterPopupOpen((prev) => !prev);
    };

    const handleSliderChange = (event: Event, newRange: number | number[]) => {
        setSliderRange(newRange as number[]);
    };

    const sliderRangeToText = () => {
        return `${sliderRange[0]} - ${sliderRange[1]} mins`
    }

    const handleFilterChange = (newFilterTags: []) => {
        setFilterTags(newFilterTags);
    };

    const handleDelete = () => {
        console.info('You clicked the delete icon.');
    };


    return (
        <div>
            <div className="searchContainer">
                <div className="searchLeft">
                    <MoreHorizOutlinedIcon fontSize='large'></MoreHorizOutlinedIcon>
                </div>

                <div className="searchMiddle">
                    <input className="recipeInput"></input>
                </div>

                <div className="searchRight" onClick={() => handleFilterClick()}>
                    <FilterAltOutlinedIcon fontSize='large'></FilterAltOutlinedIcon>
                    {isFilterPopupOpen && (
                        <FilterPopup
                            selectedFilters={filterTags}
                            onClose={(e) => handleFilterClick(e)}
                            onFilterChange={handleFilterChange}
                            onSliderChange={handleSliderChange}
                            sliderRange={sliderRange}

                        />
                    )}
                </div>

            </div>
            <div className="filterTagContainer">
                <Chip 
                    label={sliderRangeToText()} 
                    variant="outlined" 
                    onDelete={handleDelete} 
                    sx={{
                        color: "#38793b", 
                        fontWeight: "bold",
                        border: "3px solid #38793b",
                        "& .MuiChip-deleteIcon": { color: "#38793b" },
                        "& .MuiChip-deleteIcon:hover": {
                            color: "#b0dbb2", 
                          },
                      }}
                />
            </div>
        </div>
    );
}

export default RecipeSearch;
