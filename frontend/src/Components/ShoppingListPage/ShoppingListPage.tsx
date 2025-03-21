import { Accordion, AccordionDetails, AccordionSummary, Typography, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Checkbox from '@mui/material/Checkbox';
import { useEffect, useState } from 'react';
import AisleModal from '../AisleModal/AisleModal';
import './ShoppingListPage.css';

const ShoppingListData = [
  {
    aisle: "Dairy",
    items: [
      { ingredient: "Milk", quantity: "1 gallon" },
      { ingredient: "Cheese", quantity: "200g" }
    ]
  },
  {
    aisle: "Produce",
    items: [
      { ingredient: "Apple", quantity: "6 pcs" },
      { ingredient: "Banana", quantity: "5 pcs" }
    ]
  },
  {
    aisle: "Grains",
    items: [
      { ingredient: "Bread", quantity: "1 loaf" },
      { ingredient: "Rice", quantity: "2 lbs" }
    ]
  },
  {
    aisle: "Proteins",
    items: [
      { ingredient: "Chicken Breast", quantity: "4 fillets" },
      { ingredient: "Eggs", quantity: "12 pcs" }
    ]
  },
  {
    aisle: "Snacks",
    items: [
      { ingredient: "Almonds", quantity: "1 bag" },
      { ingredient: "Granola Bar", quantity: "5 bars" }
    ]
  }
];


function ShoppingListPage() {
  const [openAisleModal, setOpenAisleModal] = useState(false);

  const handleOpenAisleModal = (ingredient) => {
    setSelectedIngredient(ingredient);
    setOpenAisleModal(true);
  };

  const handleCloseAisleModal = () => {
    setOpenAisleModal(false);
    setSelectedIngredient(null);
  };

  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);

  // TODO: Get all the recipe aisles
  const updatedShoppingListData = ShoppingListData.map(aisle => ({
    ...aisle,
    items: aisle.items.map(item => ({
      ...item,
      checked: false, // Default value for `checked` is false
    })),
  }));
  const [aisleData, setAisleData] = useState(updatedShoppingListData);
  const handleCheckChange = (aisleIndex: number, itemIndex: number) => {
    const updatedAisleData = [...aisleData];
    updatedAisleData[aisleIndex].items[itemIndex].checked =
      !updatedAisleData[aisleIndex].items[itemIndex].checked;
    setAisleData(updatedAisleData); // Update the state with new checked values
  };

  const handleEditAisleIngredient = (ingredientName: string, newAisle: string) => {
    setAisleData((prevAisleData) => {
      let ingredientToMove = null;

      // Find and remove the ingredient from  current aisle
      const updatedAisleData = prevAisleData.map((aisle) => {
        const filteredItems = aisle.items.filter((item) => {
          if (item.ingredient === ingredientName) {
            ingredientToMove = item; 
            return false; // remove from list
          }
          return true;
        });

        return { ...aisle, items: filteredItems };
      });

      // If ingredient exists, add to the new aisle
      if (ingredientToMove) {
        // Check if the new aisle already exists
        const aisleExists = updatedAisleData.some((aisle) => aisle.aisle === newAisle);

        if (aisleExists) {
          // Add ingredient to the existing aisle
          return updatedAisleData.map((aisle) => {
            if (aisle.aisle === newAisle) {
              return {
                ...aisle,
                items: [...aisle.items, ingredientToMove], // Append ingredient
              };
            }
            return aisle;
          });
        } else {
          // Create a new aisle with the ingredient
          const newAisleObj = {
            aisle: newAisle,
            items: [ingredientToMove],
          };

          return [...updatedAisleData, newAisleObj]; 
        }
      }

      return updatedAisleData; 
    });
  };


  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%"
      }}
    >
      <Box
        sx={{
          width: "700px",
        }}>
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
                borderRadius: "0 0 10px 10px",
              },
              "&.Mui-expanded": {
                borderRadius: "10px",
              },
              boxShadow: "0px 3px 7px #38793b"

            }
            }
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{
                color: "#38793b"
              }}
              />}
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
                borderRadius:
                  index === aisleData.length - 1 // Last Accordion
                    ? "0 0 10px 10px"
                    : "0",
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
                      size={'small'}
                      sx={{
                        color: '#38793b',
                        '&.Mui-checked': {
                          color: '#38793b',
                        },
                      }}
                      checked={item.checked || false}
                      onChange={() => handleCheckChange(index, itemIndex)}
                    />
                    <Typography sx={{
                      flexGrow: 1,
                      marginLeft: '5px',
                      textDecoration: item.checked ? 'line-through' : 'none',
                      color: item.checked ? 'gray' : 'initial'
                    }}>{item.ingredient}</Typography>
                    <Typography sx={{
                      marginRight: "10px",
                      textDecoration: item.checked ? 'line-through' : 'none',
                      color: item.checked ? 'gray' : 'initial'
                    }}>{item.quantity}</Typography>
                    <button onClick={() => handleOpenAisleModal(item.ingredient)}>Move</button>

                  </Box>
                ))}
              </Box>

            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <AisleModal
        onEditAisle={handleEditAisleIngredient}
        open={openAisleModal}
        onClose={handleCloseAisleModal}
        ingredient={selectedIngredient}
      ></AisleModal>
    </Box>

  );
}

export default ShoppingListPage;
