import { Stack, FormControl, MenuItem, Select, Box, ToggleButton, ToggleButtonGroup, Button } from "@mui/material";
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import './MealPlanningPage.css';
import RecipeSearch from "../RecipeSearch/RecipeSearch";
import GridItem from "../GridItem/GridItem";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { RecipeIngredient } from "../../Models/models";
import { CustomToolbar, CustomEvent, CustomDayHeader } from "./CalendarComponents";
import NutritionalAccordion from "../NutritionAccordion/NutritionAccordion";

import { getRecipeIngredients } from '../../api/recipeIngredientApi';
import { getMealPlans } from "../../api/mealPlanApi";

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar)

interface MealPlanSearchParams {
  start_date?: string; // start_date is optional
  end_date?: string; // end_date is required
}

function MealPlanningPage() {
  const [myEventsList, setMyEventsList] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState({});
  const [draggedRecipe, setDraggedRecipe] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const recipesPerPage = 4;
  const [view, setView] = useState("recipes");
  const [totalPages, setTotalPages] = useState(0);
  const [searchRecipes, setSearchRecipes] = useState<RecipeIngredient[]>([]); //TODO: pass the recipes from database
  const [visibleRecipes, setVisibleRecipes] = useState<RecipeIngredient[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // Track the current date
  const [mealPlans, setMealPlans] = useState([]);

  const getStartAndEndOfWeek = (date) => {
    const start = new Date(date);
    const end = new Date(date);

    // Set start date to the beginning of the week (Sunday)
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);

    // Set end date to the end of the week (Saturday)
    end.setDate(date.getDate() + (6 - date.getDay()));
    end.setHours(23, 59, 59, 999);

    return { startDate: start, endDate: end };
  };

  // Navigation handler for Today, Next, and Previous
  const handleNavigate = (action) => {
    let newDate = new Date(currentDate);

    switch (action) {
      case 'TODAY':
        newDate = new Date(); // Set to current date
        break;
      case 'NEXT':
        newDate.setDate(currentDate.getDate() + 7); // Move to next week
        break;
      case 'PREV':
        newDate.setDate(currentDate.getDate() - 7); // Move to previous week
        break;
      default:
        break;
    }

    const { startDate, endDate } = getStartAndEndOfWeek(newDate);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    setCurrentDate(newDate); // Update the current date state
    fetchMealPlans(startDate, endDate);
  };
  
  const fetchRecipes = async () => {
    try {
      const response = await getRecipeIngredients();
      console.log(response);
      setRecipeIngredients(response);
      setTotalPages(Math.ceil(response.length/recipesPerPage));
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } 
  };

  const mapMealPlansToEvents = (mealPlans) => {
    return mealPlans.map((mealPlan) => {
      const { day_planned, id, recipe, meal_type} = mealPlan;
      const day_planned_date = new Date(day_planned);

      return {
        title: recipe.name, // Meal name
        recipe: recipe, // The recipe for the meal (can be used for more details)
        start: day_planned_date,
        end: day_planned_date,
      };
    });
  };

  const fetchMealPlans = async (startDate, endDate) => {
      const searchParams: MealPlanSearchParams = {};
      
      if (startDate && endDate){
        searchParams.start_date = startDate.toISOString().split('T')[0]
        searchParams.end_date = endDate.toISOString().split('T')[0]
      }
      console.log(searchParams)
      try {
        const response = await getMealPlans(searchParams);
        console.log("meal plan", response.meal_plan)
        setMealPlans(response.meal_plan)
            // Transform meal plans into calendar events
        const events = mapMealPlansToEvents(response.meal_plan);
        console.log(events)
        // Set the events in the state
        setMyEventsList(events);

      } catch (error) {
        console.error('Error fetching meal plans:', error);
      }
    };


  useEffect(() => {
    fetchRecipes();
    fetchMealPlans(null, null);
  }, []);

  useEffect(() => {
    const startIndex = currentPage * recipesPerPage;
    const newVisibleRecipes = searchRecipes.slice(startIndex, startIndex + recipesPerPage);
    setVisibleRecipes(newVisibleRecipes);
  }, [currentPage, recipesPerPage, recipeIngredients, searchRecipes]);

  useEffect(() => {
    setSearchRecipes(recipeIngredients); // Ensure filtered list updates when recipes change
  }, [recipeIngredients]);

  const handleSearchRecipe = (searchInput) => {
    if (searchInput.trim() === "") {
      setSearchRecipes(recipeIngredients);
    } else {
      const filtered = recipeIngredients.filter((recipeIngredient) =>
        recipeIngredient.recipe.name.toLowerCase().includes(searchInput.toLowerCase())
      );
      setSearchRecipes(filtered);
    }
  }
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

  


  const handleDragStart = (recipe) => {
    setDraggedRecipe(recipe);
  };

  const dragFromOutsideItem = useCallback(() => {
    // Return the dragged recipe if it's droppable, otherwise return null
    return null;
  }, [draggedRecipe]);

  const onDropFromOutside = useCallback(
  
    ({ event, start, end }) => {
      if (!draggedRecipe) return;
      setMyEventsList((prevEvents) => {
        return prevEvents.map((ev) => {
          if (ev.id === event.id && ev.placeholder) {
            return { ...ev, title: draggedRecipe.recipe.name, placeholder: false, recipe: draggedRecipe };
          }
          return ev;
        });
      });
      console.log(myEventsList)
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
    console.log("changed")
    // TODO: do a check for if meals are more than number of meal slots

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
            id: `${day}-slot-${existingNonPlaceholderEvents.length + existingPlaceholderEvents.length + i}`,
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
    setMyEventsList((prevEvents) =>
      prevEvents.map((ev) =>
        ev.id === event.id
          ? { ...ev, title: "Drag meal here", placeholder: true }
          : ev
      )
    );
  };
  const handleViewChange = (event, newView) => {
    console.log(newView)
    if (newView !== null) {
      setView(newView);
    }
  };

  const saveMealPlan = () => {
    
    console.log(myEventsList);
  };

  return (
    <div>
      <div className="calendarContainer">
        <DragAndDropCalendar
        localizer={localizer}
        events={myEventsList}
        defaultView="week"
        views={{ week: true }}
        date={currentDate} // Pass the currentDate to update the calendar view
        onNavigate={handleNavigate} // Attach the navigation handler
          components={{
          event: (props) => <CustomEvent {...props} resetEventToPlaceholder={resetEventToPlaceholder} />,
          toolbar: (props) => (
            <CustomToolbar 
              {...props} 
              label={currentDate.toLocaleDateString()} 
              onNavigate={handleNavigate} 
            />
          ),
          week: {
            header: CustomDayHeader,
          },
        }}
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
          style={{ height: '350px', width: '1000px' }}
        />
      </div>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        style={{ width: "1004px", margin: "0 auto", marginTop: "10px" }}
      >
        {weekDays.map((day) => (
          <FormControl key={day.format("YYYY-MM-DD")} style={{
            width: "calc(100% / 7 - 1px)",
          }}>
            <Select
              value={selectedMeals[day.format("YYYY-MM-DD")] || ""}
              onChange={(e) => handleMealChange(day.format("YYYY-MM-DD"), Number(e.target.value))}
              displayEmpty
              sx={{
                height: '40px',
                '.MuiOutlinedInput-notchedOutline': {
                  borderRadius: '10px',
                  border: '2px solid #38793b'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#38793b!important'
                },
                '&:Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#38793b!important'
                },
                '.MuiSvgIcon-root ': {
                  fill: "#38793b !important",
                }
              }}
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
          sx={{
            height: "40px",
            '& .MuiToggleButtonGroup-grouped': {
              border: "2px solid #38793b",
            },
          }}
        >
          <ToggleButton value="recipes" aria-label="recipes"
            sx={{
              color: '#38793b',
              borderTopLeftRadius: "10px",
              borderBottomLeftRadius: "10px",
              "&.Mui-selected": {
                backgroundColor: "#38793b",
                color: "white",
              },
              "&:hover": {
                backgroundColor: "#38793b !important",
                color: "white !important",
              }
            }}
          >
            Recipes
          </ToggleButton>
          <ToggleButton value="nutrition" aria-label="nutrition"
            sx={{
              color: '#38793b',
              borderTopRightRadius: "10px",
              borderBottomRightRadius: "10px",
              "&.Mui-selected": {
                backgroundColor: "#38793b",
                color: "white",
              },
              "&:hover": {
                backgroundColor: "#38793b !important",
                color: "white !important",
              }
            }}
          >
            Nutrition Details
          </ToggleButton>
        </ToggleButtonGroup>
        <Button 
        variant = "contained"
        sx = {{
          backgroundColor: '#6bb2f4',
          color:'white',
          borderRadius:'10px'
        }}
         onClick={saveMealPlan}>SAVE</Button>
      </Box>

      {view === "recipes" ? (
          <div className="recipeGrid">
            <h3>Recipes</h3>
            <RecipeSearch searchRecipe={handleSearchRecipe}></RecipeSearch>
            <div className="recipe-grid-container">
              <div className="recipe-grid">
                {visibleRecipes.map((recipe, index) => (
                  <div key={index} className="grid-item" draggable onDragStart={() => handleDragStart(recipe)}>
                    <GridItem recipe={recipe.recipe} />
                  </div>
                ))}
                {visibleRecipes.length < recipesPerPage &&
                  Array.from({ length: recipesPerPage - visibleRecipes.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="grid-item empty"></div>
                  ))
                }
              </div>
            </div>
            <div className="pagination">
              <button onClick={handlePrev} disabled={currentPage === 0}>←</button>
              <span>Page {currentPage + 1} of {totalPages}</span>
              <button onClick={handleNext} disabled={currentPage === totalPages - 1}>→</button>
            </div>
          </div>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <NutritionalAccordion />
        </Box>)}
    </div>
  );
}

export default MealPlanningPage;
