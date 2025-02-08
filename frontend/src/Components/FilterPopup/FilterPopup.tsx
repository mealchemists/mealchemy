import React, { useEffect, useState } from 'react';
import './FilterPopup.css';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Chip } from '@mui/material';
import Slider from '@mui/material/Slider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const top100Films = [
  { title: 'The Shawshank Redemption', year: 1994 },
  { title: 'The Godfather', year: 1972 },
  { title: 'The Godfather: Part II', year: 1974 },
  { title: 'The Dark Knight', year: 2008 },
  { title: '12 Angry Men', year: 1957 },
  { title: "Schindler's List", year: 1993 },
  { title: 'Pulp Fiction', year: 1994 },
  {
    title: 'The Lord of the Rings: The Return of the King',
    year: 2003,
  }
]
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


export default function FilterPopup({ onClose, onFilterChange, selectedFilters, sliderRange, onSliderChange }: FilterPopupProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTags, setFilterTags] = useState<string[]>(selectedFilters);



  const applyFilters = (e: React.MouseEvent) => {
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
          <p> Sort By</p>
          <div className="radioContainer">
          <FormControl sx = {{
            width:"90%",
            margin: "0 auto",
          }}>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
            >
              <FormControlLabel
                value="alpha"
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
                value="cookingTime"
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
                  '&.Mui-checked': {
                    color: "#38793b"
                  },
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
                color: "#38793b", // Change track & thumb color
                width: "90%", // Make slider width 90%
                margin: "0 auto",
                '& .MuiSlider-thumb': { backgroundColor: "#38793b" },
                '& .MuiSlider-track': { backgroundColor: "#38793b" },
                '& .MuiSlider-rail': { backgroundColor: "#b0dbb2" },
              }}
            />
          </div>
          <p>Tags</p>
          <Autocomplete
            multiple
            id="tags-outlined"
            options={top100Films.map((option) => option.title)}
            defaultValue={[top100Films[1].title]}
            freeSolo
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    label={option}
                    variant="outlined"
                    key={key}
                    sx={{
                      color: "#38793b",
                      fontWeight: "bold",
                      border: "3px solid #38793b",
                      "& .MuiChip-deleteIcon": { color: "#38793b" },
                      "& .MuiChip-deleteIcon:hover": {
                        color: "#b0dbb2",
                      },
                    }}
                    {...tagProps}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                sx={{
                  "& .MuiOutlinedInput-root": {
                    border: "2px solid #b0dbb2",
                    borderRadius: "10px",
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                    padding: "5px"
                  },

                }}
                {...params}
              />
            )}
          />
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