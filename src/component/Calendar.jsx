import React, { useState, useRef, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import Badge from '@mui/material/Badge';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import './Calendar.css';

const Calendar = () => {
  // State to store the selected date
  const [value, setValue] = useState(new Date());
  // State to store the events for each date
  const [events, setEvents] = useState({});
  // State to manage the visibility of the "Add Event" modal
  const [open, setOpen] = useState(false);
  // State to manage the visibility of the "Edit Event" modal
  const [editOpen, setEditOpen] = useState(false);
  // State to store the event title entered by the user
  const [eventTitle, setEventTitle] = useState('');
  // State to store the selected event category
  const [eventCategory, setEventCategory] = useState('');
  // State to store the details of the event being edited
  const [editEventDetails, setEditEventDetails] = useState({ dateStr: '', index: -1, title: '', category: '' });
  // State to store the selected category filter
  const [filterCategory, setFilterCategory] = useState('');
  // Ref to keep track of the calendar's height for the sidebar
  const calendarRef = useRef(null);

  // Available categories for the events
  const categories = ['Festival', 'Work', 'Casual', 'Others'];

  // Function to handle date selection in the calendar
  const handleDateChange = (newValue) => {
    setValue(newValue);
    setOpen(true);
  };

  // Function to handle event submission for adding a new event
  const handleEventSubmit = () => {
    if (!eventTitle.trim()) {
      return;
    }

    const dateStr = value.toDateString();
    const newEvents = [...(events[dateStr] || []), { title: eventTitle, category: eventCategory }];
    setEvents({
      ...events,
      [dateStr]: newEvents,
    });
    setOpen(false);
    setEventTitle('');
    setEventCategory('');
  };

  // Function to handle event deletion
  const handleEventDelete = (dateStr, index) => {
    const updatedEvents = events[dateStr].filter((_, i) => i !== index);

    if (updatedEvents.length > 0) {
      setEvents({
        ...events,
        [dateStr]: updatedEvents,
      });
    } else {
      const newEvents = { ...events };
      delete newEvents[dateStr];
      setEvents(newEvents);
    }
  };

  // Function to open the edit modal with the details of the selected event
  const handleEventEdit = (dateStr, index) => {
    const eventToEdit = events[dateStr][index];
    setEditEventDetails({ dateStr, index, title: eventToEdit.title, category: eventToEdit.category });
    setEventTitle(eventToEdit.title);
    setEventCategory(eventToEdit.category);
    setEditOpen(true);
  };

  // Function to handle submission of edited event details
  const handleEditSubmit = () => {
    const { dateStr, index } = editEventDetails;
    const updatedEvents = [...events[dateStr]];
    updatedEvents[index] = { title: eventTitle, category: eventCategory };

    setEvents({
      ...events,
      [dateStr]: updatedEvents,
    });
    setEditOpen(false);
    setEventTitle('');
    setEventCategory('');
  };

  // Function to handle the category filter change
  const handleFilterChange = (event) => {
    setFilterCategory(event.target.value);
  };

  // Sort events by date and apply category filter if selected
  const sortedEvents = Object.entries(events)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .filter(([_, eventsOnDate]) => 
      eventsOnDate.some(event => !filterCategory || event.category === filterCategory)
    );

  // Effect to set the height of the sidebar equal to the calendar height
  useEffect(() => {
    if (calendarRef.current) {
      const calendarHeight = calendarRef.current.clientHeight;
      document.getElementById('event-sidebar').style.height = `${calendarHeight}px`;
    }
  }, []);

  return (
    <Box className="calendar-container">
      {/* Main calendar component */}
      <Box className="calendar-main" ref={calendarRef}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StaticDatePicker
            variant="static"
            orientation="portrait"
            value={value}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} />}
            renderDay={(day, _value, DayComponentProps) => {
              const dateStr = day.toDateString();
              const isSelected =
                !DayComponentProps.outsideCurrentMonth && events[dateStr]?.length > 0;

              return (
                <Badge
                  key={day.toString()}
                  overlap="circular"
                  badgeContent={isSelected ? <span style={{ backgroundColor: 'transparent' }} /> : undefined}
                >
                  <PickersDay {...DayComponentProps} />
                </Badge>
              );
            }}
          />
        </LocalizationProvider>
      </Box>

      {/* Sidebar to show events */}
      <Box
        id="event-sidebar"
        className="sidebar"
      >
        <Typography variant="h4" gutterBottom className="event-title">
          Events Schedule
        </Typography>

        {/* Dropdown for category filter */}
        <FormControl fullWidth>
          <InputLabel className="filter-label">Filter by Category</InputLabel>
          <Select
            value={filterCategory}
            onChange={handleFilterChange}
            className="filter-select"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 220,
                  color: 'black',
                },
              },
            }}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Display events based on the selected filter */}
        {sortedEvents.length > 0 ? (
          <List>
            {sortedEvents.map(([date, eventsOnDate]) => {
              const filteredEvents = eventsOnDate.filter(event => !filterCategory || event.category === filterCategory);
              if (filteredEvents.length === 0) return null;
              
              return (
                <Box key={date} mb={2}>
                  <Typography variant="h6" gutterBottom>
                    {date}
                  </Typography>
                  <List>
                    {filteredEvents.map((event, index) => (
                      <ListItem
                        key={index}
                        className="event-list-item"
                        secondaryAction={
                          <>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => handleEventEdit(date, index)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleEventDelete(date, index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        }
                      >
                        <ListItemText primary={event.title} secondary={event.category} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              );
            })}
          </List>
        ) : (
          <Typography variant="body1">No events scheduled.</Typography>
        )}
      </Box>

      {/* Modal for Adding Event */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="event-modal">
          <Typography variant="h6" gutterBottom>
            Add Event
          </Typography>
          <TextField
            label="Event Title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select value={eventCategory} onChange={(e) => setEventCategory(e.target.value)}>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button onClick={handleEventSubmit} variant="contained" color="primary" style={{ marginTop: 30 }}>
            Add Event
          </Button>
        </Box>
      </Modal>

      {/* Modal for Editing Event */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box className="event-modal">
          <Typography variant="h6" gutterBottom>
            Edit Event
          </Typography>
          <TextField
            label="Event Title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select value={eventCategory} onChange={(e) => setEventCategory(e.target.value)}>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button onClick={handleEditSubmit} variant="contained" color="primary" style={{ marginTop: 30 }}>
            Save Changes
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Calendar;
