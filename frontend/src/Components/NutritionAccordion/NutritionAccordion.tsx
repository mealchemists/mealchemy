import { Accordion, AccordionDetails, AccordionSummary, Typography, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import './NutritionAccordion.css';

const nutritionalData = [
  { name: 'Calories', value: '250 kcal' },
  { name: 'Protein', value: '15g' },
  { name: 'Carbs', value: '30g' },
  { name: 'Fats', value: '10g' },
  { name: 'Fiber', value: '5g' }
]

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Total']
// FR30 - Nutrition-Details
const NutritionalAccordion = () => {
  return (
    <Box
      sx={{
        width: "600px",
      }}>
      {daysOfWeek.map((day, index) => (
        <Accordion
          key={day}
          sx={{
            borderRadius:
              index === 0 // First Accordion
                ? "10px 10px 0 0"
                : index === daysOfWeek.length - 1 // Last Accordion
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
                  : index === daysOfWeek.length - 1
                  ? "0 0 10px 10px" // Last Accordion (rounded bottom)
                  : "0px", // Middle Accordions (no border radius)
              "&.Mui-expanded": {
                borderRadius:
                  index === 0 // First Accordion (expanded state)
                    ? "10px 10px 0 0"
                    : index === daysOfWeek.length - 1
                      ? "0 0 10px 10px" // Last Accordion (expanded state, rounded bottom)
                      : "10px",
              },
            }}
          >
            <Typography>{day}</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              borderRadius:
                index === daysOfWeek.length - 1 // Last Accordion
                  ? "0 0 10px 10px"
                  : "0", // Middle Accordions (no border radius)
            }}
          >
            <Box>
              {nutritionalData.map((item, i) => (
                <Box key={i} display="flex" justifyContent="space-between" mb={1}>
                  <Typography>{item.name}</Typography>
                  <Typography>{item.value}</Typography>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

export default NutritionalAccordion
