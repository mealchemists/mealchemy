import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from 'react';
import AisleModal from '../AisleModal/AisleModal';
import './ShoppingListPage.css';
import { deleteRecipes, getShoppingList } from '../../api/shoppingList';
import { useAuth } from '../../api/useAuth';
import { Ingredient, Recipe, RecipeStep } from '../../Models/models';
import { Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingListRecipes from '../ShoppingListRecipes/ShoppingListRecipes';
import { Accordion, AccordionDetails, AccordionSummary, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Checkbox, Typography, Button, useMediaQuery } from '@mui/material';


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
  const [aisleData, setAisleData] = useState([]);

  // const [checked, setChecked] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:800px)");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const getShoppingData = async () => {
    if (!user_id) return;
    const data = await getShoppingList(user_id, "aisleIngredients");
    console.log(data);
    setShoppingListData(data);
  }

  useEffect(() => {
    getShoppingData();
  }, [user_id, refreshTrigger])


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
    }else{
      setAisleData([]);
    }
  }, [shoppingListData]);

  const handleOpenAisleModal = (ingredient: Ingredient, aisle_name: string) => {
    setSelectedIngredient(ingredient);
    setSelectedAisle(aisle_name);
    setOpenAisleModal(true);
  };

  const handleCloseAisleModal = () => {
    setRefreshTrigger(prev => !prev);
    setOpenAisleModal(false);
    setSelectedAisle(null);
    setSelectedIngredient(null);
  };


  const handleCheckChange = (aisleIndex: number, itemIndex: number) => {
    const updatedAisleData = [...aisleData];
    updatedAisleData[aisleIndex].items[itemIndex].checked =
      !updatedAisleData[aisleIndex].items[itemIndex].checked;
    setAisleData(updatedAisleData); // Update the state with new checked values
  };

  const removeRecipes = async () => {
    setRefreshTrigger(prev => !prev);
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {isMobile && (
        <IconButton onClick={toggleSidebar} className="menuButton">
          <MenuIcon fontSize="large" />
        </IconButton>
      )}

      {!isMobile ? (
        <ShoppingListRecipes removeRecipes={removeRecipes}></ShoppingListRecipes>
      ) : (
        <Drawer anchor="left" open={isSidebarOpen} onClose={toggleSidebar}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: '#f8f8f8' // Ensure it's a valid hex color
              }
            }
          }}
        >

        </Drawer>
      )}
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
                      ? "0 0 10px 10px"
                      : "0px",
                "&.Mui-expanded": {
                  borderRadius:
                    index === 0
                      ? "10px 10px 0 0"
                      : index === aisleData.length - 1
                        ? "0 0 10px 10px"
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
          open={openAisleModal}
          onClose={handleCloseAisleModal}
          ingredient={selectedIngredient}
        />
      )}
    </Box>


  );
}

export default ShoppingListPage;
