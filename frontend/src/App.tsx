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
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  const nav = useNavigate();

  return (
    <div className="app-container">
        <div className="navigation-bar">
          <NavigationBar onClick={(item) => nav(`/${item}`)} />
        </div>

        <div className="content">
          <Routes>
            <Route path="/Login" element={<LoginPage />} />
                {/* Protect all routes inside this */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/mealplanning" element={<MealPlanningPage />} />
                <Route path="/recipes" element={<RecipePage />} />
                <Route path="/shoppinglist" element={<ShoppingListPage />} />
                <Route path="/userprofile" element={<UserProfile />} />
            </Route>
          </Routes>
        </div>
    </div>
  );
}

export default App;
