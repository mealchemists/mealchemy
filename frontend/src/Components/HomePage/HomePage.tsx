import React, { useState } from 'react';
import './HomePage.css';
import LoginPage from '../LoginPage/LoginPage';

function HomePage() {
    return (
        <div>
            <h1>Home</h1>
            <LoginPage></LoginPage>
        </div>
    );
}

export default HomePage;
