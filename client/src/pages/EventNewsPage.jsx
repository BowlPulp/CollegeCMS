import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Calendar, Plus, Upload, User, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';

export default function EventNewsPage() {
  const { theme } = useTheme();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    createdBy: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/events`);
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date.trim()) errors.date = 'Date is required';
    if (!formData.createdBy.trim()) errors.createdBy = 'Author is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      if (editingId) {
        const res = await axios.put(`${BASE_URL}/api/events/${editingId}`, formData);
        setEvents(prev => prev.map(event => event._id === editingId ? res.data : event));
      } else {
        const res = await axios.post(`${BASE_URL}/api/events`, formData);
        setEvents(prev => [res.data, ...prev]);
      }

      setFormData({ title: '', description: '', date: '', createdBy: '' });
      setFormErrors({});
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      setFormErrors({ submit: 'Failed to submit event. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date?.slice(0, 10),
      createdBy: event.createdBy
    });
    setEditingId(event._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/events/${id}`);
      setEvents(prev => prev.filter(event => event._id !== id));
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--neutral)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Event News</h1>
            <p className="text-[var(--neutral)]/70">Share upcoming or past events with your community</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormData({ title: '', description: '', date: '', createdBy: '' });
              setEditingId(null);
            }}
            className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg flex items-center gap-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            {showForm ? 'Close Form' : 'Add New Event'}
          </button>
        </div>

        {showForm && (
          <div className="bg-[var(--secondary)] rounded-xl p-6 mb-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Event' : 'Add Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Event Title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg border ${
                  formErrors.title ? 'border-red-500' : 'border-[var(--accent)]/30'
                } bg-[var(--primary)] text-[var(--neutral)]`}
              />
              {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}

              <textarea
                name="description"
                placeholder="Event Description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full p-3 rounded-lg border ${
                  formErrors.description ? 'border-red-500' : 'border-[var(--accent)]/30'
                } bg-[var(--primary)] text-[var(--neutral)]`}
              />
              {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg border ${
                  formErrors.date ? 'border-red-500' : 'border-[var(--accent)]/30'
                } bg-[var(--primary)] text-[var(--neutral)]`}
              />
              {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}

              <input
                type="text"
                name="createdBy"
                placeholder="Posted By"
                value={formData.createdBy}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg border ${
                  formErrors.createdBy ? 'border-red-500' : 'border-[var(--accent)]/30'
                } bg-[var(--primary)] text-[var(--neutral)]`}
              />
              {formErrors.createdBy && <p className="text-red-500 text-sm">{formErrors.createdBy}</p>}
              {formErrors.submit && <p className="text-red-500 text-sm">{formErrors.submit}</p>}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg flex items-center gap-2 font-medium"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--primary)] border-t-transparent"></div>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {editingId ? 'Update Event' : 'Add Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ title: '', description: '', date: '', createdBy: '' });
                  }}
                  className="px-6 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event._id} className="bg-[var(--secondary)] rounded-xl p-6 shadow-lg relative">
              <h3 className="text-lg font-semibold text-[var(--neutral)] mb-2">{event.title}</h3>
              <p className="text-sm text-[var(--neutral)]/70 mb-3">
                {event.description.length > 120
                  ? `${event.description.slice(0, 120)}...`
                  : event.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-[var(--neutral)]/60">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {event.createdBy}
                </div>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleEdit(event)} title="Edit">
                  <Edit2 className="h-4 w-4 text-yellow-400 hover:text-yellow-500" />
                </button>
                <button onClick={() => handleDelete(event._id)} title="Delete">
                  <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-[var(--neutral)] mb-2">
              No events yet
            </h3>
            <p className="text-[var(--neutral)]/70 mb-6">
              Be the first to post an event update
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium"
            >
              Post Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
