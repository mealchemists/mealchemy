import React, { useState } from 'react';
import { Autocomplete, Box, Button, InputAdornment, Modal, TextField, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';


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



function AddIngredientModal({ addIngredientFormat, open, onClose, onAddIngredient }) {
    const [newIngredient, setNewIngredient] = useState<string>("");

    const sendIngredientToParent = () => {
        onAddIngredient(newIngredient);
    }

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

                    {addIngredientFormat === 0 && (
                        <div className="addIngredientUrl">
                            <label>Ingredient Url:</label>
                            <TextField
                                sx={{
                                    width: "15ch",
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        "& input": { height: "100%", padding: "10px" },
                                    },
                                }}
                            />
                        </div>
                    )}

                   </div> 
                <button className = "done-button" onClick={sendIngredientToParent}>Done</button>
            </Box>
        </Modal>
    );
}

export default AddIngredientModal;
