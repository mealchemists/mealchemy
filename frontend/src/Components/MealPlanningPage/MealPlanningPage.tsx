import { MenuItem, Select, FormControl, Stack } from "@mui/material";
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import './MealPlanningPage.css';
import RecipeSearch from "../RecipeSearch/RecipeSearch";
import GridItem from "../GridItem/GridItem";
import Grid from '@mui/material/Grid2';
import { Recipe } from "../../Models/models";
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
  name: "Enter Recipe Title",
  cook_time: 0,
  prep_time: 0,
  total_time: 0,
  main_ingredient: "Chicken",
  ingredients: ["A whole chicken", "1/3 onions", "1 head of lettuce", "3 tomatoes"],
  steps: null,
  imageSrc: "/salad.jpg"
};

const recipes = [blankRecipe, blankRecipe, blankRecipe, blankRecipe, blankRecipe];
const localizer = momentLocalizer(moment);

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

  // Get the days of the current week
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    moment().startOf("week").add(i, "days")
  );

  // Handles meal selection for each day
  const handleMealChange = (day, mealCount) => {
    setSelectedMeals((prev) => ({ ...prev, [day]: mealCount }));

    const newEvents = Array.from({ length: mealCount }, (_, i) => ({
      start: moment(day).startOf("day").toDate(),
      end: moment(day).endOf("day").toDate(),
      allDay: true,
      title: `Meal ${i + 1}`,
    }));

    setMyEventsList((prevEvents) => {
      const filteredEvents = prevEvents.filter(event => moment(event.start).format("YYYY-MM-DD") !== day);
      return [...filteredEvents, ...newEvents];
    });
  };

  return (
    <>
      <div className="calendarContainer">
        <Calendar
          localizer={localizer}
          events={myEventsList}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={{ week: true }}
          components={{ toolbar: CustomToolbar }}
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

      <div className="recipeGrid">
        <h3>Recipes</h3>
        <RecipeSearch></RecipeSearch>
        <div className="recipe-grid">
          {recipes.map((recipe, index) => (
            <div key={index} className="grid-item">
              <GridItem recipe={recipe} />
            </div>
          ))}
        </div>
      </div>


    </>
  );
}

export default MealPlanningPage;
