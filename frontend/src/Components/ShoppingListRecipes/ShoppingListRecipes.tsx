import React, { useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Checkbox, Typography, Button, useMediaQuery } from '@mui/material';
import { useAuth } from '../../api/useAuth';
import { getAisles, addAisle } from '../../api/aisles';
import { updateIngredientAisle } from '../../api/recipeIngredientApi';
import { deleteRecipes, getShoppingList } from '../../api/shoppingList';

function ShoppingListRecipes({ removeRecipes }) {
    const [checked, setChecked] = useState<number[]>([]);
    const [isAnyChecked, setIsAnyChecked] = useState(false);
    const { isAuthenticated, username, user_id } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    const getShoppingListRecipes = async() => {
        const recipes = await getShoppingList(user_id, "recipes");
        setRecipes(recipes);
    }
    useEffect(()=>{
        console.log(checked.length);
        setIsAnyChecked(checked.length>0);
    },[checked])

    useEffect(()=>{
        if (!user_id){
            return
        }
        getShoppingListRecipes();
    }, [user_id, refreshTrigger])

    const handleToggle = (recipeId: number) => {
        const currentIndex = checked.indexOf(recipeId);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(recipeId);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const handleRemove= async ()=> {
        if (!user_id){
            return
        }
        const resp = await deleteRecipes(checked, user_id);
        setRefreshTrigger(prev => !prev);
        setChecked([]);
        removeRecipes();
    }
    return (
        <Box sx={{
            width: '250px',
            maxWidth: 360,
            backgroundColor: 'white',
            height: '500px',
            borderRadius: '10px',
            marginRight: "50px",
            display: "flex",
            flexDirection: "column",
            border: "3px solid #38793b",
        }}>
            <Typography
                variant="h6"
                sx={{ marginTop: '10px', fontWeight: "bold", width: '100%', textAlign: "center", borderBottom: '2px solid #38793b' }}
            >
                Recipes
            </Typography>

            <List sx={{
                flexGrow: 1,
                overflowY: "auto",
                paddingLeft: '5px',
                paddingRight: '5px',
            }}>
                {recipes.map((value, index) => {
                    const labelId = `checkbox-list-label-${value.id}`;

                    return (
                        <ListItem key={value.id} disablePadding
                            sx={{
                                borderBottom: "1px solid #ccc",
                            }}
                        >
                            <ListItemButton role={undefined} onClick={() => handleToggle(value.id)} dense>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={checked.includes(value.id)}
                                        tabIndex={-1}
                                        disableRipple
                                        size={"small"}
                                        sx={{
                                            color: "#38793b",
                                            "&.Mui-checked": {
                                                color: "#38793b",
                                            },
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    id={labelId}
                                    primary={
                                        <Typography sx={{ fontSize: "18px" }}>{value.name}</Typography>  // Increase text size
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Button stays at the bottom */}
            {checked.length > 0 && (
                <Button
                    variant="contained"
                    sx={{
                        width: '100%',
                        marginTop: 'auto',
                        backgroundColor: 'red',
                        color: 'white'
                    }}
                onClick={handleRemove}
                >
                    Remove
                </Button>
            )}
        </Box>
    )
}

export default ShoppingListRecipes;