import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, InputAdornment, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import { useAuth } from '../../api/useAuth';
import { getAisles, addAisle } from '../../api/aisles';
import { updateIngredientAisle } from '../../api/recipeIngredientApi';

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
    borderRadius: "10px",
};


function AisleModal({ open, onClose, ingredient}) {
    const [newAisle, setNewAisle] = useState<string>("");
    const {isAuthenticated, username, user_id} = useAuth();
    const [allAisles, setAllAisles] = useState<string[]>([]);
    const [completeAisles, setCompleteAisles] = useState([]);
    const sendAisleToParent = async() => {
        // create new aisle
        if (!user_id){
            return 
        }
        if (!allAisles.includes(newAisle)) {
            const aisleData = await addAisle(newAisle, user_id);
            console.log("AisleData", aisleData);
            const ingredientBody = {
                ...ingredient,
                aisle:aisleData.id
            }
            await updateIngredientAisle(ingredientBody);

        } else {
            const foundItem = completeAisles.find(item => item.name === newAisle);
            // update ingredient
            const ingredientBody = {
                    ...ingredient,
                    aisle: foundItem.id
            }
            await updateIngredientAisle(ingredientBody);
        }
    
        onClose();
    }

    useEffect(() => {
        const getIngredientsAisles = async () => {
            if (!user_id){
                return
            }
            const aisleData = await getAisles(user_id);
            setCompleteAisles(aisleData);
            const aisleNames = aisleData.map((aisle)=> aisle.name);
            setAllAisles(aisleNames);
        };

        getIngredientsAisles();
    },[user_id])

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
                        Edit {ingredient.name} Aisle
                    </h3>
                    <Autocomplete
                        id="tags-outlined"
                        options={allAisles.map((option) => option)}
                        value={newAisle}
                        inputValue={newAisle || ""}
                        onInputChange={(event, newInputValue) => setNewAisle(newInputValue)}
                        onChange={(event, newValue) => {
                            if (newValue === null) {
                                // Check if there's any text in the input field before clearing
                                if (!newAisle.trim()) {
                                    setNewAisle(""); // Clear if empty
                                }
                            } else {
                                setNewAisle(newValue);
                            }
                        }}
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
                <Button variant="contained" 
                sx={{
                    backgroundColor: '#6bb2f4',
                    color: 'white',
                    borderRadius:'10px'

                }}
                 onClick={sendAisleToParent}>Done</Button>
            </Box>
        </Modal >
    );
}

export default AisleModal;
