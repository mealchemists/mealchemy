import React, { useState } from 'react';
import { Recipe } from '../../Models/models';
import { Autocomplete, Box, Button, InputAdornment, Modal, TextField, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { postRecipePDF, postRecipeUrl } from '../../api/recipes';
import { toast } from 'react-toastify';
import './AddRecipeModal.css'

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
    borderRadius:'10px'
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
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [recipeUrl, setRecipeUrl] = useState("");
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const addByUrl = async () => {
        try {
            const response = await postRecipeUrl(recipeUrl);
            toast.info('Sent recipe URL');
        } catch (error) {
            console.error(error);
        }

    }

    const addByPDF = async () => {
        try {
            const response = await postRecipePDF(selectedFile);
            toast.info('Sent recipe PDF');
        } catch (error) {
            console.error(error);
        }
    }

    const sendRecipeToParent = () => {
        if (addRecipeFormat) {
            addByPDF();
        } else {
            addByUrl();
        }
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
                    <h3 className = 'addRecipeTitle'>
                        Add Recipe
                    </h3>

                    {addRecipeFormat === 0 && (
                        <div className="addRecipeUrl">
                            <label>Recipe Url:</label>
                            <TextField
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: "40px",
                                    width: "200px",
                                    border: "2px solid #b0dbb2",
                                    borderRadius: "10px",
                                    "& fieldset": { border: "none" },
                                    "&:hover fieldset": { border: "none" },
                                    "&.Mui-focused fieldset": { border: "none" },
                                    padding: "5px",
                                },
                            }}
                                // sx={{
                                //     width: "15ch",
                                //     "& .MuiOutlinedInput-root": {
                                //         height: "40px",
                                //         "& input": { height: "100%", padding: "10px" },
                                //     },
                                // }}
                                value={(recipeUrl)}
                                onChange={(e) => setRecipeUrl(e.target.value)}
                            />
                        </div>
                    )}

                    {addRecipeFormat === 1 && (
                        <div className="addRecipePDF">
                            <label>Recipe PDF:</label>

                            {selectedFile && (
                                <div style={{ marginTop: "10px" }}>
                                    <Typography variant="body2">
                                        {selectedFile.name}
                                    </Typography>

                                </div>
                            )}
                            <Button
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}
                                sx={{
                                    width: "fit-content",
                                    backgroundColor: '#b0dbb2',
                                    color: 'black',
                                    borderRadius: '10px'
                                }}
                            >
                                Upload files
                                <VisuallyHiddenInput
                                    type="file"
                                    accept='application/pdf'
                                    onChange={handleFileChange}
                                />
                            </Button>
                        </div>
                    )}
                </div>


                <Button
                    variant="contained"
                    disabled={
                        addRecipeFormat === 0 && recipeUrl.trim() === '' ||
                        addRecipeFormat === 1 && !selectedFile
                    }
                    sx={{
                        backgroundColor: '#6bb2f4',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '10px'
                    }}
                    onClick={sendRecipeToParent}>Done</Button>
            </Box>
        </Modal>
    );
}

export default AddRecipeModal;
