import React, { useState } from 'react';
import { Recipe } from '../../Models/models';
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

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});


function AddRecipeModal({ addRecipeFormat, open, onClose, onAddRecipe }) {
    const [newRecipe, setNewRecipe] = useState<Recipe>(null);
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
        }
    };
    const sendRecipeToParent = () => {
        onAddRecipe(newRecipe);
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
                        Add Recipe
                    </h3>

                    {addRecipeFormat === 0 && (
                        <div className="addRecipeUrl">
                            <label>Recipe Url:</label>
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

                    {addRecipeFormat === 1 && (
                        <div className="addRecipePDF">
                            <label>Recipe PDF:</label>

                            {selectedFiles.length > 0 && (
                                <div style={{ marginTop: "10px" }}>
                                    {selectedFiles.map((file, index) => (
                                        <Typography key={index} variant="body2">
                                            {file.name}
                                        </Typography>
                                    ))}
                                </div>
                            )}
                            <Button
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}
                            >
                                Upload files
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={handleFileChange}
                                />
                            </Button>
                        </div>
                    )}
                </div>

                <button className = "done-button" onClick={sendRecipeToParent}>Done</button>
            </Box>
        </Modal>
    );
}

export default AddRecipeModal;
