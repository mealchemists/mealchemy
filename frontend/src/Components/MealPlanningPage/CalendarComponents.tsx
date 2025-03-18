import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import './MealPlanningPage.css';

export const CustomToolbar = ({ label, onNavigate }) => (
    <div className="rbc-toolbar">
        <div className="rbc-toolbar-label">{label}</div>
        <div className="rbc-btn-group rbc-btn-group-left">
            <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
            <button type="button" onClick={() => onNavigate('PREV')}>Back</button>
            <button type="button" onClick={() => onNavigate('NEXT')}>Next</button>
        </div>
        <div className="rbc-btn-group rbc-btn-group-right">
            <button type="button" className="shopping-list-button">Add to Shopping List</button>
        </div>
    </div>
);


export const CustomEvent = ({ event, resetEventToPlaceholder }) => {
    const handleDelete = () => {
        // Call a function to reset the event to a placeholder
        resetEventToPlaceholder(event);
    };

    return (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {event.title}
            </span>
            <IconButton
                size="small"
                onClick={handleDelete}
                style={{
                    marginLeft: "auto", padding: "1px"
                }}
            >
                <DeleteIcon fontSize="small" sx={{
                    color: "white",
                }} />
            </IconButton>
        </div>
    );
};


export const CustomDayHeader = ({ label }) => {
    return (
        <div
            style={{
                height: "30px", // Larger height for the header
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
            }}
        >
            {label}
        </div>
    );
};
