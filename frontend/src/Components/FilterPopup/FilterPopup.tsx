import React, { useState } from 'react';
import './FilterPopup.css';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Button, Chip } from '@mui/material';
import Slider from '@mui/material/Slider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

interface FilterPopupProps {
  onClose: (e: React.MouseEvent) => void;
  onFilterChange: (selectedFilters: string[], sortBy: string, sliderRange: number[], mainIngredient: string) => void;
  sortBy: string;
  sliderRange: number[];
  mainIngredientList: string[]; // Ensure this is an array of strings
}

function valuetext(range: number) {
  return `${range}mins`;
}

export default function FilterPopup({ onClose, onFilterChange, sortBy: initialSortBy, sliderRange: initialSliderRange, mainIngredientList }: FilterPopupProps) {
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [sliderRange, setSliderRange] = useState<number[]>([0, 10]);
  const [sliderValue, setSliderValue] = useState<number[]>([]);
  const [selectedMainIngredient, setSelectedMainIngredient] = useState<string>(''); // This should be a single string

  const applyFilters = (e: React.MouseEvent) => {
    const filters: string[] = [];

    if (sortBy) filters.push(`Sort By: ${sortBy === "recipe__name" ? "Alphabetical (A-Z)" : "Cooking Time"}`);
    if (sliderRange) filters.push(`Cooking Time: ${sliderRangeToText()}`);
    if (selectedMainIngredient) filters.push(`Main Ingredient: ${selectedMainIngredient}`);

    onFilterChange(filters, sortBy, sliderRange, selectedMainIngredient);

    onClose(e);
  };

  const onSliderChange = (event: Event, newRange: number | number[]) => {
    const updatedRange = newRange as number[];
    setSliderRange(updatedRange);
    setSliderValue(updatedRange);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy(event.target.value);
  };

  const sliderRangeToText = () => {
    return `${sliderRange[0]} - ${sliderRange[1]} mins`;
  };

  const resetFilters = () => {
    setSortBy("");
    setSliderValue([]);
    setSelectedMainIngredient('');
    onFilterChange([], "", sliderValue, selectedMainIngredient);
  };

  return (
    <div className="filterPopup" onClick={(e) => e.stopPropagation()}>
      <div className="popupContent">
        <div className="xContainer">
          <a onClick={onClose}><CloseIcon /></a>
        </div>
        <br />
        <div className="popupTitleContainer">
          <h3>Filters</h3>
        </div>

        <div className="popupContentContainer">
          <p>Sort By</p>
          <div className="radioContainer">
            <FormControl sx={{
              width: "90%",
              margin: "0 auto",
            }}>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={sortBy}
                onChange={handleSortChange}
              >
                <FormControlLabel
                  value="recipe__name"
                  control={<Radio size="small"
                    sx={{
                      color: "#b0dbb2",
                      '&.Mui-checked': {
                        color: "#38793b"
                      }
                    }} />}
                  label="Alphabetical (A-Z)"
                  sx={{
                    "& .MuiRadio-root": { padding: "3px" },
                    "& .MuiTypography-root": { fontSize: "0.9rem" },
                  }}
                />
                <FormControlLabel
                  value="recipe__cook_time"
                  control={<Radio size="small"
                    sx={{
                      color: "#b0dbb2",
                      '&.Mui-checked': {
                        color: "#38793b"
                      }
                    }} />}
                  label="Cooking Time"
                  sx={{
                    "& .MuiRadio-root": { padding: "3px" },
                    "& .MuiTypography-root": { fontSize: "0.9rem" },
                  }}
                />
              </RadioGroup>
            </FormControl>
          </div>

          <p>Cooking Time</p>
          <div className="sliderContainer">
            <Slider
              getAriaLabel={() => 'Temperature range'}
              value={sliderRange}
              onChange={onSliderChange}
              valueLabelDisplay="auto"
              getAriaValueText={valuetext}
              disableSwap
              step={10}
              sx={{
                color: "#38793b",
                width: "90%",
                margin: "0 auto",
                '& .MuiSlider-thumb': { backgroundColor: "#38793b" },
                '& .MuiSlider-track': { backgroundColor: "#38793b" },
                '& .MuiSlider-rail': { backgroundColor: "#b0dbb2" },
              }}
            />
          </div>

          <p>Main Ingredient</p>
          <Autocomplete
            id="tags-outlined"
            options={mainIngredientList}  // No need to map, it's already a string array
            value={selectedMainIngredient}  // Single value
            onChange={(event, newValue) => setSelectedMainIngredient(newValue || '')} // Handle single value
            renderInput={(params) => (
              <TextField {...params} label="Select Main Ingredient" placeholder="Search..." />
            )}
          />
        </div>

        <div className="buttonContainer">
          <Button onClick={applyFilters} variant="contained" sx={{ marginTop: 2 }}>Apply Filters</Button>
          <Button onClick={resetFilters} variant="outlined" sx={{ marginTop: 2 }}>Reset Filters</Button>
        </div>
      </div>
    </div>
  );
}
