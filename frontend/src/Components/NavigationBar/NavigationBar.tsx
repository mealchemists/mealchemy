import React from 'react';
import './NavigationBar.css';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import HomeIcon from '@mui/icons-material/Home';
interface NavigationBarProps {
    onClick: (item: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onClick }) => {
    return (
        <nav className="navContainer">
            <button onClick={() => onClick("Home")}><HomeIcon fontSize='large'/></button>
            <div className="middleNav">
                <ul>
                    <li onClick={() => onClick("Recipes")}>Recipe</li>
                    <li onClick={() => onClick("MealPlanning")}>MealPlanning</li>
                    <li onClick={() => onClick("ShoppingList")}>Shopping List</li>
                </ul>
            </div>
            <button onClick={() => onClick("UserProfile")} className="userProfile"><AccountCircleOutlinedIcon fontSize='large'></AccountCircleOutlinedIcon></button>
        </nav>
    )
}

export default NavigationBar;
