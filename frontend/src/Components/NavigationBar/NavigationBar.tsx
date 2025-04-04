import React from 'react';
import './NavigationBar.css';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChecklistIcon from '@mui/icons-material/Checklist';
interface NavigationBarProps {
    onClick: (item: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onClick }) => {
    const isMobile = useMediaQuery("(max-width:800px)");

    return (
        <nav className="navContainer">
            <div className="middleNav">
                <ul>
                    <li onClick={() => onClick("Recipes")}>
                        {!isMobile && "Recipe"}
                        {isMobile && <MenuBookIcon fontSize = "large" />}
                    </li>
                    <li onClick={() => onClick("MealPlanning")}>
                        {!isMobile && "MealPlanning"}
                        {isMobile && <CalendarMonthIcon fontSize = "large" />}
                    </li>
                    <li onClick={() => onClick("ShoppingList")}>
                        {!isMobile && "Shopping List"}
                        {isMobile && <ChecklistIcon fontSize = "large" />}
                    </li>
                </ul>
            </div>
            <button onClick={() => onClick("UserProfile")} className="userProfile">
                <PermIdentityIcon fontSize="large" />
            </button>
        </nav>
    );
};

export default NavigationBar;
