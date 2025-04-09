import { Accordion, AccordionDetails, AccordionSummary, Typography, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import './NutritionAccordion.css';
import { MealPlanEvent } from '../../Models/models';
import moment from 'moment';

const nutrientNameMapping: { [key: string]: string } = {
  'CALORIES_ID_ATWATER': 'Calories',
  'Energy': 'Calories',
  'Protein': 'Protein',
  'Carbohydrate, by difference': 'Carbohydrates',
  'Total Sugars': 'Sugar',
  'SUGAR_ID': 'Sugar',
  'Total lipid (fat)': 'Fat',
  'Fiber, total dietary': 'Fiber',
  'Sodium, Na': 'Sodium',
};

// Function to format nutrient data from API (for readable names)
const formatNutrientName = (nutrientName: string) => {
  return nutrientNameMapping[nutrientName] || nutrientName; // Default to original if not mapped
};

const aggregateNutrients = (events: MealPlanEvent[]) => {
  const aggregatedNutrients: { [key: string]: any } = {};

  events.forEach((event) => {
    const ingredients = event.ingredients;
    const dayPlanned = event.day_planned; // e.g., "2025-04-07"

    if (!aggregatedNutrients[dayPlanned]) {
      aggregatedNutrients[dayPlanned] = {
        Calories: 0,
        Protein: 0,
        Carbohydrates: 0,
        Fat: 0,
        sugar: 0,
        fiber: 0,
        sodium: 0,
      };
    }
    ingredients.forEach((ingredient) => {
      const nutrientInfo = ingredient.nutrient_information;

      nutrientInfo.forEach((nutrientData) => {
        const nutrients = nutrientData.nutrients;
        Object.values(nutrients).forEach((nutrient) => {
          const nutrientName = nutrient.nutrient_name; // The raw nutrient name from API
          console.log("Nutrient name", nutrientName)
          console.log("Nutrient value", nutrient.value)
          const readableNutrientName = formatNutrientName(nutrientName); // Get the readable name
          console.log("readable", readableNutrientName)
          const nutrientValue = parseFloat(nutrient.value as string); // Ensure it's a number

          // Only aggregate the value if it's a valid number
          if (!isNaN(nutrientValue) && aggregatedNutrients[dayPlanned][readableNutrientName] !== undefined) {
            aggregatedNutrients[dayPlanned][readableNutrientName] += nutrientValue;
            aggregatedNutrients[dayPlanned][readableNutrientName] = Math.round(aggregatedNutrients[dayPlanned][readableNutrientName]);
          }
        });
      });
    });
  });

  return aggregatedNutrients;
};


type NutritionalAccordionProps = {
  nutritionalData: MealPlanEvent[]; // Array of MealPlanEvent
};

const NutritionalAccordion = ({ nutritionalData }: NutritionalAccordionProps) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Aggregate the nutritional data
  console.log("ventusnjok",nutritionalData)
  const aggregatedData = aggregateNutrients(nutritionalData);
  console.log(aggregatedData)



  // Format the nutrient values (e.g., adding units)
  const formatNutrient = (value: number, nutrientName: string) => {
    const nutrientUnits = {
      calories: 'Kcal',
      protein: 'g',
      fat: 'g',
      carbs: 'g',
      sugar: 'g',
      fiber: 'g',
      sodium: 'mg',
    };
    return `${value} ${nutrientUnits[nutrientName] || ''}`;
  };

return (
    <Box sx={{ width: '600px' }}>
      {daysOfWeek.map((day, index) => {
        // Find the corresponding date for the current day of the week
        const currentDate = moment().startOf('week').add(index, 'days').format('YYYY-MM-DD');
        
        // If the date exists in the aggregated data, use it
        const dayData = aggregatedData[currentDate] || {}; // If no data for that day, use empty object

        return (
          <Accordion
            key={day}
            sx={{
              borderRadius: index === 0 ? '10px 10px 0 0' : index === daysOfWeek.length - 1 ? '0 0 10px 10px' : '0',
              boxShadow: '0px 3px 7px #38793b',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#38793b' }} />}
              sx={{
                backgroundColor: '#b0dbb2',
                color: 'black',
                borderRadius: index === 0 ? '10px 10px 0 0' : index === daysOfWeek.length - 1 ? '0 0 10px 10px' : '0',
              }}
            >
              <Typography>{day}</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                borderRadius: index === daysOfWeek.length - 1 ? '0 0 10px 10px' : '0',
              }}
            >
              <Box>
                {Object.keys(dayData).map((nutrient) => (
                  <Box key={nutrient} display="flex" justifyContent="space-between" mb={1}>
                    <Typography>{nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}</Typography>
                    <Typography>{formatNutrient(dayData[nutrient], nutrient)}</Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default NutritionalAccordion;