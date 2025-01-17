import{useState, useEffect} from 'react';
import './App.scss';
import React from 'react';
import axios from 'axios';

function App() {
  const [count, setData] = useState(null);
  useEffect(() => {
    axios.get("http://localhost:8000/api/recipe")
      .then((response) => {
        // Handle the response
        console.log(response.data);
        setData(response.data);  // Store the response data in state
      })
      .catch((error) => {
        console.error("There was an error making the GET request:", error);
      });
  }, []); 

  return (
    <div>
      <h1>
        HelloWorld
      </h1>
    </div>
  );
}

export default App;
