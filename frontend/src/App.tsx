import { useEffect } from "react";
import './App.css';
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import MealPlanningPage from './Components/MealPlanningPage/MealPlanningPage';
import ShoppingListPage from './Components/ShoppingListPage/ShoppingListPage';
import RecipePage from './Components/RecipePage/RecipePage';
import UserProfile from './Components/UserProfile/UserProfile';
import LoginPage from './Components/LoginPage/LoginPage';
import NavigationBar from './Components/NavigationBar/NavigationBar';
import ProtectedRoute from './routes/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const nav = useNavigate();
  const location = useLocation();
  const changeFavicon = (iconURL: string) => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = iconURL;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = iconURL;
      document.head.appendChild(newLink);
    }
  };
  useEffect(() => {
    document.title = "Mealchemy"; 
    changeFavicon("mealchemy-logo.png");
  }, []);
  return (
    <div className="app-container">
      {location.pathname !== "/login" && (
        <div className="navigation-bar">
          <NavigationBar onClick={(item) => nav(`/${item}`)} />
        </div>
      )}
      <div className="content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<RecipePage />} />
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
