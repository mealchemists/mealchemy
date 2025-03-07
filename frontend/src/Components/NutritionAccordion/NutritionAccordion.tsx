import React from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Typography, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const nutritionalData = [
  { name: 'Calories', value: '250 kcal' },
  { name: 'Protein', value: '15g' },
  { name: 'Carbs', value: '30g' },
  { name: 'Fats', value: '10g' },
  { name: 'Fiber', value: '5g' }
]

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Total']

const NutritionalAccordion = () => {
  return (
    <Box
    sx = {{
      width:"600px"
    }}>
      {daysOfWeek.map((day, index) => (
        <Accordion key={day}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{day}</Typography>
          </AccordionSummary>
          <AccordionDetails>
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
