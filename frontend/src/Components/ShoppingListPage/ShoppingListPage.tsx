import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from 'react';
import AisleModal from '../AisleModal/AisleModal';
import './ShoppingListPage.css';
import { deleteRecipes, getShoppingList } from '../../api/shoppingList';
import { useAuth } from '../../api/useAuth';
import { Ingredient, Recipe, RecipeStep } from '../../Models/models';

import { Accordion, AccordionDetails, AccordionSummary, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Checkbox, Typography, Button } from '@mui/material';


const blankStep: RecipeStep = {
  id: -1,
  step_number: 1,
  description: "",
  recipe: -1
}

const blankRecipe: Recipe = {
  id: -1,
  name: "Something",
  cook_time: 0,
  prep_time: 0,
  total_time: 0,
  main_ingredient: "Main Ingredient",
  ingredients: [],
  steps: [blankStep],
  image_url: "",
};

function ShoppingListPage() {
  const [openAisleModal, setOpenAisleModal] = useState(false);
  const { isAuthenticated, username, user_id } = useAuth();
  const [shoppingListData, setShoppingListData] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [selectedAisle, setSelectedAisle] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [aisleData, setAisleData] = useState([]);

  const [checked, setChecked] = useState<number[]>([]);

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

  const isAnyChecked = checked.length > 0;


  useEffect(() => {
    const getShoppingData = async () => {
      if (!user_id) return;
      const data = await getShoppingList(user_id, "aisleIngredients");
      setShoppingListData(data);

      const recipes = await getShoppingList(user_id, "recipes");
      setRecipes(recipes);
    }

    getShoppingData();
  }, [user_id, refreshTrigger])


  const handleOpenAisleModal = (ingredient: Ingredient, aisle_name: string) => {
    setSelectedIngredient(ingredient);
    setSelectedAisle(aisle_name);
    setOpenAisleModal(true);
  };

  const handleCloseAisleModal = () => {
    setOpenAisleModal(false);
    setSelectedAisle(null);
    setSelectedIngredient(null);
  };

  useEffect(() => {
    // Update aisleData whenever shoppingListData changes
    if (shoppingListData.length > 0) {
      const updatedShoppingListData = shoppingListData.map((aisle) => ({
        ...aisle,
        items: aisle.items.map((item) => ({
          ...item,
          checked: false,
        })),
      }));
      setAisleData(updatedShoppingListData);
    }
  }, [shoppingListData]);

  // const [aisleData, setAisleData] = useState(updatedShoppingListData);
  const handleCheckChange = (aisleIndex: number, itemIndex: number) => {
    const updatedAisleData = [...aisleData];
    updatedAisleData[aisleIndex].items[itemIndex].checked =
      !updatedAisleData[aisleIndex].items[itemIndex].checked;
    setAisleData(updatedAisleData); // Update the state with new checked values
  };

  const handleEditAisleIngredient = () => {
    setRefreshTrigger(prev => !prev); // Toggle the value to trigger the effect
  };

  const handleDeleteRecipe = (recipeId: number) => {
    // Filter out the recipe by id
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    setRecipes(updatedRecipes); // Assuming you are using state for recipes
  };

  const removeRecipes = async () => {
    const resp = await deleteRecipes(checked, user_id);
    console.log(resp);
    setRefreshTrigger(prev => !prev);
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    ><Box sx={{
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
        {/* Title */}
        <Typography
          variant="h6"
          sx={{ marginTop: '10px', fontWeight: "bold", width: '100%', textAlign: "center" }}
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
                      <Typography sx = {{fontSize:"18px"}}>{value.name}</Typography>  // Increase text size
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Button stays at the bottom */}
        {isAnyChecked && (
          <Button
            variant="contained"
            sx={{
              width: '100%',
              marginTop: 'auto',
              backgroundColor: 'red',
              color: 'white'
            }}
            onClick={removeRecipes}
          >
            Remove
          </Button>
        )}
      </Box>

      {/* Right Side - Accordion */}
      <Box
        sx={{
          width: "700px",
        }}
      >
        {aisleData.map((aisle, index) => (
          <Accordion
            key={index}
            sx={{
              overflow: "hidden",
              "&:not(:last-child)": {
                marginBottom: "1px",
              },
              "&:first-of-type": {
                borderRadius: "10px 10px 0 0",
              },
              "&:last-of-type": {
                borderRadius: aisleData.length === 1 ? "10px 10px 0 0" : "0 0 10px 10px",
              },
              "&.Mui-expanded": {
                borderRadius: "10px",
              },
              boxShadow: "0px 3px 7px #38793b",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#38793b" }} />}
              sx={{
                backgroundColor: "#b0dbb2",
                color: "black",
                borderRadius:
                  index === 0 // First Accordion
                    ? "10px 10px 0 0"
                    : index === aisleData.length - 1
                      ? "0 0 10px 10px" // Last Accordion (rounded bottom)
                      : "0px", // Middle Accordions (no border radius)
                "&.Mui-expanded": {
                  borderRadius:
                    index === 0
                      ? "10px 10px 0 0" // First Accordion (expanded state, rounded top)
                      : index === aisleData.length - 1
                        ? "0 0 10px 10px" // Last Accordion (expanded state, rounded bottom)
                        : "10px",
                },
              }}
            >
              <Typography>{aisle.aisle}</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                borderRadius: index === aisleData.length - 1 ? "0 0 10px 10px" : "0",
              }}
            >
              <Box key={index}>
                {aisle.items.map((item, itemIndex) => (
                  <Box
                    key={itemIndex}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Checkbox
                      size={"small"}
                      sx={{
                        color: "#38793b",
                        "&.Mui-checked": {
                          color: "#38793b",
                        },
                      }}
                      checked={item.checked || false}
                      onChange={() => handleCheckChange(index, itemIndex)}
                    />
                    <Typography
                      sx={{
                        flexGrow: 1,
                        marginLeft: "5px",
                        textDecoration: item.checked ? "line-through" : "none",
                        color: item.checked ? "gray" : "initial",
                      }}
                    >
                      {item.name}
                    </Typography>

                    <Typography
                      sx={{
                        marginRight: "10px",
                        textDecoration: item.checked ? "line-through" : "none",
                        color: item.checked ? "gray" : "initial",
                      }}
                    >
                      {`${item.quantity} ${item.unit}`}
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#d2d2d2",
                        color: "black",
                        borderRadius: "10px",
                        padding: "5px",
                      }}
                      onClick={() => handleOpenAisleModal(item, aisle.aisle)}
                    >
                      Move
                    </Button>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {selectedIngredient && (
        <AisleModal
          onEditAisle={handleEditAisleIngredient}
          open={openAisleModal}
          onClose={handleCloseAisleModal}
          ingredient={selectedIngredient}
          aisle_name={selectedAisle}
        />
      )}
    </Box>


  );
}

export default ShoppingListPage;
