import { Autocomplete, Box, InputAdornment, Modal, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

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

// TODO: Get from database
const allTags = [
    { title: 'Chicken' },
    { title: 'Lettuce' },
    { title: 'Corn' },
    { title: 'Beef' },
    { title: 'Pork' },
]

function EditTagModal({mainIngredient, cookTime, prepTime, onApplyTagChanges, open, onClose}) {
 // Temporary variables for edit tag modal
    const [tempMainIngredient, setTempMainIngredient] = useState(mainIngredient);
    const [tempCookTime, setTempCookTime] = useState(cookTime);
    const [tempPrepTime, setTempPrepTime] = useState(prepTime);
    const [tempTotalTime, setTempTotalTime] = useState(parseInt(cookTime, 10) + parseInt(prepTime, 10));

    useEffect(() => {
        setTempTotalTime(parseInt(tempCookTime, 10) + parseInt(tempPrepTime, 10))
    }, [tempCookTime,tempPrepTime]);

    const sendTagsToParent = ()=>{
        onApplyTagChanges(tempMainIngredient, tempCookTime, tempPrepTime, tempTotalTime);
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
                        Edit Tags
                    </h3>
                    <div className="editModalContentContainer">
                        {/* Key Ingredient */}
                        <div className="editModalInputRow">
                            <label>Key Ingredient:</label>
                            <Autocomplete
                                id="tags-outlined"
                                options={allTags.map((option) => option.title)}
                                value={tempMainIngredient}
                                onChange={(event, newValue) => setTempMainIngredient(newValue)}
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
                            <button style={{ height: "40px" }}>Add</button>
                        </div>

                        {/* Cook Time */}
                        <div className="editModalInputRow">
                            <label>Cook Time:</label>
                            <TextField
                                value={tempCookTime}
                                onChange={(e) => setTempCookTime(e.target.value.replace(/\D/g, ""))}
                                sx={{
                                    width: "15ch",
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        "& input": { height: "100%", padding: "10px" },
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
                                value={tempPrepTime}
                                onChange={(e) => setTempPrepTime(e.target.value.replace(/\D/g, ""))}
                                sx={{
                                    width: "15ch",
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        "& input": { height: "100%", padding: "10px" },
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
                                    width: "15ch",
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        "& input": { height: "100%", padding: "10px" },
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

                <button onClick={sendTagsToParent}>Done</button>
            </Box>
        </Modal>
    )
}

export default EditTagModal;