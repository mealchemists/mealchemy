import { Autocomplete, Box, Button, InputAdornment, Modal, TextField, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAllIngredients } from '../../api/recipeIngredientApi';


function EditTagModal({ mainIngredient = '', cookTime = '0', prepTime = '0', onApplyTagChanges, open, onClose }) {
    // Temporary variables for edit tag modal
    const [tempMainIngredient, setTempMainIngredient] = useState(mainIngredient);
    const [tempCookTime, setTempCookTime] = useState(cookTime);
    const [tempPrepTime, setTempPrepTime] = useState(prepTime);
    const [tempTotalTime, setTempTotalTime] = useState(0);
    const [allIngredients, setAllIngredients] = useState([]);

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

    useEffect(() => {
        const cook = parseInt(tempCookTime || "0", 10);
        const prep = parseInt(tempPrepTime || "0", 10);
        setTempTotalTime(cook + prep);
    }, [tempCookTime, tempPrepTime]);

    const sendTagsToParent = () => {
        // TODO: check if tempMainIngredient exists in database, if not, add to database
        onApplyTagChanges(tempMainIngredient, tempCookTime, tempPrepTime, tempTotalTime);
    }
    useEffect(() => {
        const getIngredients = async () => {
            const response = await getAllIngredients();
            const ingredientNames = response.map((ingredient) => ingredient.name);
            setAllIngredients(ingredientNames);
        };

        getIngredients();
    }, [])



    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div>
                    <h3 style={{ textAlign: "center" }}>
                        Edit Tags
                    </h3>
                    <div className="editModalContentContainer">
                        {/* Key Ingredient */}
                        <div className="editModalInputRow">
                            <label>Key Ingredient:</label>
                            <Autocomplete
                                id="tags-outlined"
                                options={allIngredients.map((option) => option)}
                                value={tempMainIngredient}
                                inputValue={tempMainIngredient || ""}
                                onInputChange={(event, newInputValue) => setTempMainIngredient(newInputValue)}
                                onChange={(event, newValue) => {
                                    if (newValue === null) {
                                        // Check if there's any text in the input field before clearing
                                        if (!tempMainIngredient.trim()) {
                                            setTempMainIngredient(""); // Clear if empty
                                        }
                                    } else {
                                        setTempMainIngredient(newValue);
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

                        {/* Cook Time */}
                        <div className="editModalInputRow">
                            <label>Cook Time:</label>
                            <TextField
                                value={tempCookTime || ""}
                                onChange={(e) => {
                                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                                    setTempCookTime(onlyNumbers);
                                }
                                }
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        width: "150px",
                                        border: "2px solid #b0dbb2",
                                        borderRadius: "10px",
                                        "& fieldset": { border: "none" },
                                        "&:hover fieldset": { border: "none" },
                                        "&.Mui-focused fieldset": { border: "none" },
                                    },
                                }}
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="end">min(s)</InputAdornment>,
                                    },
                                }}
                            />
                        </div>

                        {/* Preparation Time */}
                        <div className="editModalInputRow">
                            <label>Preparation Time:</label>
                            <TextField
                                value={tempPrepTime || ""}
                                onChange={(e) => {
                                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                                    setTempPrepTime(onlyNumbers);
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        width: "150px",
                                        border: "2px solid #b0dbb2",
                                        borderRadius: "10px",
                                        "& fieldset": { border: "none" },
                                        "&:hover fieldset": { border: "none" },
                                        "&.Mui-focused fieldset": { border: "none" },
                                    },
                                }}
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="end">min(s)</InputAdornment>,
                                    },
                                }}
                            />
                        </div>

                        {/* Total Time */}
                        <div className="editModalInputRow">
                            <label>Total Time:</label>
                            <TextField
                                value={tempTotalTime}
                                disabled
                                type="number"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        width: "150px",
                                        border: "2px solid #b0dbb2",
                                        borderRadius: "10px",
                                        "& fieldset": { border: "none" },
                                        "&:hover fieldset": { border: "none" },
                                        "&.Mui-focused fieldset": { border: "none" },
                                        "&.Mui-disabled": {
                                            backgroundColor: "#f0f0f0",
                                            color: "rgba(0, 0, 0, 0.5)",
                                            WebkitTextFillColor: "rgba(0, 0, 0, 0.5)",
                                        },
                                    },
                                }}
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="end" sx={{ fontSize: "20px" }}>min(s)</InputAdornment>,
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                    <Button variant="contained"
                        sx={{
                            backgroundColor: '#6bb2f4',
                            color: 'white',
                            borderRadius: '10px'

                        }} onClick={sendTagsToParent}>
                        Done
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default EditTagModal;