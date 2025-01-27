import React, {useState} from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import './MealPlanningPage.css'

const localizer = momentLocalizer(moment)
const events = [
  {
    start:moment('2025-01-26T18:00:00').toDate(),
    end:moment('2025-01-26T20:00:00').toDate(),
    title:"Test"
  }
]

const CustomToolbar = ({ label, onNavigate }) => (
  <div className="rbc-toolbar">
    <div className="rbc-toolbar-label">{label}</div>
    <div className="rbc-btn-group rbc-btn-group-left">
      <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
      <button type="button" onClick={() => onNavigate('PREVIOUS')}>Back</button>
      <button type="button" onClick={() => onNavigate('NEXT')}>Next</button>
    </div>
    <div className="rbc-btn-group rbc-btn-group-right">
      <button type="button" className="add-to-shopping-list-btn">Add to Shopping List</button>
    </div>
  </div>
);

function MealPlanningPage() {
    const [myEventsList, setMyEventsList] = useState([])
return (<div className='calendarContainer'>
    <Calendar
      localizer={localizer}
      events={myEventsList}
      startAccessor="start"
      endAccessor="end"
      defaultView="week"
      min={new Date(2023, 1, 1, 0, 0)} 
      max={new Date(2023, 1, 1, 23, 59)}
      views={{ week: true }}
      components={{
        toolbar: CustomToolbar, // Apply custom toolbar
      }}
      style={{ height: '500px', width:'800px'}}
          />
  </div>)
}

export default MealPlanningPage;
