import React from 'react';
import './App.css';
import ListItem from './Components/ListItem/ListItem';
import { Route, Routes, useNavigate } from "react-router-dom";
import MealPlanningPage from './Components/MealPlanningPage/MealPlanningPage';
import ShoppingListPage from './Components/ShoppingListPage/ShoppingListPage';
import RecipePage from './Components/RecipePage/RecipePage';
import NavigationBar from './Components/NavigationBar/NavigationBar';

function App() {
  const nav = useNavigate();

  return (
    <div>
      <NavigationBar
        onClick={(item) => nav(`/${item}`)}
      />

      <div>
        <Routes>
          <Route path="/" element={<MealPlanningPage />} />
          <Route path="/MealPlanning" element={<MealPlanningPage />} />
          <Route path="/Recipes" element={<RecipePage />} />
          <Route path="/ShoppingList" element={<ShoppingListPage />} />
        </Routes>
      </div>
      <ListItem title='Salad' tags={['Lettuce', '15-60 mins']} imgsrc={'/salad.jpg'}></ListItem>
    </div>
  );
}

export default App;
