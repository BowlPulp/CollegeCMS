const Event = require('../models/event.model');
const Staff = require('../models/staff.model');
const { sendEventNotifications } = require('../utils/emailService');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc Get all events with search and filter
const getAllEvents = asyncHandler(async (req, res) => {
  console.log('=== GET ALL EVENTS REQUEST ===');
  console.log('Query parameters:', req.query);
  
  const { 
    search, 
    filter, 
    userEmail,
    sortBy = 'date'
  } = req.query;

  console.log('📋 Parsed parameters:', {
    search,
    filter,
    userEmail,
    sortBy
  });

  let query = {};

  // Search functionality
  if (search) {
    console.log('🔍 Adding search query for:', search);
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { hostedBy: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter functionality
  if (filter) {
    console.log('🎯 Adding filter:', filter);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filter) {
      case 'my-events':
        console.log('👤 Filtering by tagged staff:', userEmail);
        query.taggedStaff = userEmail;
        break;
      case 'today':
        console.log('📅 Filtering by today:', today, 'to', tomorrow);
        query.date = {
          $gte: today,
          $lt: tomorrow
        };
        break;
      case 'uploaded-by-me':
        console.log('📝 Filtering by created by:', userEmail);
        query.createdByEmail = userEmail;
        break;
      case 'upcoming':
        console.log('🚀 Filtering upcoming events');
        query.date = { $gte: new Date() };
        break;
      case 'past':
        console.log('⏰ Filtering past events');
        query.date = { $lt: new Date() };
        break;
      case 'this-week':
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        console.log('📆 Filtering this week:', new Date(), 'to', weekFromNow);
        query.date = {
          $gte: new Date(),
          $lte: weekFromNow
        };
        break;
      case 'this-month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        console.log('📅 Filtering this month:', startOfMonth, 'to', endOfMonth);
        query.date = {
          $gte: startOfMonth,
          $lte: endOfMonth
        };
        break;
    }
  }

  console.log('🔍 Final query:', JSON.stringify(query, null, 2));

  // Sort functionality
  let sortOptions = {};
  switch (sortBy) {
    case 'date':
      sortOptions = { date: 1, createdAt: 1 };
      break;
    case 'created':
      sortOptions = { createdAt: -1 };
      break;
    case 'title':
      sortOptions = { title: 1 };
      break;
    case 'priority':
      console.log('⭐ Using priority sorting');
      // Custom sorting for priority (tagged events first, then by date)
      const events = await Event.find(query).sort({ date: 1, createdAt: 1 });
      
      // Sort by priority: tagged events within 1 hour first, then tagged events today, then others
      const sortedEvents = events.sort((a, b) => {
        const now = new Date();
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        
        const aIsTagged = a.taggedStaff && a.taggedStaff.includes(userEmail);
        const bIsTagged = b.taggedStaff && b.taggedStaff.includes(userEmail);
        
        const aIsWithin1Hour = aIsTagged && aDate > now && (aDate - now) <= 60 * 60 * 1000;
        const bIsWithin1Hour = bIsTagged && bDate > now && (bDate - now) <= 60 * 60 * 1000;
        
        const aIsToday = aIsTagged && aDate.toDateString() === now.toDateString();
        const bIsToday = bIsTagged && bDate.toDateString() === now.toDateString();
        
        if (aIsWithin1Hour && !bIsWithin1Hour) return -1;
        if (!aIsWithin1Hour && bIsWithin1Hour) return 1;
        if (aIsToday && !bIsToday) return -1;
        if (!aIsToday && bIsToday) return 1;
        if (aIsTagged && !bIsTagged) return -1;
        if (!aIsTagged && bIsTagged) return 1;
        return aDate - bDate;
      });
      
      console.log('✅ Returning priority sorted events:', sortedEvents.length);
      return res.json(new ApiResponse(200, sortedEvents, 'Events retrieved successfully'));
    default:
      sortOptions = { date: 1, createdAt: 1 };
  }

  console.log('📊 Sort options:', sortOptions);
  const events = await Event.find(query).sort(sortOptions);
  console.log('✅ Found events:', events.length);

  res.json(new ApiResponse(200, events, 'Events retrieved successfully'));
});

// @desc Get all staff emails for tagging
const getAllStaffEmails = asyncHandler(async (req, res) => {
  const staff = await Staff.find({}, 'email name');
  const staffList = staff.map(s => ({
    email: s.email,
    name: s.name
  }));
  res.status(200).json(new ApiResponse(200, staffList, 'Staff emails fetched successfully'));
});

// @desc Create a new event
const createEvent = asyncHandler(async (req, res) => {
  console.log('=== CREATE EVENT REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { 
    type, 
    title, 
    description, 
    hostedBy, 
    location,
    date, 
    isFullDay, 
    startTime, 
    endTime, 
    taggedStaff,
    createdBy,
    createdByEmail 
  } = req.body;

  console.log('Parsed data:', {
    type,
    title,
    description,
    hostedBy,
    location,
    date,
    isFullDay,
    startTime,
    endTime,
    taggedStaff,
    createdBy,
    createdByEmail
  });

  // Validate required fields based on type
  if (!title || !description || !createdBy || !createdByEmail) {
    console.log('❌ Validation failed: Missing required fields');
    throw new ApiError(400, 'Title, description, created by, and created by email are required');
  }

  if (type === 'event') {
    console.log('🔍 Validating event fields...');
    if (!hostedBy) {
      console.log('❌ Validation failed: Missing hostedBy for event');
      throw new ApiError(400, 'Hosted by is required for events');
    }
    if (!location) {
      console.log('❌ Validation failed: Missing location for event');
      throw new ApiError(400, 'Location is required for events');
    }
    if (!date) {
      console.log('❌ Validation failed: Missing date for event');
      throw new ApiError(400, 'Date is required for events');
    }
    // Validate time fields for non-full day events
    if (!isFullDay && (!startTime || !endTime)) {
      console.log('❌ Validation failed: Missing time fields for non-full day event');
      throw new ApiError(400, 'Start time and end time are required for non-full day events');
    }
  }

  console.log('✅ Validation passed');

  // Create event data based on type
  const eventData = {
    type: type || 'event',
    title,
    description,
    createdBy,
    createdByEmail,
    taggedStaff: taggedStaff || []
  };

  console.log('📝 Base event data:', eventData);

  // Add event-specific fields only for events
  if (type === 'event') {
    console.log('🎯 Adding event-specific fields...');
    eventData.hostedBy = hostedBy;
    eventData.location = location;
    eventData.date = new Date(date);
    eventData.isFullDay = isFullDay !== undefined ? isFullDay : true;
    if (!isFullDay) {
      eventData.startTime = startTime;
      eventData.endTime = endTime;
    }
  } else if (type === 'notice' && date) {
    console.log('📢 Adding optional date for notice...');
    // For notices, only add date if provided
    eventData.date = new Date(date);
  }

  console.log('📦 Final event data to save:', JSON.stringify(eventData, null, 2));

  try {
    const newEvent = await Event.create(eventData);
    console.log('✅ Event created successfully:', newEvent._id);
    console.log('📄 Created event data:', JSON.stringify(newEvent, null, 2));

    // Send email notifications to tagged staff (only for events)
    if (type === 'event' && taggedStaff && taggedStaff.length > 0) {
      console.log('📧 Sending email notifications...');
      try {
        const notificationResults = await sendEventNotifications(newEvent, taggedStaff);
        console.log('📧 Email notification results:', notificationResults);
      } catch (error) {
        console.error('❌ Failed to send email notifications:', error);
        // Don't fail the request if email sending fails
      }
    }

    res.status(201).json(new ApiResponse(201, newEvent, 'Event created successfully'));
  } catch (error) {
    console.error('❌ Error creating event:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
});

// @desc Update an event
const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    type, 
    title, 
    description, 
    hostedBy, 
    location,
    date, 
    isFullDay, 
    startTime, 
    endTime, 
    taggedStaff,
    createdBy,
    createdByEmail 
  } = req.body;

  // Validate required fields based on type
  if (!title || !description || !createdBy || !createdByEmail) {
    throw new ApiError(400, 'Title, description, created by, and created by email are required');
  }

  if (type === 'event') {
    if (!hostedBy) {
      throw new ApiError(400, 'Hosted by is required for events');
    }
    if (!location) {
      throw new ApiError(400, 'Location is required for events');
    }
    if (!date) {
      throw new ApiError(400, 'Date is required for events');
    }
    // Validate time fields for non-full day events
    if (!isFullDay && (!startTime || !endTime)) {
      throw new ApiError(400, 'Start time and end time are required for non-full day events');
    }
  }

  // Create update data based on type
  const updateData = {
    type: type || 'event',
    title,
    description,
    createdBy,
    createdByEmail,
    taggedStaff: taggedStaff || []
  };

  // Add event-specific fields only for events
  if (type === 'event') {
    updateData.hostedBy = hostedBy;
    updateData.location = location;
    updateData.date = new Date(date);
    updateData.isFullDay = isFullDay !== undefined ? isFullDay : true;
    if (!isFullDay) {
      updateData.startTime = startTime;
      updateData.endTime = endTime;
    }
  } else if (type === 'notice' && date) {
    // For notices, only add date if provided
    updateData.date = new Date(date);
  }

  const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedEvent) {
    throw new ApiError(404, 'Event not found');
    }

  // Send email notifications to tagged staff (only for events)
  if (type === 'event' && taggedStaff && taggedStaff.length > 0) {
    try {
      const notificationResults = await sendEventNotifications(updatedEvent, taggedStaff);
      console.log('Email notification results:', notificationResults);
  } catch (error) {
      console.error('Failed to send email notifications:', error);
      // Don't fail the request if email sending fails
    }
  }

  res.json(new ApiResponse(200, updatedEvent, 'Event updated successfully'));
});

// @desc Delete an event
const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
    throw new ApiError(404, 'Event not found');
    }

  res.status(200).json(new ApiResponse(200, null, 'Event deleted successfully'));
});

module.exports = {
  getAllEvents,
  getAllStaffEmails,
  createEvent,
  updateEvent,
  deleteEvent,
};
