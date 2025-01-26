// const handleRemoveFilter = (tag) => {
//     setFilterTags((prevTags) => {
//       const newTags = { ...prevTags };
//       if (newTags[type]) {
//         newTags[type] = newTags[type].filter((t) => t !== tag);
//         handleSearchSubmit(newTags);
//       }
//       return newTags;
//     });
//   };

import { useState } from 'react';
import './RecipeSearch.css';
import Tag from '../Tag/Tag';
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

    const sliderRangeToText = () =>{
        return `${sliderRange[0]} - ${sliderRange[1]} mins`
    }

    const handleFilterChange = (newFilterTags: []) => {
        setFilterTags(newFilterTags);
    };

    const handleRemoveFilter = (text:string)=>{
        setFilterTags((prevTags) => prevTags.filter((t) => t !== text));
    }

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
                <Tag text = {sliderRangeToText()} removable = {false}></Tag>
            </div>
        </div>
    );
}

export default RecipeSearch;
