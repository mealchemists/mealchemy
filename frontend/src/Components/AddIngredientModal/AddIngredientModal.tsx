import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, InputAdornment, Modal, TextField, Typography } from '@mui/material';
import { Ingredient } from '../../Models/models';
import { getAllIngredients } from '../../api/recipeIngredientApi';
import './AddIngredientModal.css';
import apiClient from '../../api/apiClient';
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const blankRecipe1 = {
    id: -1,
    name: "",
    quantity: 0,
    unit: "g",
    calories_per_100g: 0,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    sugar_per_100g: 0,
    fat_per_100g: 0,
    fiber_per_100g: 0,
    sodium_per_100mg: 0,
    aisle: ""
}

function AddIngredientModal({ open, onClose, onAddIngredient }) {
    const [newIngredient, setNewIngredient] = useState<Ingredient>(blankRecipe1);
    const [allIngredients, setAllIngredients] = useState([]);
    const [allAisles, setAllAisles] = useState([]);
    const handleInputChange = (field: string, value: string) => {
        setNewIngredient((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const sendIngredientToParent = () => {
        onAddIngredient(newIngredient);
    }

    useEffect(() => {
        const getIngredientsAisles = async () => {
            const response = await getAllIngredients();
            const ingredientNames = response.map((ingredient) => ingredient.name);
            const aisleNames = Array.from(new Set(response.map((ingredient) => ingredient.aisle)));
            // setAllAisles(aisleNames);
            setAllAisles(["Fruit", "Dairy"]);
            setAllIngredients(ingredientNames);
        };

        getIngredientsAisles();
    },[])



    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div>
                    <h3>
                        Add Ingredient
                    </h3>

                    <div className="addIngredientForm">
                        <div className='addIngredientRow'>
                            <label>Quantity:</label>
                            <TextField
                                value={newIngredient.quantity}
                                onChange={(e) => handleInputChange("quantity", e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        width: "75px",
                                        border: "2px solid #b0dbb2",
                                        borderRadius: "10px",
                                        "& fieldset": { border: "none" },
                                        "&:hover fieldset": { border: "none" },
                                        "&.Mui-focused fieldset": { border: "none" },
                                        padding: "5px",
                                    },
                                }}
                            />

                        </div>
                        <div className='addIngredientRow'>
                            <label>Unit:</label>
                            <TextField
                                value={newIngredient.unit}
                                onChange={(e) => handleInputChange("unit", e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        width: "75px",
                                        border: "2px solid #b0dbb2",
                                        borderRadius: "10px",
                                        "& fieldset": { border: "none" },
                                        "&:hover fieldset": { border: "none" },
                                        "&.Mui-focused fieldset": { border: "none" },
                                        padding: "5px",
                                    },
                                }}
                            />

                        </div>
                        <div className='addIngredientRow'>
                            <label>Ingredient name:</label>
                            <Autocomplete
                                id="tags-outlined"
                                options={allIngredients.map((option) => option)}
                                freeSolo
                                onInputChange={(event, newValue) => handleInputChange("name", newValue)}
                                renderTags={() => null}
                                renderInput={(params) => (
                                    <TextField
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                height: "40px",
                                                width: "150px",
                                                border: "2px solid #b0dbb2",
                                                borderRadius: "10px",
                                                "& fieldset": { border: "none" },
                                                "&:hover fieldset": { border: "none" },
                                                "&.Mui-focused fieldset": { border: "none" },
                                                padding: "5px",
                                            },
                                        }}
                                        {...params}
                                    />
                                )}
                            />
                        </div>

                        <div className='addIngredientRow'>
                            <label>Grocery Aisle</label>
                            <Autocomplete
                                id="tags-outlined"
                                options={allAisles.map((option) => option)}
                                onInputChange={(event, newValue) => handleInputChange("aisle", newValue)}
                                freeSolo
                                renderTags={() => null}
                                renderInput={(params) => (
                                    <TextField
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                height: "40px",
                                                width: "150px",
                                                border: "2px solid #b0dbb2",
                                                borderRadius: "10px",
                                                "& fieldset": { border: "none" },
                                                "&:hover fieldset": { border: "none" },
                                                "&.Mui-focused fieldset": { border: "none" },
                                                padding: "5px",
                                            },
                                        }}
                                        {...params}
                                    />
                                )}
                            />
                        </div>

                    </div>



                </div>
                <Button variant="contained"
                    sx={{
                        backgroundColor: '#6bb2f4',
                        color: 'white',
                        borderRadius: '10px'
                    }}
                    onClick={sendIngredientToParent}>Done</Button>
            </Box>
        </Modal>
    );
}

export default AddIngredientModal;
