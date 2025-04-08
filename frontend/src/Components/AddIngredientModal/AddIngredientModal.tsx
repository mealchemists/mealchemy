import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, InputAdornment, Modal, TextField, useMediaQuery, MenuItem } from '@mui/material';
import { Ingredient, Unit } from '../../Models/models';
import { getAllIngredients } from '../../api/recipeIngredientApi';
import './AddIngredientModal.css';
import { getAisles } from '../../api/aisles';
import { useAuth } from '../../api/useAuth';



const blankRecipe1 = {
    id: -1,
    name: "",
    quantity: 0,
    unit: Unit.Gram,
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
    const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
    const [allAisles, setAllAisles] = useState([]);
    const { isAuthenticated, username, user_id } = useAuth();
    const [isAisleDisabled, setIsAisleDisabled] = useState(false);
    const isMobile = useMediaQuery("(max-width:800px)");

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? 300 : 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        borderRadius: '10px',
    };
    const handleInputChange = (field: string, value: string) => {
        if (field === "name") {
            // Check if the name exists in allIngredients
            const ingredient = allIngredients.find(ingredient => ingredient.name.toLowerCase() === value.toLowerCase());

            if (ingredient) {
                // If ingredient exists, set the whole object to newIngredient
                setNewIngredient((prev) => ({
                    ...prev,
                    ...ingredient,
                }));

                setIsAisleDisabled(true);
            } else {
                setIsAisleDisabled(false);

                // Update only the "name" field if it's a new ingredient
                setNewIngredient((prev) => ({
                    ...prev,
                    [field]: value,
                }));
            }
        } else {
            setNewIngredient((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };


    const sendIngredientToParent = () => {
        console.log(newIngredient);
        onAddIngredient(newIngredient);
        setNewIngredient(blankRecipe1);
    }

    useEffect(() => {
        const getIngredientsAisles = async () => {
            if (!user_id) {
                return
            }
            const ingredientData = await getAllIngredients();
            const aisleData = await getAisles(user_id);
            const aisleNames = aisleData.map((aisle) => aisle.name);
            setAllAisles(aisleNames);
            setAllIngredients(ingredientData);
        };

        getIngredientsAisles();
    }, [user_id])



    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div>
                    <h3 className='addIngredientTitle'>
                        Add Ingredient
                    </h3>

                    <div className="addIngredientForm">
                        <div className='addIngredientRow'>
                            <label>Quantity:</label>
                            <TextField
                                value={newIngredient.quantity}
                                onChange={(e) => handleInputChange("quantity", e.target.value.replace(/\D/g, ""))}
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
                                select
                                value={newIngredient.unit}
                                onChange={(e) => handleInputChange("unit", e.target.value)}

                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        width: "100px",

                                        border: "2px solid #b0dbb2",
                                        borderRadius: "10px",
                                        "& fieldset": { border: "none" },

                                        "&:hover fieldset": { border: "none" },

                                        "&.Mui-focused fieldset": { border: "none" },
                                        padding: "5px",
                                    },
                                }}

                            >
                                {Object.entries(Unit).map(([label, value]) => (
                                    <MenuItem key={value} value={value}>
                                        {value === Unit.None ? <em>&lt;No unit&gt;</em> : value}
                                    </MenuItem>
                                ))}
                            </TextField>

                        </div>
                        <div className='addIngredientRow'>
                            <label>Ingredient name:</label>
                            <Autocomplete
                                id="tags-outlined"
                                options={allIngredients.map((option) => option.name)}
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

                        {!isAisleDisabled && (
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
                        )}
                    </div>




                </div>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#6bb2f4',
                            color: 'white',
                            borderRadius: '10px'
                        }}
                        onClick={sendIngredientToParent}
                    >
                        Done
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

export default AddIngredientModal;
