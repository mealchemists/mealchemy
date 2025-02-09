import React from 'react';
import './NavigationBar.css';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

interface NavigationBarProps {
    onClick: (item: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onClick }) => {
    return (
        <nav className="navContainer">
            <div className="middleNav">
                <ul>
                    <li onClick={() => onClick("Recipes")}>Recipe</li>
                    <li onClick={() => onClick("MealPlanning")}>MealPlanning</li>
                    <li onClick={() => onClick("ShoppingList")}>Shopping List</li>
                </ul>
            </div>
            <a href="/" className="userProfile"><AccountCircleOutlinedIcon fontSize='large'></AccountCircleOutlinedIcon></a>
        </nav>
    )
}

export default NavigationBar;
