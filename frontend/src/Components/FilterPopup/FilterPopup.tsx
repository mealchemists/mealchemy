import React, { useEffect, useState } from 'react';
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
import { getRecipeIngredients } from '../../api/recipeIngredientApi';

interface FilterPopupProps {
  onClose: (e: React.MouseEvent) => void;
  onFilterChange: (selectedFilters: string[], sortBy: string, sliderRange: number[], mainIngredient: string) => void;
  sortBy: string;
  sliderRange: number[];
}

function valuetext(range: number) {
  return `${range}mins`;
}

// FR23 - Recipe.Filter
export default function FilterPopup({ onClose, onFilterChange, sortBy: initialSortBy, sliderRange: initialSliderRange }: FilterPopupProps) {
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [sliderRange, setSliderRange] = useState<number[]>([0, 10]);
  const [sliderValue, setSliderValue] = useState<number[]>([]);
  const [selectedMainIngredient, setSelectedMainIngredient] = useState<string>(''); // This should be a single string
  const [mainIngredientList, setMainIngredientList] = useState([]);

  useEffect(()=>{
    const getMainIngredientList = async() => {
      const response = await getRecipeIngredients();
      const mainIngredients = Array.from(
        new Set(response.map((item: any) => item.recipe.main_ingredient))
      );

      setMainIngredientList(mainIngredients);
      }
    
    getMainIngredientList();
  })
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
            options={mainIngredientList}
            value={selectedMainIngredient}
            onChange={(event, newValue) => setSelectedMainIngredient(newValue || '')} // Handle single value
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'zIndex',
                    enabled: true,
                    phase: 'beforeWrite',
                    fn: ({ state }) => {
                      state.styles.popper.zIndex = '2000';
                    },
                  },
                ],
                sx: {
                  zIndex: 2000, // fallback for basic control
                },
              },
            }}
            renderInput={(params) => (
              <TextField {...params}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "50px",
                    width: "100%",
                    border: "2px solid #b0dbb2",
                    borderRadius: "10px",
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                    padding: "5px",
                  },
                }}
                placeholder="Search..." />
            )}
          />
        </div>

        <div className="popupButtonContainer">
          <Button onClick={applyFilters} variant="contained" sx={{
            backgroundColor: '#6bb2f4',
            color: 'white',
            borderRadius: '10px',
            padding: '10px',
            marginTop: 2,
          }}>Apply Filters</Button>
          <Button onClick={resetFilters} variant="outlined" sx={{
            marginTop: 2, color: '#6bb2f4',
            borderRadius: '10px',
            padding: '10px',
          }}>Reset Filters</Button>
        </div>
      </div>
    </div>
  );
}
