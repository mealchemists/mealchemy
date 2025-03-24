import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './RecipeSearch.css';
import AddRecipeModal from '../AddRecipeModal/AddRecipeModal';
import { Chip, Icon } from '@mui/material';

import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import FilterPopup from '../FilterPopup/FilterPopup';
import { Recipe } from '../../Models/models'

import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import { Add, Filter } from '@mui/icons-material';
import Button from '@mui/material/Button';

const options = [
    'Select',
    'Add Manually',
    'Add by URL',
    'Add by PDF'
];

const ITEM_HEIGHT = 48;

interface RecipeSearchProps {
    onSelect?: (value: string) => void;
    applyFiltering: (filterObj: object) => void;
}

export interface RecipeSearchRef {
    handleCancel: () => void;
  }
  

const RecipeSearch = forwardRef<RecipeSearchRef,RecipeSearchProps>(({ onSelect, applyFiltering }, ref) => {
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState<boolean>(false);
    const [filterChips, setFilterChips] = useState([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showCancelButton, setShowCancelButton] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [openAddRecipeModal, setOpenAddRecipeModal] = useState(false);
    const handleOpenAddRecipeModal = () => setOpenAddRecipeModal(true);
    const handleCloseAddRecipeModal = () => setOpenAddRecipeModal(false);
    const [addRecipeFormat, setAddRecipeFormat] = useState<number>(null);
    const openOptions = Boolean(anchorEl);


    // SortBY
    const [sortBy, setSortBy] = useState<string>("");

    // Filter
    const [sliderRange, setSliderRange] = useState<number[]>([0, 10]);


    const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleOptionsClose = () => {
        setAnchorEl(null);
    };

    // so that the parent can also use it
    useImperativeHandle(ref, () => ({
        handleCancel() {
          onSelect(""); // Call onSelect with empty string
          setShowCancelButton(false);
        }
      }));

    const handleCancel = () => {
        onSelect("");
        setShowCancelButton(false);
    };

    // Handle filters when the user applies them
    const handleFilterChange = (filters: string[], sort: string, range: number[], tags: string[]) => {
        setFilterChips(filters);
        setSortBy(sort);
        setSliderRange(range);
        setSelectedTags(tags);

        // Send the filter data back to the parent component
        applyFiltering({
            searchQuery,
            filters,
            sortBy: sort,
            range,
            tags
        });
    };

    const handleFilterClick = () => {
        setIsFilterPopupOpen((prev) => !prev);
    };


    const handleOptionsSelect = (option: string) => {
        if (option === "Select") {
            // make buttons visible
            setAnchorEl(null);
            onSelect(option);
            setShowCancelButton(true);
            handleOptionsClose();
        } else if (option === "Add Manually") {
            setAnchorEl(null);
            handleOptionsClose();
            onSelect(option);

        } else if (option === "Add by URL") {
            setAnchorEl(null);
            handleOptionsClose();
            setAddRecipeFormat(0);
            handleOpenAddRecipeModal();
        } else if (option === "Add by PDF") {
            setAnchorEl(null);
            handleOptionsClose();
            setAddRecipeFormat(1);
            handleOpenAddRecipeModal();
        }
    };

    const handleAddRecipe = (recipe:Recipe) => {
        handleCloseAddRecipeModal();
    }

    const onSearchRecipe = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearchQuery(query);

        // Send both search query and filter data to the parent whenever the search query changes
        applyFiltering({
            searchQuery: query,
            filters: filterChips,
            sortBy,
            range: sliderRange,
            tags: selectedTags
        });
    }

    return (
        <div>
            <div className="searchContainer">
                <div className="searchLeft">
                    {showCancelButton ? (
                        <Button 
                        variant="contained" 
                        sx = {{
                            backgroundColor: '#d2d2d2',
                            borderRadius:'10px',
                            color:'black'
                        }} 
                        onClick={handleCancel} autoFocus>Cancel</Button>
                    ) : (

                        onSelect &&
                        (<IconButton
                            aria-label="more"
                            id="long-button"
                            aria-controls={openOptions ? 'long-menu' : undefined}
                            aria-expanded={openOptions ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={handleOptionsClick}
                        >
                            <MoreHorizOutlinedIcon sx={{ color: "#38793b" }} />
                        </IconButton>)
                    )}

                        
                    <Menu
                        id="long-menu"
                        MenuListProps={{
                            'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorEl}
                        open={openOptions}
                        onClose={handleOptionsClose}
                        slotProps={{
                            paper: {
                                style: {
                                    maxHeight: ITEM_HEIGHT * 4.5,
                                    width: '20ch',
                                },
                            },
                        }}
                        disableEnforceFocus
                    >
                        {options.map((option) => (
                            <MenuItem key={option} onClick={() => handleOptionsSelect(option)}>
                                {option}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>

                <div className="searchMiddle">
                    <input className="recipeInput" onChange = {onSearchRecipe}></input>
                </div>

                <div className="searchRight" onClick={() => handleFilterClick()}>
                    <IconButton>
                        <FilterAltOutlinedIcon
                            fontSize='large'
                            sx={{
                                color: "#38793b",
                            }}
                        ></FilterAltOutlinedIcon>
                    </IconButton>
                    {isFilterPopupOpen && (
                        <FilterPopup
                            onClose={() => setIsFilterPopupOpen(false)}
                            onFilterChange={handleFilterChange}
                            sortBy={sortBy}
                            sliderRange={sliderRange}
                            selectedTags={selectedTags}
                        />
                    )}
                </div>

            </div>
            <div className="filterTagContainer">
                {filterChips.map((filter) => (
                    <Chip
                        key={filter}
                        label={filter}
                        variant="outlined"
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
                ))}

            </div>

            <AddRecipeModal 
                addRecipeFormat={addRecipeFormat}  
                open = {openAddRecipeModal}
                onClose = {handleCloseAddRecipeModal}
                onAddRecipe={handleAddRecipe}
            />
        </div>
    );
});

export default RecipeSearch;
