import React from 'react';
import './App.css';
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import MealPlanningPage from './Components/MealPlanningPage/MealPlanningPage';
import ShoppingListPage from './Components/ShoppingListPage/ShoppingListPage';
import RecipePage from './Components/RecipePage/RecipePage';
import HomePage from './Components/HomePage/HomePage';
import UserProfile from './Components/UserProfile/UserProfile';
import LoginPage from './Components/LoginPage/LoginPage';
import NavigationBar from './Components/NavigationBar/NavigationBar';
import ProtectedRoute from './routes/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const nav = useNavigate();
  const location = useLocation();

  return (
    <div className="app-container">
        {location.pathname !== "/Home" && (
            <div className="navigation-bar">
                <NavigationBar onClick={(item) => nav(`/${item}`)} />
            </div>
        )} 
        <div className="content">
          <Routes>
            <Route path="/Login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/mealplanning" element={<MealPlanningPage />} />
                <Route path="/recipes" element={<RecipePage />} />
                <Route path="/shoppinglist" element={<ShoppingListPage />} />
                <Route path="/userprofile" element={<UserProfile />} />
            </Route>
          </Routes>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    </div>
  );
}

export default App;
