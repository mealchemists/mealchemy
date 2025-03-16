import { Accordion, AccordionDetails, AccordionSummary, Typography, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
    // TODO: Get all the recipe aisles
   
    return (
        <Box
        sx={{
          width: "600px",
        }}>
        {ShoppingListData.map((aisle, index) => (
          <Accordion
            key={index}
            sx={{
              borderRadius:
                index === 0 // First Accordion
                  ? "10px 10px 0 0"
                  : index === ShoppingListData.length - 1 // Last Accordion
                    ? "0 0 10px 10px"
                    : "0", // Middle Accordions (no border radius)
              overflow: "hidden", // Ensure child elements don't overflow the rounded corners
              "&:not(:last-child)": {
                marginBottom: "1px", // Add a small gap between Accordions (optional)
              },
              "&:first-of-type": {
                borderRadius: "10px 10px 0 0", // Apply border-radius to the first Accordion
              },
              "&:last-of-type": {
                borderRadius: "0 0 10px 10px", // Apply border-radius to the first Accordion
              },
              "&.Mui-expanded": {
              borderRadius: "10px", // Apply border radius when expanded (for middle Accordions)
            },
            boxShadow: "0px 3px 7px #38793b"
                    }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx = {{
                color: "#38793b"
              }}
              />}
              sx={{
                backgroundColor: "#b0dbb2",
                color: "black",
                borderRadius:
                  index === 0 // First Accordion
                    ? "10px 10px 0 0"
                    : index === ShoppingListData.length - 1 && "0 0 0 0", // Last Accordion (no top radius)
                "&.Mui-expanded": {
                  borderRadius:
                    index === 0 // First Accordion (expanded state)
                      ? "10px 10px 0 0"
                      : index === ShoppingListData.length - 1 && "0 0 0 0", // Last Accordion (expanded state)
                },
              }}
            >
              <Typography>{aisle.aisle}</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                borderRadius:
                  index === ShoppingListData.length - 1 // Last Accordion
                    ? "0 0 10px 10px"
                    : "0", // Middle Accordions (no border radius)
              }}
            >
              <Box>
                {aisle.items.map((item, i) => (
                  <Box key={i} display="flex" justifyContent="space-between" mb={1}>
                    <Typography>{item.ingredient}</Typography>
                    <Typography>{item.quantity}</Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
}

export default ShoppingListPage;
