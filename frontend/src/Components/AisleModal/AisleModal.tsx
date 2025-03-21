import React, { useState } from 'react';
import { Autocomplete, Box, Button, InputAdornment, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';

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


function AisleModal({ open, onClose, onEditAisle, ingredient }) {
    const [newAisle, setNewAisle] = useState<string>("");

    const sendIngredientToParent = () => {
        console.log(newAisle);
        onEditAisle(ingredient, newAisle);
        onClose();
    }

    // TODO: get existing aisles
    const aislenames = ["Dairy", "Produce", "Grains", "Proteins", "Snacks"];
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
                        Edit {ingredient} Aisle
                    </h3>
                    <Autocomplete
                        id="tags-outlined"
                        options={aislenames.map((option) => option)}
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
                <button className="done-button" onClick={sendIngredientToParent}>Done</button>
            </Box>
        </Modal>
    );
}

export default AisleModal;
