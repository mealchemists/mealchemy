import React, { useEffect, useRef, useState } from 'react';
import { Ingredient, Recipe, RecipeIngredient, RecipeStep } from '../../Models/models';
import './RecipeContent.css';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { Avatar, Button, Chip, styled, TextField, Tooltip, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import FlatwareIcon from '@mui/icons-material/Flatware';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import { toast } from 'react-toastify';

import { putRecipeIngredients, createRecipeIngredients } from '../../api/recipeIngredientApi';
import AddIngredientModal from '../AddIngredientModal/AddIngredientModal';
import EditTagModal from '../EditTagModal/EditTagModal';
import './RecipeContent.css';

const options = [
    'Edit',
    'Delete'
];

const ITEM_HEIGHT = 48;

interface RecipeContentProps {
    recipeIngredient: RecipeIngredient;
    initialEditMode?: boolean;
    exitEditMode: () => void;
    onDeleteRecipe: (recipe: RecipeIngredient) => void; 
    onUpdateRecipe: (recipe: RecipeIngredient) => void; 
}

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


const RecipeContent: React.FC<RecipeContentProps> = ({
    recipeIngredient,
    initialEditMode = false,
    exitEditMode,
    onDeleteRecipe,
    onUpdateRecipe
}) => {
    const [recipe, setRecipe] = useState(recipeIngredient.recipe)
    // 3 dot menu, edit and delete options
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editMode, setEditMode] = useState(initialEditMode);

    // Edit Tag Modal
    const [openEditTagModal, setOpenEditTagModal] = useState(false);
    const handleOpenTagModal = () => setOpenEditTagModal(true);
    const handleCloseTagModal = () => setOpenEditTagModal(false);

    // Add Ingredient Modal
    const [openAddIngredientModal, setOpenAddIngredientModal] = useState(false);
    const handleOpenIngredientModal = () => setOpenAddIngredientModal(true);
    const handleCloseIngredientModal = () => setOpenAddIngredientModal(false);

    // For tags
    const [mainIngredient, setMainIngredient] = useState(String(recipe.main_ingredient));
    const [cookTime, setCookTime] = useState(String(recipe.cook_time));
    const [prepTime, setPrepTime] = useState(String(recipe.prep_time));
    const [totalTime, setTotalTime] = useState(String(recipe.total_time));

    const [tags, setTags] = useState([mainIngredient, cookTime, prepTime, totalTime]);
    const [error, setError] = useState("");

    const [imageBase64, setImageBase64] = useState<string>(recipe.image_url);

    const isMobile = useMediaQuery("(max-width:800px)");

    const ingredientRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    setImageBase64(reader.result); // Base64 string
                }
            };
        }
    };

    const deleteRecipe = () => {
        try {
            onDeleteRecipe(recipeIngredient);
        } catch (error) {
            setError("Error fetching recipes");
            console.error("Error fetching recipes:", error);
        }
    }

    const putRecipe = async (data) => {
        try {

            const response = await putRecipeIngredients(data);
            onUpdateRecipe(data);
        } catch (error) {
            setError("Error fetching recipes");
            console.error("Error updating recipe ingredient:", error);
            return;
        }
    }

    const createRecipe = async (data) => {
        try {
            const response = await createRecipeIngredients(data);
            onUpdateRecipe(data);
        } catch (error) {
            console.error("Error creating recipe Ingredient");
            return;
        }
    }

    useEffect(() => {
        setTags([
            mainIngredient,
            String(cookTime),
            String(prepTime),
            String(totalTime)
        ]);
    }, [mainIngredient, cookTime, prepTime, totalTime]);


    // For editing the actual recipe content
    const [title, setTitle] = useState(recipe.name);
    const [ingredients, setIngredients] = useState<Ingredient[]>(recipeIngredient.ingredients);
    const [instructions, setInstructions] = useState<RecipeStep[]>(recipe.steps);
    const sortedInstructions = instructions.sort((a, b) => Number(a.step_number) - Number(b.step_number)); 


    const openOptions = Boolean(anchorEl);

    // Keep tags in sync with individual state variables
    useEffect(() => {
        setTags([mainIngredient, cookTime, prepTime, totalTime]);
    }, [mainIngredient, cookTime, prepTime, totalTime]);


    const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleOptionsClose = () => {
        setAnchorEl(null);
    };
    const handleCancel = () => {
        setEditMode(false);
        exitEditMode();
    }

    const handleOptionsSelect = (option: string) => {
        if (option === "Edit") {
            // make buttons visible
            setAnchorEl(null);
            setEditMode(true);
            handleOptionsClose();
        } else if (option == "Delete") {
            deleteRecipe();
        }
    };

    const handleApplyTagChanges = (
        tempMainIngredient: string,
        tempCookTime: number,
        tempPrepTime: number,
        tempTotalTime: number
    ) => {
        setMainIngredient(tempMainIngredient);
        setCookTime(String(tempCookTime));
        setPrepTime(String(tempPrepTime));
        setTotalTime(String(tempTotalTime));
        handleCloseTagModal();
    };

    const handleSave = async () => {
        const updatedIngredients = ingredients.map((ingredient, index) => ({
            ...ingredient,
            quantity: Number(ingredientRefs.current[index]?.value || null),
            unit: ingredientRefs.current[index + ingredients.length]?.value || "",
            display_name:ingredientRefs.current[index + ingredients.length * 2]?.value || "",
            name: ingredientRefs.current[index + ingredients.length * 2]?.value || "",
        }));

        const filteredIngredients = updatedIngredients.filter(ingredient => ingredient.name.trim() !== "" && ingredient.quantity !== null);
        const filteredInstructions = instructions.filter(instruction => instruction.description.trim() !== "");
        
        setIngredients(filteredIngredients);
        setInstructions(filteredInstructions);
        
        if (title == ""){
            toast.error("Please enter a title");
            return;
        }

        const body = {
            ...recipeIngredient,
            recipe: {
                ...recipeIngredient.recipe,
                name: title,
                main_ingredient: mainIngredient,
                cook_time: Number(cookTime),
                prep_time: Number(prepTime),
                total_time: Number(totalTime),
                image_url: imageBase64,
                steps: instructions,
            },
            ingredients: filteredIngredients
        };

        if(recipeIngredient.id != -1){
            await putRecipe(body);
        }else{
            await createRecipe(body);
        }
       
        setEditMode(false);
        exitEditMode();
    };

    const handleAddIngredient = (ingredient) => {
        const newIngredients = [...ingredients, ingredient]
        setIngredients(newIngredients); // Add an empty ingredient field

        handleCloseIngredientModal();
    };


    const handleInstructionChange = (index, value) => {
        const newInstructions = [...instructions];
        newInstructions[index] = { ...newInstructions[index], description: value };

        setInstructions(newInstructions);
    };

    const handleAddInstruction = () => {
        const newInstruction: RecipeStep = {
            id: -1,
            step_number: instructions.length + 1,
            recipe: recipeIngredient.recipe.id,
            description: "",
        };
        setInstructions([...instructions, newInstruction]);

    };

    return (
        <div className="recipeContent">
            <div className="buttonContainer">
                {editMode ? (
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#d2d2d2',
                            borderRadius: '10px',
                            color: 'black'
                        }}
                        onClick={handleCancel} autoFocus>Cancel</Button>
                ) : (
                    <IconButton
                        aria-label="more"
                        id="long-button"
                        aria-controls={openOptions ? 'long-menu' : undefined}
                        aria-expanded={openOptions ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={handleOptionsClick}
                    >
                        <MoreHorizOutlinedIcon sx={{ color: "#38793b" }} />
                    </IconButton>
                )}

                <Menu
                    id="long-menu"
                    anchorEl={anchorEl}
                    open={openOptions}
                    onClose={handleOptionsClose}
                    slotProps={{
                        paper: {
                            style: {
                                maxHeight: ITEM_HEIGHT * 4.5,
                                width: '20ch',
                            },
                        },
                    }}
                    disableEnforceFocus
                >
                    {options.map((option) => (
                        <MenuItem key={option} onClick={() => handleOptionsSelect(option)}>
                            {option}
                        </MenuItem>
                    ))}
                </Menu>

                {editMode && (
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#6bb2f4',
                            color: 'white',
                            borderRadius: '10px'
                        }}
                        onClick={() => handleSave()}>Save</Button>
                )}

            </div>

            {editMode ? (
                <TextField
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    variant="outlined"
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            fontSize: "24px", // Match h1 size
                            fontWeight: "bold",
                        },
                        "& .MuiInputBase-input": {
                            textAlign: "center",
                        },
                    }}
                />
            ) : (
                <h1>{title}</h1>
            )}
            <div className="tagContainer">
                <span className="tagLabel">Tags:</span>
                {tags.map((tag: string, index: number) => {
                    let icon = null;
                    let tooltipLabel = "";

                    if (index === 1) {
                        icon = <SoupKitchenIcon />;
                        tooltipLabel = "Cook Time";
                    }
                    if (index === 2) {
                        icon = <FlatwareIcon />;
                        tooltipLabel = "Prep Time";
                    }
                    if (index === 3) {
                        icon = <HourglassBottomIcon />;
                        tooltipLabel = "Total Time";
                    }
                    return (
                        <Tooltip key={index} title={tooltipLabel} arrow disableHoverListener={!tooltipLabel}>
                            <Chip
                                label={tag}
                                icon={icon}
                                variant="outlined"
                                sx={{
                                    color: "#38793b",
                                    backgroundColor: "#f8f8f8",
                                    fontWeight: "bold",
                                    border: "3px solid #38793b",
                                    "& .MuiChip-icon": {
                                        color: "#38793b",
                                    },
                                }}
                            />
                        </Tooltip>
                    );
                })}

                {editMode && (
                    <IconButton onClick={handleOpenTagModal}>
                        <EditIcon
                            sx={{
                                color: "#38793b",
                            }}
                        />
                    </IconButton>
                )}

            </div>
            <EditTagModal
                mainIngredient={mainIngredient}
                cookTime={cookTime}
                prepTime={prepTime}
                onApplyTagChanges={handleApplyTagChanges}
                open={openEditTagModal}
                onClose={handleCloseTagModal}
            ></EditTagModal>
            <AddIngredientModal open={openAddIngredientModal} onClose={handleCloseIngredientModal} onAddIngredient={handleAddIngredient} ></AddIngredientModal>
            <div className="imgIngredients">
                <div className='imageContainer'>
                    <Avatar
                        src={imageBase64}
                        alt={recipe.name}
                        variant="square"
                        sx={{
                            width: isMobile ? "200px":"300px",
                            height: isMobile ? "200px":"300px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isMobile ? "12rem" :"20rem",
                            backgroundColor: "#f0f0f0"
                        }}
                    >
                        <DinnerDiningIcon sx={{
                            fontSize: "inherit",
                            color: '#38793b'
                        }} />
                    </Avatar>
                    {editMode && (
                        <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={
                                <CloudUploadIcon />
                            }
                            sx={{
                                width: "fit-content",
                                backgroundColor: '#b0dbb2',
                                color: 'black',
                                borderRadius: '10px'
                            }}
                        >
                            Upload a picture
                            <VisuallyHiddenInput
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={handleFileChange}
                            />
                        </Button>
                    )}
                </div>

                <div className="ingredientContainer">

                    <h2>Ingredients</h2>
                    {editMode ? (
                        <>
                            <ul>
                                {ingredients.map((ingredient, index) => (
                                    <li key={ingredient.name}> {/* Use id as the key */}
                                        <TextField
                                            defaultValue={ingredient.quantity}
                                            variant="outlined"
                                            inputRef={(el) => (ingredientRefs.current[index] = el)}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    fontSize: "14px"
                                                },
                                                width: '50px',
                                            }}
                                        />
                                        <TextField
                                            defaultValue={ingredient.unit}
                                            variant="outlined"
                                            inputRef={(el) => (ingredientRefs.current[index + ingredients.length] = el)}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    fontSize: "14px",
                                                },
                                                width: '75px',

                                            }}
                                        />
                                        <TextField
                                            defaultValue={ingredient.name}
                                            inputRef={(el) => (ingredientRefs.current[index + ingredients.length * 2] = el)}
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    fontSize: "14px",
                                                },
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#b0dbb2',
                                    color: 'black',
                                    borderRadius: '10px'
                                }}
                                onClick={handleOpenIngredientModal}>Add Ingredient</Button>
                        </>
                    ) : (
                        <ul>
                            {ingredients.map((ingredient) => (
                                <li key={ingredient.name}>{`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="instructionContainer">
                <h2>Instructions</h2>
                <div className="instructionContent">
                    {editMode ? (
                        <>
                            <div className="instructionList">
                                <ol>
                                {sortedInstructions.map((instruction, index) => (
                                    <li key = {index}>
                                    <TextField
                                        key={index}
                                        value={instruction.description}
                                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                                        variant="outlined"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                fontSize: "14px",
                                                width: "100%",
                                            },
                                            "& .MuiInputBase-input": {
                                                width: "350px",
                                            },
                                        }}
                                    />
                                    </li>
                                ))}
                                </ol>
                            </div>

                            <div className="instructionActions">
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#b0dbb2',
                                        color: 'black',
                                        borderRadius: '10px',
                                    }}
                                    onClick={handleAddInstruction}
                                >
                                    Add Instruction
                                </Button>
                            </div>

                        </>
                    ) : (
                        <ol>
                            {sortedInstructions.map((instruction) => (
                                <li key={String(instruction.step_number)}>{instruction.description}</li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </div>
    );
    
}

export default RecipeContent;
