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
            <div className="middleNav">
                <ul>
                    <li onClick={() => onClick("Recipes")}>Recipes</li>
                    <li onClick={() => onClick("MealPlanning")}>Meal Planning</li>
                    <li onClick={() => onClick("ShoppingList")}>Shopping List</li>
                </ul>
            </div>
            <button onClick={() => onClick("UserProfile")} className="userProfile"><AccountCircleOutlinedIcon fontSize='large'></AccountCircleOutlinedIcon></button>
        </nav>
    )
}

export default NavigationBar;
