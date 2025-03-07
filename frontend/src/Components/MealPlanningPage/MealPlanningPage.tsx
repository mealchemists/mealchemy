import { Stack, FormControl, MenuItem, Select, IconButton, Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import './MealPlanningPage.css';
import RecipeSearch from "../RecipeSearch/RecipeSearch";
import GridItem from "../GridItem/GridItem";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { Recipe } from "../../Models/models";
import DeleteIcon from "@mui/icons-material/Delete"; 

import NutritionalAccordion from "../NutritionAccordion/NutritionAccordion";
// const events = [
//   {
//     'title': 'All Day 1',
//     'bgColor': '#ff7f50',
//     'allDay': true,
//     'start': new Date(2025, 2, 3),
//     'end': new Date(2025, 2, 3)
//   },
//   {
//     'title': 'All Day 2',
//     'bgColor': '#ff7f50',
//     'allDay': true,
//     'start': new Date(2025, 2, 3),
//     'end': new Date(2025, 2, 3)
//   }

// ]

const blankRecipe: Recipe = {
  title: "Salad",
  cookTime: 0,
  prepTime: 0,
  totalTime: 0,
  mainIngredient: "Chicken",
  ingredients: ["A whole chicken", "1/3 onions", "1 head of lettuce", "3 tomatoes"],
  instructions: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit", " Maecenas mattis quis augue quis facilisis", "Cras et mollis orci"],
  imageSrc: "/salad.jpg"
};

const blankRecipe2: Recipe = {
  title: "Chicken",
  cookTime: 0,
  prepTime: 0,
  totalTime: 0,
  mainIngredient: "Chicken",
  ingredients: ["A whole chicken", "1/3 onions", "1 head of lettuce", "3 tomatoes"],
  instructions: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit", " Maecenas mattis quis augue quis facilisis", "Cras et mollis orci"],
  imageSrc: "/salad.jpg"
};

const recipes = [blankRecipe, blankRecipe2, blankRecipe, blankRecipe2, blankRecipe, blankRecipe, blankRecipe, blankRecipe, blankRecipe];
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar)

const CustomToolbar = ({ label, onNavigate }) => (
  <div className="rbc-toolbar">
    <div className="rbc-toolbar-label">{label}</div>
    <div className="rbc-btn-group rbc-btn-group-left">
      <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
      <button type="button" onClick={() => onNavigate('PREV')}>Back</button>
      <button type="button" onClick={() => onNavigate('NEXT')}>Next</button>
    </div>
    <div className="rbc-btn-group rbc-btn-group-right">
      <button type="button" className="add-to-shopping-list-btn">Add to Shopping List</button>
    </div>
  </div>
);



function MealPlanningPage() {
  const [myEventsList, setMyEventsList] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState({});
  const [draggedRecipe, setDraggedRecipe] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const recipesPerPage = 8; // Show 8 recipes per page (4 columns x 2 rows)
  const [view, setView] = useState("recipes");
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  const handleNext = () => {
      if (currentPage < totalPages - 1) {
          setCurrentPage(currentPage + 1);
      }
  };

  const handlePrev = () => {
      if (currentPage > 0) {
          setCurrentPage(currentPage - 1);
      }
  };

  const startIndex = currentPage * recipesPerPage;
  const visibleRecipes = recipes.slice(startIndex, startIndex + recipesPerPage);

  const CustomEvent = ({ event }) => {
    const handleDelete = () => {
      // Call a function to reset the event to a placeholder
      resetEventToPlaceholder(event);
    };
  
    return (
      <div>
        <span>{event.title}</span>
        <IconButton
          size="small"
          onClick={handleDelete}
          style={{ marginLeft: "5px", padding: "2px" }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </div>
    );
  };
  
  const handleDragStart = (recipe) => {
    setDraggedRecipe(recipe);
  };
  
  const dragFromOutsideItem = useCallback(() => {
    // Return the dragged recipe if it's droppable, otherwise return null
    return draggedRecipe ? draggedRecipe : null;
  }, [draggedRecipe]);

  const onDropFromOutside = useCallback(

    ({ event, start, end }) => {
      if (!draggedRecipe) return;

      setMyEventsList((prevEvents) => {
        return prevEvents.map((ev) => {
          if (ev.id === event.id && ev.placeholder) {
            return { ...ev, title: draggedRecipe.title, placeholder: false };
          }
          return ev;
        });
      });

      setDraggedRecipe(null);
    },
    [draggedRecipe]
  );

  const moveEvent = useCallback(
    ({ event, start, end }) => {
      setMyEventsList((prevEvents) =>
        prevEvents.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev))
      );
    },
    []
  );
  // Get the days of the current week
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    moment().startOf("week").add(i, "days")
  );

  const handleMealChange = (day, mealCount) => {
    setSelectedMeals((prev) => ({ ...prev, [day]: mealCount }));
  
    setMyEventsList((prevEvents) => {
      // Separate non-placeholder and placeholder events for the current day
      const existingNonPlaceholderEvents = prevEvents.filter(
        (event) => moment(event.start).isSame(day, "day") && !event.placeholder
      );
  
      const existingPlaceholderEvents = prevEvents.filter(
        (event) => moment(event.start).isSame(day, "day") && event.placeholder
      );
  
      // Calculate the difference between the new meal count and the current number of placeholders
      const difference = mealCount - existingNonPlaceholderEvents.length - existingPlaceholderEvents.length;
  
      // Create new placeholder events if the difference is positive
      const newPlaceholderEvents =
        difference > 0
          ? Array.from({ length: difference }, (_, i) => ({
              id: `${day}-slot-${existingNonPlaceholderEvents.length+existingPlaceholderEvents.length + i}`,
              start: moment(day).startOf("day").toDate(),
              end: moment(day).startOf("day").toDate(),
              allDay: true,
              title: "Drag meal here",
              placeholder: true,
            }))
          : [];
  
      // Remove excess placeholders if the difference is negative
      const updatedPlaceholderEvents =
        difference < 0
          ? existingPlaceholderEvents.slice(0, mealCount)
          : [...existingPlaceholderEvents, ...newPlaceholderEvents];
  
      // Combine the non-placeholder events with the updated placeholder events
      return [
        ...prevEvents.filter((event) => !moment(event.start).isSame(day, "day")), // Keep events for other days
        ...existingNonPlaceholderEvents, // Keep existing non-placeholder events
        ...updatedPlaceholderEvents, // Update placeholders
      ];
    });
  };
  
  const resetEventToPlaceholder = (event) => {
    console.log(event);
    setMyEventsList((prevEvents) =>
      prevEvents.map((ev) =>
        ev.id === event.id
          ? { ...ev, title: "Drag meal here", placeholder: true }
          : ev
      )
    );
  };
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };
  return (
    <div>
      <div className="calendarContainer">
        <DragAndDropCalendar
          localizer={localizer}
          events={myEventsList}
          defaultView="week"
          views={{ week: true }}
          components={{       event: CustomEvent, 
            toolbar: CustomToolbar }}
          onEventDrop={moveEvent}
          onDropFromOutside={({ start, end }) => {
            if (!start || !end) {
              console.warn("Dropped outside valid area. Ignoring.");
              return;
          }
            // Find the placeholder event at the dropped position
            const targetEvent = myEventsList.find(
              (event) =>
                event.placeholder &&
                moment(event.start).isSame(start, "day")
            );
            if (targetEvent) {
              onDropFromOutside({ event: targetEvent, start, end });
            }
          }}
          dragFromOutsideItem={dragFromOutsideItem} 
          selectable
          resizable
          style={{ height: '300px', width: '1000px' }}
        />
      </div>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        style={{ width: "1000px", margin: "0 auto", marginTop: "10px" }}
      >
        {weekDays.map((day) => (
          <FormControl key={day.format("YYYY-MM-DD")} style={{ width: "calc(100% / 7 - 1px)" }}>
            <Select
              value={selectedMeals[day.format("YYYY-MM-DD")] || ""}
              onChange={(e) => handleMealChange(day.format("YYYY-MM-DD"), Number(e.target.value))}
              displayEmpty
              style={{ height: '40px' }}
            >
              <MenuItem value={0}>None</MenuItem>
              {[1, 2, 3, 4, 5].map((number) => (
                <MenuItem key={number} value={number}>
                  {number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Stack>
      <Box
      sx={{
        width: "1000px",
        margin: "0 auto",
        marginTop: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
      <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          aria-label="view toggle"
        >
          <ToggleButton value="recipes" aria-label="recipes">
            Recipes
          </ToggleButton>
          <ToggleButton value="nutrition" aria-label="nutrition">
            Nutrition Details
          </ToggleButton>
        </ToggleButtonGroup>
        <button className="done-button">DONE</button>
      </Box>

      {view === "recipes" ? (

      <div className="recipeGrid">
        <h3>Recipes</h3>
        <RecipeSearch></RecipeSearch>
        <div className="recipe-grid">
        {visibleRecipes.map((recipe, index) => (
                    <div key={index} className="grid-item" draggable onDragStart={() => handleDragStart(recipe)}>
                        <GridItem recipe={recipe} />
                    </div>
                ))}
                {visibleRecipes.length < recipesPerPage &&
                    Array.from({ length: recipesPerPage - visibleRecipes.length }).map((_, index) => (
                        <div key={`empty-${index}`} className="grid-item empty"></div>
                    ))
                }
        </div>
        <div className="pagination">
                <button onClick={handlePrev} disabled={currentPage === 0}>←</button>
                <span>Page {currentPage + 1} of {totalPages}</span>
                <button onClick={handleNext} disabled={currentPage === totalPages - 1}>→</button>
            </div>
      </div>
    ):(
<Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <NutritionalAccordion />
        </Box>    )}
    </div>
  );
}

export default MealPlanningPage;
