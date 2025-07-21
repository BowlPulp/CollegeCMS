const Event = require('../models/event.model');

// @desc Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// @desc Create a new event
const createEvent = async (req, res) => {
  const { title, description, date, createdBy } = req.body;

  if (!title || !description || !date || !createdBy) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newEvent = await Event.create({ title, description, date, createdBy });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// @desc Update an event
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, createdBy } = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { title, description, date, createdBy },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// @desc Delete an event
const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
