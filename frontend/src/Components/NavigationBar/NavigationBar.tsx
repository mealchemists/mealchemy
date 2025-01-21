import React from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

interface NavigationBarProps {
    onClick: (item: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onClick }) => {
    return <nav className="navContainer">
        <ul>
            <li onClick={() => onClick("Recipes")}>Recipe</li>
            <li onClick={() => onClick("MealPlanning")}>MealPlanning</li>
            <li onClick={() => onClick("ShoppingList")}>Shopping List</li>
        </ul>
        <a href="/" className="userProfile"><AccountCircleOutlinedIcon></AccountCircleOutlinedIcon></a>
    </nav>
}

export default NavigationBar;
