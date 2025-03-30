import {
  Stack,
  FormControl,
  MenuItem,
  Select,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment, { weekdays } from "moment";
import "./MealPlanningPage.css";
import RecipeSearch from "../RecipeSearch/RecipeSearch";
import GridItem from "../GridItem/GridItem";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { RecipeIngredient } from "../../Models/models";
import { toast } from "react-toastify";
import {
  CustomToolbar,
  CustomEvent,
  CustomDayHeader,
} from "./CalendarComponents";
import NutritionalAccordion from "../NutritionAccordion/NutritionAccordion";

import { getRecipeIngredients } from "../../api/recipeIngredientApi";
import {
  getMealPlans,
  putMealPlan,
  deleteMealPlan,
} from "../../api/mealPlanApi";

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

function MealPlanningPage() {
  const [myEventsList, setMyEventsList] = useState([]);
  // const [selectedMeals, setSelectedMeals] = useState({});
  const [draggedRecipe, setDraggedRecipe] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const recipesPerPage = 8;
  const [view, setView] = useState("recipes");
  const [totalPages, setTotalPages] = useState(0);
  const [searchRecipes, setSearchRecipes] = useState<RecipeIngredient[]>([]); //TODO: pass the recipes from database
  const [visibleRecipes, setVisibleRecipes] = useState<RecipeIngredient[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<
    RecipeIngredient[]
  >([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // Track the current date

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
      case "TODAY":
        newDate = new Date(); // Set to current date
        break;
      case "NEXT":
        newDate.setDate(currentDate.getDate() + 7); // Move to next week
        break;
      case "PREV":
        newDate.setDate(currentDate.getDate() - 7); // Move to previous week
        break;
      default:
        break;
    }

    const { startDate, endDate } = getStartAndEndOfWeek(newDate);
    setCurrentDate(newDate); // Update the current date state
    fetchMealPlans(startDate, endDate);
  };

  const fetchRecipes = async () => {
    try {
      const response = await getRecipeIngredients();
      setRecipeIngredients(response); // Store fetched recipes
      const pageCount = Math.ceil(response.length / recipesPerPage);
      setTotalPages(pageCount);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const fetchMealPlans = async (startDate, endDate) => {
    setMyEventsList([]); // Reset the events list

    const searchParams = {
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    };

    try {
      const response = await getMealPlans(searchParams);
      const fetchedMealPlans = response?.meal_plan ?? []; // Fallback to an empty array if `meal_plan` is undefined

      // Group the fetched meal plans by day using formatted date string as the key
      const groupedMealPlans = fetchedMealPlans.reduce((acc, mealPlan) => {
        const day = moment(mealPlan.day_planned)
          .startOf("day")
          .format("YYYY-MM-DD"); // Use formatted date string as key
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(mealPlan);
        return acc;
      }, {});

      // Update selectedMeals with meal counts for each day
      // const updatedSelectedMeals = {};
      // Object.keys(groupedMealPlans).forEach((dayString) => {
      //   const mealPlansForDay = groupedMealPlans[dayString];
      //   updatedSelectedMeals[dayString] = mealPlansForDay.length; // Set meal count as the length of mealPlansForDay
      // });

      // Set the updated selected meals in state
      // setSelectedMeals(updatedSelectedMeals);

      Object.keys(groupedMealPlans).forEach((dayString) => {
        const day = moment(dayString); // Convert string back to moment object
        const mealPlansForDay = groupedMealPlans[dayString]; // Get all meal plans for the day
        mealPlansForDay.forEach((mealPlan) => {
          handleMealChange(day, mealPlansForDay.length, mealPlan); // Call `handleMealChange` for each meal plan
        });
      });
    } catch (error) {
      console.error("Error fetching meal plans:", error);
    }
  };

  const updateMealPlan = async () => {
    try {
      const meal_plan_data = myEventsList
        .filter((events) => events.placeholder === false)
        .map(
          ({
            id,
            start,
            end,
            mealPlan_id,
            allDay,
            title,
            placeholder,
            ...rest
          }) => ({
            ...rest,
            id: mealPlan_id,
            day_planned: start,
          })
        );

      const response = await putMealPlan(meal_plan_data);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
    }
  };

  useEffect(() => {
    const { startDate, endDate } = getStartAndEndOfWeek(new Date());
    fetchRecipes();
    fetchMealPlans(startDate, endDate);
  }, []);

  useEffect(() => {
    const startIndex = currentPage * recipesPerPage;
    const newVisibleRecipes = searchRecipes.slice(
      startIndex,
      startIndex + recipesPerPage
    );
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
        recipeIngredient.recipe.name
          .toLowerCase()
          .includes(searchInput.toLowerCase())
      );
      setSearchRecipes(filtered);
    }
  };
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
    setDraggedRecipe(recipe.recipe);
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
            return {
              ...ev,
              title: draggedRecipe.name,
              start: start,
              end: end,
              placeholder: false,
              recipe: draggedRecipe,
            };
          }
          return ev;
        });
      });
      setDraggedRecipe(null);
    },
    [draggedRecipe]
  );

  const moveEvent = useCallback(({ event, start, end }) => {
    setMyEventsList((prevEvents) =>
      prevEvents.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev))
    );
  }, []);

  const getWeekDays = (selectedDate) => {
    const startOfWeek = moment(selectedDate).startOf("week"); // Start from Sunday (default behavior)
    const weekDays = [];

    // Generate the 7 days of the week starting from Sunday
    for (let i = 0; i < 7; i++) {
      weekDays.push(startOfWeek.clone().add(i, "days")); // Add i days to the start of the week
    }
    return weekDays;
  };

  const calculateEventCounts = () => {
	const eventCounts = {};
  
	// Loop through myEventsList and update the event count for each day
	myEventsList.forEach((event) => {
	  const dayString = moment(event.start).format('YYYY-MM-DD'); // Format event start date to 'YYYY-MM-DD'
  
	  // If the day does not exist in the eventCounts object, initialize it
	  if (!eventCounts[dayString]) {
		eventCounts[dayString] = 0;
	  }
  
	  // Increment the count for this specific day
	  eventCounts[dayString]++;
	});
  
	// Return the complete event count object
	return eventCounts;
  };

  const eventCountPerday = (day) => {
	const eventCounts = calculateEventCounts();
	const dayString = day.format('YYYY-MM-DD'); 
	
	// Return the count for the specific day or 0 if no events are found
	return eventCounts[dayString] || 0; 
  };

  const handleMealChange = (day, mealCount, mealPlan = null) => {
    // Update events list based on new meal count
    setMyEventsList((prevEvents) => {
      // Separate non-placeholder and placeholder events for the current day
      const existingNonPlaceholderEvents = prevEvents.filter(
        (event) => moment(event.start).isSame(day, "day") && !event.placeholder
      );

      const existingPlaceholderEvents = prevEvents.filter(
        (event) => moment(event.start).isSame(day, "day") && event.placeholder
      );

      // Calculate the total number of existing meal slots (both actual meals and placeholders)
      const totalExistingEvents =
        existingNonPlaceholderEvents.length + existingPlaceholderEvents.length;
      // Calculate the difference between the new meal count and the total existing events
      const difference = mealCount - totalExistingEvents;
      const newEvents =
        difference > 0
          ? mealPlan // mealPlan is passed in as a single object
            ? [
                {
                  id: `${day}-${mealPlan.recipe.id}`, // Unique ID for the meal plan
                  mealPlan_id: mealPlan.id,
                  start: moment(mealPlan.day_planned).startOf("day").toDate(),
                  end: moment(mealPlan.day_planned).startOf("day").toDate(),
                  day_planned: mealPlan.day_planned,
                  allDay: true,
                  title: mealPlan.recipe.name, // Using the title from the single meal plan
                  placeholder: false, // This is an actual meal plan
                  recipe: mealPlan.recipe,
                },
              ]
            : Array.from({ length: difference }, (_, i) => ({
                id: `${day}-slot-${totalExistingEvents + i}`,
                start: moment(day).startOf("day").toDate(),
                end: moment(day).startOf("day").toDate(),
                allDay: true,
                title: "Drag meal here", // Placeholder title
                placeholder: true, // This is a placeholder event
              }))
          : [];

      // Remove excess placeholders if the difference is negative
      const updatedPlaceholderEvents =
        difference < 0
          ? existingPlaceholderEvents.slice(0, mealCount) // Only keep necessary placeholders
          : [...existingPlaceholderEvents, ...newEvents]; // Append new placeholders if necessary

      // Return the updated events list combining existing events and adjusted placeholders
      return [
        ...prevEvents.filter(
          (event) => !moment(event.start).isSame(day, "day")
        ), // Keep events for other days
        ...existingNonPlaceholderEvents, // Keep existing non-placeholder events
        ...updatedPlaceholderEvents, // Updated list of placeholders
      ];
    });
  };

  const resetEventToPlaceholder = async (event) => {
    console.log("Deleted");
    if (event.placeholder === false) {
      try {
        const response = await deleteMealPlan(event.mealPlan_id);
      } catch (error) {
        console.error("Error fetching meal plans:", error);
      }
    }

    // Remove deleted item from event list
    setMyEventsList((prevEvents) =>
      prevEvents.filter((ev) => ev.id != event.id)
    );
  };
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const validateMealCount = () => {
	const weekDays = getWeekDays(currentDate).map((day) => eventCountPerday(day)) 

	const expectedMealCount = weekDays.reduce((partialSum, a) => partialSum + a, 0);
    const mealCount = myEventsList.filter(
      (meal) => meal.placeholder === false
    ).length;

    if (mealCount != expectedMealCount) {
      return false
    }
    return true;
  };

  const saveMealPlan = () => {

    if (validateMealCount()) {
		updateMealPlan();
		toast.success("Your Meal-Plan  has been saved! 🍔");
		return
	}
    toast.error('Please add meals to each slot or reduce number of meal plans ❌');
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
            event: (props) => (
              <CustomEvent
                {...props}
                resetEventToPlaceholder={resetEventToPlaceholder}
              />
            ),
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
                event.placeholder && moment(event.start).isSame(start, "day")
            );
            if (targetEvent) {
              onDropFromOutside({ event: targetEvent, start, end });
            }
          }}
          dragFromOutsideItem={dragFromOutsideItem}
          selectable
          resizable
          style={{ height: "350px", width: "1000px" }}
        />
      </div>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        style={{ width: "1004px", margin: "0 auto", marginTop: "10px" }}
      >
        {getWeekDays(currentDate).map((day) => (
          <FormControl
            key={day.format("YYYY-MM-DD")}
            style={{
              width: "calc(100% / 7 - 1px)",
            }}
          >
            <Select
              value={eventCountPerday(day)}
              onChange={(e) =>
                handleMealChange(
                  day.format("YYYY-MM-DD"),
                  Number(e.target.value)
                )
              }
              displayEmpty
              sx={{
                height: "40px",
                ".MuiOutlinedInput-notchedOutline": {
                  borderRadius: "10px",
                  border: "2px solid #38793b",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#38793b!important",
                },
                "&:Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#38793b!important",
                },
                ".MuiSvgIcon-root ": {
                  fill: "#38793b !important",
                },
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
        }}
      >
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          aria-label="view toggle"
          sx={{
            height: "40px",
            "& .MuiToggleButtonGroup-grouped": {
              border: "2px solid #38793b",
            },
          }}
        >
          <ToggleButton
            value="recipes"
            aria-label="recipes"
            sx={{
              color: "#38793b",
              borderTopLeftRadius: "10px",
              borderBottomLeftRadius: "10px",
              "&.Mui-selected": {
                backgroundColor: "#38793b",
                color: "white",
              },
              "&:hover": {
                backgroundColor: "#38793b !important",
                color: "white !important",
              },
            }}
          >
            Recipes
          </ToggleButton>
          <ToggleButton
            value="nutrition"
            aria-label="nutrition"
            sx={{
              color: "#38793b",
              borderTopRightRadius: "10px",
              borderBottomRightRadius: "10px",
              "&.Mui-selected": {
                backgroundColor: "#38793b",
                color: "white",
              },
              "&:hover": {
                backgroundColor: "#38793b !important",
                color: "white !important",
              },
            }}
          >
            Nutrition Details
          </ToggleButton>
        </ToggleButtonGroup>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#6bb2f4",
            color: "white",
            borderRadius: "10px",
          }}
          onClick={saveMealPlan}
        >
          SAVE
        </Button>
      </Box>

      {view === "recipes" ? (
        <div className="recipeGrid">
          <h3>Recipes</h3>
          <RecipeSearch searchRecipe={handleSearchRecipe}></RecipeSearch>
          <div className="recipe-grid-container">
            <div className="recipe-grid">
              {visibleRecipes.map((recipe, index) => (
                <div
                  key={index}
                  className="grid-item"
                  draggable
                  onDragStart={() => handleDragStart(recipe)}
                >
                  <GridItem recipe={recipe.recipe} />
                </div>
              ))}
              {visibleRecipes.length < recipesPerPage &&
                Array.from({
                  length: recipesPerPage - visibleRecipes.length,
                }).map((_, index) => (
                  <div key={`empty-${index}`} className="grid-item empty"></div>
                ))}
            </div>
          </div>
          <div className="pagination">
            <button onClick={handlePrev} disabled={currentPage === 0}>
              ←
            </button>
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
            >
              →
            </button>
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
        </Box>
      )}
    </div>
  );
}

export default MealPlanningPage;
