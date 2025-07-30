import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Calendar, Plus, Upload, User, Edit2, Trash2, X, Clock, AtSign, Users, Tag, Search, Filter, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';

export default function EventNewsPage() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    type: 'event',
    title: '',
    description: '',
    hostedBy: '',
    location: '',
    date: '',
    isFullDay: true,
    startTime: '',
    endTime: '',
    taggedStaff: []
  });
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [filteredStaff, setFilteredStaff] = useState([]);
  
  // New state for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedSort, setSelectedSort] = useState('priority');
  const [showFilters, setShowFilters] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchStaffList();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedFilter, selectedSort]);

  // Add debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedFilter) params.append('filter', selectedFilter);
      if (selectedSort) params.append('sortBy', selectedSort);
      if (user?.email) params.append('userEmail', user.email);

      const url = `/api/events?${params.toString()}`;
      console.log('🔍 Fetching events with URL:', url);
      console.log('📋 Parameters:', {
        searchTerm,
        selectedFilter,
        selectedSort,
        userEmail: user?.email
      });

      const res = await axios.get(url);
      console.log('✅ Events response:', res.data);
      setEvents(res.data.data || res.data);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      console.error('❌ Error response:', err.response?.data);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await axios.get('/api/events/staff-emails');
      setStaffList(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching staff list:', err);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    if (formData.type === 'event') {
      if (!formData.hostedBy.trim()) errors.hostedBy = 'Hosted by is required for events';
      if (!formData.location.trim()) errors.location = 'Location is required for events';
      if (!formData.date.trim()) errors.date = 'Date is required for events';
      if (!formData.isFullDay && (!formData.startTime || !formData.endTime)) {
        errors.time = 'Start time and end time are required for specific time events';
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== FRONTEND SUBMIT START ===');
    console.log('Form data:', JSON.stringify(formData, null, 2));
    console.log('User:', user);
    
    setIsLoading(true);

    const errors = validateForm();
    console.log('Validation errors:', errors);
    
    if (Object.keys(errors).length > 0) {
      console.log('❌ Form validation failed');
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    console.log('✅ Form validation passed');

    try {
      const eventData = {
        ...formData,
        createdBy: user?.name || user?.email || 'Unknown',
        createdByEmail: user?.email || 'unknown@example.com'
      };

      console.log('📦 Event data to send:', JSON.stringify(eventData, null, 2));

      if (editingId) {
        console.log('🔄 Updating existing event:', editingId);
        const res = await axios.put(`/api/events/${editingId}`, eventData);
        console.log('✅ Update response:', res.data);
        setEvents(prev => prev.map(event => event._id === editingId ? res.data.data : event));
      } else {
        console.log('🆕 Creating new event/notice');
        const res = await axios.post('/api/events', eventData);
        console.log('✅ Create response:', res.data);
        setEvents(prev => [res.data.data, ...prev]);
      }

      console.log('✅ Operation completed successfully');
      resetForm();
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      setFormErrors({ submit: 'Failed to submit event. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'event',
      title: '',
      description: '',
      hostedBy: '',
      location: '',
      date: '',
      isFullDay: true,
      startTime: '',
      endTime: '',
      taggedStaff: []
    });
    setFormErrors({});
    setEditingId(null);
    setShowForm(false);
    setTagInput('');
  };

  const handleEdit = (event) => {
    setFormData({
      type: event.type || 'event',
      title: event.title,
      description: event.description,
      hostedBy: event.hostedBy || '',
      location: event.location || '',
      date: event.date?.slice(0, 10) || '',
      isFullDay: event.isFullDay !== undefined ? event.isFullDay : true,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      taggedStaff: event.taggedStaff || []
    });
    setEditingId(event._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await axios.delete(`/api/events/${pendingDeleteId}`);
      setEvents(prev => prev.filter(event => event._id !== pendingDeleteId));
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPendingDeleteId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Tagging functionality
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.startsWith('@')) {
      const searchTerm = value.slice(1).toLowerCase();
      const filtered = staffList.filter(staff => 
        staff.email.toLowerCase().includes(searchTerm) ||
        staff.name.toLowerCase().includes(searchTerm)
      );
      setFilteredStaff(filtered);
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };

  const handleTagSelect = (staff) => {
    if (!formData.taggedStaff.includes(staff.email)) {
      setFormData(prev => ({
        ...prev,
        taggedStaff: [...prev.taggedStaff, staff.email]
      }));
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (email) => {
    setFormData(prev => ({
      ...prev,
      taggedStaff: prev.taggedStaff.filter(e => e !== email)
    }));
  };

  const tagAllStaff = () => {
    const allEmails = staffList.map(staff => staff.email);
    setFormData(prev => ({
      ...prev,
      taggedStaff: allEmails
    }));
  };

  const getStaffName = (email) => {
    const staff = staffList.find(s => s.email === email);
    return staff ? staff.name : email;
  };

  const formatEventTime = (event) => {
    if (event.isFullDay) {
      return 'Full Day';
    }
    return `${event.startTime} - ${event.endTime}`;
  };

  const formatEventDate = (event) => {
    if (event.type === 'notice') {
      return event.date ? new Date(event.date).toLocaleDateString() : 'No date specified';
    }
    return new Date(event.date).toLocaleDateString();
  };

  const getEventStatus = (event) => {
    if (event.type === 'notice') return null;
    
    const now = new Date();
    const eventDate = new Date(event.date);
    
    // For events with specific time, create a proper datetime
    let eventDateTime = new Date(event.date);
    let eventEndDateTime = new Date(event.date);
    
    if (!event.isFullDay && event.startTime) {
      // Parse the start time and add it to the event date
      const [startHours, startMinutes] = event.startTime.split(':').map(Number);
      eventDateTime.setHours(startHours, startMinutes, 0, 0);
      
      // Also set end time for ongoing check
      if (event.endTime) {
        const [endHours, endMinutes] = event.endTime.split(':').map(Number);
        eventEndDateTime.setHours(endHours, endMinutes, 0, 0);
      }
    } else {
      // For full day events, use the start and end of the day
      eventDateTime.setHours(0, 0, 0, 0);
      eventEndDateTime.setHours(23, 59, 59, 999);
    }
    
    const timeDiff = eventDateTime - now;
    const endTimeDiff = eventEndDateTime - now;
    
    // Check if event is ongoing (current time is between start and end)
    if (now >= eventDateTime && now <= eventEndDateTime) {
      return 'ongoing';
    }
    
    if (timeDiff < 0) return 'expired';
    if (timeDiff <= 60 * 60 * 1000) return 'urgent'; // Within 1 hour
    if (eventDateTime.toDateString() === now.toDateString()) return 'today';
    if (timeDiff <= 7 * 24 * 60 * 60 * 1000) return 'upcoming'; // Within 7 days
    return 'future';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'expired':
        return { text: 'Expired', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
      case 'urgent':
        return { text: 'Urgent', color: 'bg-orange-100 text-orange-700', icon: Clock };
      case 'ongoing':
        return { text: 'Ongoing', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'today':
        return { text: 'Today', color: 'bg-blue-100 text-blue-700', icon: Calendar };
      case 'upcoming':
        return { text: 'Upcoming', color: 'bg-purple-100 text-purple-700', icon: Calendar };
      default:
        return null;
    }
  };

  const sendBrowserNotification = (event) => {
    if (notificationPermission === 'granted' && event.taggedStaff?.includes(user?.email)) {
      // Create proper datetime for the event
      let eventDateTime = new Date(event.date);
      
      if (!event.isFullDay && event.startTime) {
        // Parse the start time and add it to the event date
        const [hours, minutes] = event.startTime.split(':').map(Number);
        eventDateTime.setHours(hours, minutes, 0, 0);
      } else {
        // For full day events, use the start of the day
        eventDateTime.setHours(0, 0, 0, 0);
      }
      
      const timeDiff = eventDateTime - new Date();
      
      if (timeDiff > 0 && timeDiff <= 60 * 60 * 1000) { // Within 1 hour
        new Notification('Event Reminder', {
          body: `${event.title} starts in ${Math.floor(timeDiff / (1000 * 60))} minutes`,
          icon: '/favicon.ico'
        });
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilter('');
    setSelectedSort('priority');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[var(--neutral)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--accent)] mb-2 tracking-tight">Event & Notice Manager</h1>
            <p className="text-[var(--neutral)]/70 text-lg">Share upcoming events and notices with your community</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
            }}
            className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-xl font-semibold shadow-lg hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2 text-lg"
          >
            <Plus className="h-5 w-5" />
            {showForm ? 'Close Form' : 'Add New Event/Notice'}
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-6 mb-8 shadow-xl border border-[var(--accent)]/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--neutral)]/60" />
              <input
                type="text"
                placeholder="Search events by title, description, or hosted by..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)]/20 transition-colors flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* Clear All */}
            {(searchTerm || selectedFilter || selectedSort !== 'priority') && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filter Dropdown */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Filter By</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="">All Events</option>
                  <option value="my-events">My Events (Tagged)</option>
                  <option value="today">Today</option>
                  <option value="uploaded-by-me">Uploaded by Me</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past Events</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Sort By</label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="priority">Priority (Tagged First)</option>
                  <option value="date">Date</option>
                  <option value="created">Recently Created</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {showForm && (
          <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-8 mb-8 shadow-xl border border-[var(--accent)]/20">
            <h2 className="text-2xl font-bold mb-6 text-[var(--accent)]">
              {editingId ? 'Edit Event/Notice' : 'Add New Event/Notice'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="event"
                      checked={formData.type === 'event'}
                      onChange={handleInputChange}
                      className="text-[var(--accent)]"
                    />
                    <span>Event</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="notice"
                      checked={formData.type === 'notice'}
                      onChange={handleInputChange}
                      className="text-[var(--accent)]"
                    />
                    <span>Notice</span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Event/Notice Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg border ${
                    formErrors.title ? 'border-red-500' : 'border-[var(--accent)]/30'
                  } bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                />
                {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Description</label>
                <textarea
                  name="description"
                  placeholder="Event/Notice Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full p-3 rounded-lg border ${
                    formErrors.description ? 'border-red-500' : 'border-[var(--accent)]/30'
                  } bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                />
                {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
              </div>

              {/* Event-specific fields */}
              {formData.type === 'event' && (
                <>
                  {/* Hosted By */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Hosted By</label>
                    <input
                      type="text"
                      name="hostedBy"
                      placeholder="Who is hosting this event?"
                      value={formData.hostedBy}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${
                        formErrors.hostedBy ? 'border-red-500' : 'border-[var(--accent)]/30'
                      } bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                    />
                    {formErrors.hostedBy && <p className="text-red-500 text-sm mt-1">{formErrors.hostedBy}</p>}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Location</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="Where is this event taking place?"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${
                        formErrors.location ? 'border-red-500' : 'border-[var(--accent)]/30'
                      } bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                    />
                    {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${
                        formErrors.date ? 'border-red-500' : 'border-[var(--accent)]/30'
                      } bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                    />
                    {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                  </div>

                  {/* Time Period */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Time Period</label>
                    <div className="flex items-center gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isFullDay"
                          checked={formData.isFullDay}
                          onChange={handleInputChange}
                          className="text-[var(--accent)]"
                        />
                        <span>Full Day Event</span>
                      </label>
                    </div>
                    
                    {!formData.isFullDay && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Start Time</label>
                          <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">End Time</label>
                          <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]"
                          />
                        </div>
                      </div>
                    )}
                    {formErrors.time && <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>}
                  </div>
                </>
              )}

              {/* Notice-specific fields */}
              {formData.type === 'notice' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Date (Optional)</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <p className="text-xs text-[var(--neutral)]/60 mt-1">Leave empty if no specific date is needed</p>
                </div>
              )}

              {/* Staff Tagging */}
              {formData.type === 'event' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--accent)]">Tag Staff Members</label>
                  
                  {/* Tag All Staff Button */}
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={tagAllStaff}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Tag All Staff
                    </button>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)]">
                      <AtSign className="h-5 w-5 text-[var(--accent)]" />
                      <input
                        type="text"
                        placeholder="Type @ to tag staff members..."
                        value={tagInput}
                        onChange={handleTagInputChange}
                        className="flex-1 bg-transparent outline-none"
                      />
                    </div>
                    
                    {showTagSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--secondary)] border border-[var(--accent)]/30 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {filteredStaff.map(staff => (
                          <button
                            key={staff.email}
                            type="button"
                            onClick={() => handleTagSelect(staff)}
                            className="w-full p-3 text-left hover:bg-[var(--accent)]/10 flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-sm text-[var(--neutral)]/60">{staff.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Tagged Staff Display */}
                  {formData.taggedStaff.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.taggedStaff.map(email => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full text-sm"
                        >
                          <User className="h-3 w-3" />
                          {getStaffName(email)}
                          <button
                            type="button"
                            onClick={() => removeTag(email)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {formErrors.submit && <p className="text-red-500 text-sm">{formErrors.submit}</p>}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg flex items-center gap-2 font-semibold hover:bg-[var(--accent)]/90 transition-colors shadow"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--primary)] border-t-transparent"></div>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {editingId ? 'Update Event/Notice' : 'Add Event/Notice'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => {
            const status = getEventStatus(event);
            const statusBadge = getStatusBadge(status);
            
            return (
              <div key={event._id} className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-6 shadow-lg relative border border-[var(--accent)]/10 hover:shadow-xl transition-shadow">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleEdit(event)} title="Edit" className="p-2 text-[var(--neutral)]/70 hover:text-yellow-500 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(event._id)} title="Delete" className="p-2 text-[var(--neutral)]/70 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    event.type === 'event' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {event.type === 'event' ? 'Event' : 'Notice'}
                  </span>
                  {statusBadge && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                      <statusBadge.icon className="h-3 w-3" />
                      {statusBadge.text}
                    </span>
                  )}
                  {event.taggedStaff && event.taggedStaff.length > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {event.taggedStaff.length === staffList.length ? 'All Staff' : `${event.taggedStaff.length} tagged`}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[var(--neutral)] mb-2">{event.title}</h3>
                <p className="text-sm text-[var(--neutral)]/70 mb-3 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-2 text-xs text-[var(--neutral)]/60">
                  {event.type === 'event' && (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>Hosted by: {event.hostedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>Location: {event.location}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatEventDate(event)}</span>
                  </div>
                  {event.type === 'event' && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatEventTime(event)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>Created by: {event.createdBy}</span>
                  </div>
                </div>

                {/* Tagged Staff Display */}
                {event.taggedStaff && event.taggedStaff.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--accent)]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-3 w-3 text-[var(--accent)]" />
                      <span className="text-xs font-semibold text-[var(--accent)]">Tagged Staff:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {event.taggedStaff.length === staffList.length ? (
                        <span className="px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-xs font-semibold">
                          All Staff
                        </span>
                      ) : (
                        <>
                          {event.taggedStaff.slice(0, 3).map(email => (
                            <span key={email} className="px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-xs">
                              {getStaffName(email)}
                            </span>
                          ))}
                          {event.taggedStaff.length > 3 && (
                            <span className="px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-xs">
                              +{event.taggedStaff.length - 3} more
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-[var(--neutral)] mb-2">
              No events or notices found
            </h3>
            <p className="text-[var(--neutral)]/70 mb-6">
              {searchTerm || selectedFilter ? 'Try adjusting your search or filters' : 'Be the first to post an event or notice update'}
            </p>
            {!searchTerm && !selectedFilter && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors"
              >
                Post Event/Notice
              </button>
            )}
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--secondary)] rounded-xl shadow-xl p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">Confirm Deletion</h2>
            <p className="mb-6 text-[var(--neutral)]">Are you sure you want to delete this event/notice? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="px-6 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
