import React, { useState } from 'react';
import { Recipe, RecipeIngredient } from "../../Models/models";
import { Autocomplete, Box, Button, InputAdornment, Modal, TextField, Typography, useMediaQuery } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import {
    pollRecipeIngredients,
    postRecipePDF,
    postRecipeUrl,
} from "../../api/recipes";
import { toast } from 'react-toastify';
import './AddRecipeModal.css'
import RecipeContent from "../RecipeContent/RecipeContent";
import axios, { AxiosResponse } from 'axios';

interface ProducerResponse {
    message: string;
}

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

function AddRecipeModal({
    addRecipeFormat,
    open,
    onClose,
    onAddRecipe,
    recipeIngredients,
    recipeExtractor
}) {
    const [newRecipe, setNewRecipe] = useState<Recipe>(null);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [recipeUrl, setRecipeUrl] = useState("");
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
        borderRadius: '10px'
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    // Usage example
    const startProcess = async (url) => {
        try {
            //   await postRecipeUrl(url);
            const extractedRecipes = recipeIngredients.filter(
                (ri) => ri.added_by_extractor == true
            );
            await pollRecipeIngredients(extractedRecipes.length);
            recipeExtractor()
        } catch (error) {
            console.error("Process failed:", error);
        }
    };

    const addByUrl = async () => {
        let message: string;

        try {
            const response: AxiosResponse<ProducerResponse> = await postRecipeUrl(recipeUrl);
            message = response?.data.message;
            console.log(message);
            toast.info(message);
            await startProcess(recipeUrl);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.error || "Failed to send recipe URL!"

                if (error.response?.status === 503) {
                    toast.error(message);
                }
            }
        }
    };

    const addByPDF = async () => {
        let message: string;

        try {
            const response: AxiosResponse<ProducerResponse> = await postRecipePDF(selectedFile);
            message = response?.data.message;
            toast.info(message)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.error || "Failed to send recipe PDF!"

                if (error.response?.status === 503) {
                    toast.error(message);
                }
            }
        }
    };

    const sendRecipeToParent = () => {
        if (addRecipeFormat) {
            addByPDF();
        } else {
            addByUrl();
        }
        onAddRecipe(newRecipe);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div>
                    <h3 className='addRecipeTitle'>
                        Add Recipe
                    </h3>

                    <p className='addRecipeSubTitle'>
                        Extracted data may miss details from time to time.<br />
                        Please make sure to verify measurements, instructions, cook/prep times, and ingredients after use.
                    </p>

                    {addRecipeFormat === 1 ? (
                        <p className='addRecipeInformation'>
                            For best accuracy:<br />
                            - Use <strong>clear typed text</strong> (not handwritten) recipes
                            <br />
                            - Ensure <strong>good contrast</strong> between text and background
                            <br />
                            - Avoid shadows/glare in scanned documents
                        </p>
                    ) : (
                        <p className='addRecipeInformation'>
                            Results may vary per website. Make sure that the website does not require a login/subscription.
                        </p>
                    )}

                    {addRecipeFormat === 0 && (
                        <div className="addRecipeUrl">
                            <label>Recipe URL:</label>
                            <TextField
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        width: "100%",
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


                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>

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
            </Box>
        </Modal>
    );
}

export default AddRecipeModal;
