import { useState, useRef, useEffect } from 'react';
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
import { Add } from '@mui/icons-material';

const options = [
    'Select',
    'Add Manually',
    'Add by URL',
    'Add by PDF'
];

const ITEM_HEIGHT = 48;

interface RecipeSearchProps {
    onSelect: (option: string) => void,
}

function RecipeSearch({ onSelect }: RecipeSearchProps) {
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState<boolean>(false);
    const [filterChips, setFilterChips] = useState([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [sortBy, setSortBy] = useState<string>("alpha");
    const [sliderRange, setSliderRange] = useState<number[]>([0, 10]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showCancelButton, setShowCancelButton] = useState(false);

    const [openAddRecipeModal, setOpenAddRecipeModal] = useState(false);
    const handleOpenAddRecipeModal = () => setOpenAddRecipeModal(true);
    const handleCloseAddRecipeModal = () => setOpenAddRecipeModal(false);
    const [addRecipeFormat, setAddRecipeFormat] = useState<number>(null);
    const openOptions = Boolean(anchorEl);

    const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleOptionsClose = () => {
        setAnchorEl(null);
    };

    const handleCancel = () => {
        onSelect("");
        setShowCancelButton(false);
    };

    const handleOptionsSelect = (option: string) => {
        if (option === "Select") {
            // make buttons visible
            setAnchorEl(null);
            onSelect(option);
            setShowCancelButton(true);
            handleOptionsClose();
        } else if (option === "Add Manually") {
            onSelect(option);
        } else if (option === "Add by URL") {
            setAddRecipeFormat(0);
            handleOpenAddRecipeModal()

        } else if (option === "Add by PDF") {
            setAddRecipeFormat(1);
            handleOpenAddRecipeModal();

        }
    };

    const handleAddRecipe = (recipe:Recipe) => {
        handleCloseAddRecipeModal();
    }
    const handleFilterClick = (event?: React.MouseEvent) => {
        event?.stopPropagation();
        setIsFilterPopupOpen((prev) => !prev);
    };

    const handleFilterChange = (filters: string[], sort: string, range: number[], tags: string[]) => {
        setFilterChips(filters);

        setSortBy(sort);
        setSliderRange(range);
        setSelectedTags(tags);

        // TODO: Filter the recipes here
    };


    return (
        <div>
            <div className="searchContainer">
                <div className="searchLeft">
                    {showCancelButton ? (
                        <button onClick={handleCancel} autoFocus>Cancel</button>
                    ) : (
                        <IconButton
                            aria-label="more"
                            id="long-button"
                            aria-controls={openOptions ? 'long-menu' : undefined}
                            aria-expanded={openOptions ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={handleOptionsClick}
                        >
                            <MoreHorizOutlinedIcon sx={{ color: "#38793b" }} />
                        </IconButton>
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
                    <input className="recipeInput"></input>
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
                            onClose={(e) => handleFilterClick(e)}
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
            >
            </AddRecipeModal>
        </div>
    );
}

export default RecipeSearch;
