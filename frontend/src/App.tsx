import React from 'react';
import './App.css';
import { Route, Routes, useNavigate } from "react-router-dom";
import MealPlanningPage from './Components/MealPlanningPage/MealPlanningPage';
import ShoppingListPage from './Components/ShoppingListPage/ShoppingListPage';
import RecipePage from './Components/RecipePage/RecipePage';
import HomePage from './Components/HomePage/HomePage';
import UserProfile from './Components/UserProfile/UserProfile';
import LoginPage from './Components/LoginPage/LoginPage';
import NavigationBar from './Components/NavigationBar/NavigationBar';

function App() {
  const nav = useNavigate();

  return (
    <div className="app-container">
        <div className="navigation-bar">
          <NavigationBar onClick={(item) => nav(`/${item}`)} />
        </div>

        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/Home" element={<HomePage />} />
            <Route path="/MealPlanning" element={<MealPlanningPage />} />
            <Route path="/Recipes" element={<RecipePage />} />
            <Route path="/ShoppingList" element={<ShoppingListPage />} />
            <Route path="/UserProfile" element={<UserProfile />} />
            <Route path="/Login" element={<LoginPage />} />
          </Routes>
        </div>
    </div>
  );
}

export default App;
