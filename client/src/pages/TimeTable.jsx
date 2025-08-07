import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, Trash2, Plus, Eye,
  Filter, Search, ChevronDown, ChevronUp,
  Clock, User, Calendar
} from 'lucide-react';
import useAuthStore from '../store/authStore';
// Helper: Local file type check
function getFileType(url, fileType) {
  if (fileType?.includes('image')) return 'image';
  if (fileType?.includes('pdf')) return 'pdf';
  return 'other';
}

// CHANGE: these may come from your auth system


export default function TimetablePage() {
  const [timetables, setTimetables] = useState([]);
  const [myTimetable, setMyTimetable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ teacherName: '', file: null, isMyTimetable: false });
  const [formErrors, setFormErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [previewTimetable, setPreviewTimetable] = useState(null);
  // Search/filter/sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // UTIL API URL (adjust to your backend)
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const UPLOAD_PRESET = 'my_preset_name'; 
  const CLOUDINARY_URL = import.meta.env.VITE_API_CLOUDINARY_URL;
  const currentUser = useAuthStore((s) => s.user);

useEffect(() => {
  if (currentUser?.name) {
    fetchTimetables();
  }
}, [currentUser, searchTerm, dateFrom, dateTo, sortOrder]);

  // Fetch data from API
  const fetchTimetables = async () => {
    try {
      let q = [];
      if (searchTerm) q.push(`search=${encodeURIComponent(searchTerm)}`);
      if (dateFrom) q.push(`from=${dateFrom}`);
      if (dateTo) q.push(`to=${dateTo}`);
      if (sortOrder) q.push(`sort=${sortOrder}`);
      const res = await fetch(`${API_BASE}/api/timetables/?${q.join('&')}`);
      const data = await res.json();
      setTimetables(
        data.filter(tt => tt.teacherName.toLowerCase() !== currentUser.name.toLowerCase())
      );
      const mine = data.find(tt =>
        tt.teacherName.toLowerCase() === currentUser.name.toLowerCase()
      );
      setMyTimetable(mine || null);
    } catch (err) {
      alert('Failed to load timetables from server.');
    }
  };

  useEffect(() => { fetchTimetables(); /* on mount & filter */ }, [searchTerm, dateFrom, dateTo, sortOrder]);

  // Validate upload form
  const validateForm = () => {
    const errors = {};
    if (!formData.teacherName.trim()) errors.teacherName = 'Teacher name is required';
    if (!formData.file) errors.file = 'Please upload a PDF or image file';
    return errors;
  };
  

  // Handle form submit (real API)
  const handleSubmit = async e => {
  e.preventDefault();
  const errors = validateForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  setUploading(true);

  try {
    // 1. Upload to Cloudinary
    const cloudForm = new FormData();
    cloudForm.append('file', formData.file);
    cloudForm.append('upload_preset', UPLOAD_PRESET);

    const cloudRes = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: cloudForm
    });

    if (!cloudRes.ok) throw new Error('Cloudinary upload failed');
    const cloudData = await cloudRes.json();

    const fileUrl = cloudData.secure_url;
    const fileType = formData.file.type.includes('pdf') ? 'pdf' : 'image';

    // 2. Upload to your backend
    const backendRes = await fetch(`${API_BASE}/api/timetables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherName: formData.teacherName,
        uploadedBy: currentUser,
        uploadedByName: currentUser.name,
        fileUrl,
        fileType
      })
    });

    if (!backendRes.ok) throw new Error('Backend upload failed');

    // Success: clear form
    setShowForm(false);
    setFormData({ teacherName: '', file: null });
    setFormErrors({});
    fetchTimetables();
  } catch (err) {
    alert(err.message || 'Upload failed');
  } finally {
    setUploading(false);
  }
};


  // Handle delete
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/api/timetables/${id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchTimetables();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  // UI filter (the backend also filters but the client can too)
  // -- removed because now backend handles filters

  // ... (UI code unchanged below EXCEPT no hardcoded data and now API integration above)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[var(--neutral)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--accent)] mb-2 tracking-tight drop-shadow-sm">
              Teacher Timetables
            </h1>
            <p className="text-[var(--neutral)]/70 text-lg">
              Manage and view teaching schedules for all faculty members
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormData({ teacherName: '', file: null, isMyTimetable: false });
              setFormErrors({});
            }}
            className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-xl font-semibold shadow-lg hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2 text-lg"
          >
            <Plus className="h-5 w-5" />
            {showForm ? 'Close Form' : 'Add Timetable'}
          </button>
        </div>

        {/* My Timetable Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-6 w-6 text-[var(--accent)]" />
            <h2 className="text-2xl font-bold text-[var(--accent)]">My Timetable</h2>
          </div>
          {myTimetable ? (
            <div className="bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] rounded-2xl p-6 shadow-xl border border-[var(--accent)]/20 relative">
              <button
                onClick={() => setDeleteTarget(myTimetable)}
                title="Delete My Timetable"
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--primary)]/80 border border-[var(--accent)]/20 hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-[var(--accent)]" />
                    <span className="px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full text-sm font-semibold">
                      My Schedule
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--neutral)]">{myTimetable.teacherName}</h3>
                  <div className="text-sm text-[var(--neutral)]/60 mb-4">
                    Updated: {new Date(myTimetable.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewTimetable(myTimetable)}
                      className="px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> View Full
                    </button>
                    <a
                      href={myTimetable.fileUrl}
                      download
                      className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" /> Download
                    </a>
                  </div>
                </div>
                <div className="flex justify-center">
                  {getFileType(myTimetable.fileUrl, myTimetable.fileType) === 'image' ? (
                    <img
                      src={myTimetable.fileUrl}
                      alt="My Timetable"
                      className="rounded-lg max-h-64 shadow-md cursor-pointer hover:shadow-lg transition-shadow border border-[var(--accent)]/20"
                      onClick={() => setPreviewTimetable(myTimetable)}
                    />
                  ) : (
                    <div className="w-full max-w-xs h-64 bg-[var(--primary)] rounded-lg flex items-center justify-center border border-[var(--accent)]/20">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-[var(--accent)] mx-auto mb-2" />
                        <p className="text-[var(--neutral)]/70">PDF Timetable</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--secondary)] rounded-2xl p-8 shadow-xl border border-[var(--accent)]/20 text-center">
              <Clock className="h-12 w-12 text-[var(--accent)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--neutral)] mb-2">No Timetable Uploaded</h3>
              <p className="text-[var(--neutral)]/70 mb-4">Upload your teaching schedule to get started</p>
              <button
                onClick={() => {
                  setShowForm(true);
                  setFormData(prev => ({ ...prev, isMyTimetable: true, teacherName: currentUser.name }));
                }}
                className="px-6 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors"
              >
                Upload My Timetable
              </button>
            </div>
          )}
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="bg-[var(--secondary)] rounded-2xl p-8 mb-10 shadow-xl border border-[var(--accent)]/20">
            <h2 className="text-2xl font-bold mb-6 text-[var(--accent)]">
              {formData.isMyTimetable ? 'Upload My Timetable' : 'Add Timetable'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium mb-2 text-[var(--neutral)]">Teacher Name *</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.teacherName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, teacherName: e.target.value }));
                      setFormErrors(prev => ({ ...prev, teacherName: '' }));
                    }}
                    className={`w-full px-4 py-3 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${formErrors.teacherName ? 'border-red-500' : 'border-[var(--accent)]/30'}`}
                    disabled={formData.isMyTimetable}
                  />
                  {formErrors.teacherName && <p className="text-red-500 text-sm mt-1">{formErrors.teacherName}</p>}
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-[var(--neutral)]">Timetable File *</label>
                  <input
                    type="file"
                    accept=".pdf, image/*"
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
                      setFormErrors(prev => ({ ...prev, file: '' }));
                    }}
                    className="block w-full px-4 py-3 text-[var(--neutral)] bg-[var(--primary)] border border-[var(--accent)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <p className="text-sm text-[var(--neutral)]/60 mt-1">Upload PDF or image file (JPG, PNG)</p>
                  {formErrors.file && <p className="text-red-500 text-sm mt-1">{formErrors.file}</p>}
                </div>
              </div>
              {!formData.isMyTimetable && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isMyTimetable"
                    checked={formData.isMyTimetable}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        isMyTimetable: isChecked,
                        teacherName: isChecked ? currentUser.name : ''
                      }));
                    }}
                    className="h-4 w-4 text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--accent)]/30 rounded"
                  />
                  <label htmlFor="isMyTimetable" className="ml-2 block text-sm text-[var(--neutral)]">
                    This is my timetable
                  </label>
                </div>
              )}
              <div className="flex gap-4 justify-end">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-8 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-xl font-semibold hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2 text-lg shadow"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary)] border-t-transparent"></div>
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload Timetable'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ teacherName: '', file: null, isMyTimetable: false });
                    setFormErrors({});
                  }}
                  className="px-8 py-3 border border-[var(--accent)] text-[var(--accent)] rounded-xl font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors text-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Other Timetables Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--accent)] mb-6">Other Teachers' Timetables</h2>
          {/* Search & Filter Bar */}
          <div className="sticky top-16 z-30 mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-end bg-[var(--secondary)]/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-[var(--accent)]/10">
            <div className="flex-1 flex items-center gap-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)]/70 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by teacher name..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-base"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(f => !f)}
              className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 shadow"
            >
              <Filter className="h-5 w-5" />
              Filters {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {showFilters && (
            <div className="mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-end bg-[var(--secondary)]/90 rounded-xl p-4 shadow-lg border border-[var(--accent)]/10 animate-fadeIn">
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1 text-[var(--neutral)]">Date From</label>
                <input
                  type="date"
                  className="px-3 py-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--primary)] text-[var(--neutral)]"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  max={dateTo || undefined}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1 text-[var(--neutral)]">Date To</label>
                <input
                  type="date"
                  className="px-3 py-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--primary)] text-[var(--neutral)]"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1 text-[var(--neutral)]">Sort by</label>
                <select
                  className="px-3 py-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--primary)] text-[var(--neutral)]"
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setDateFrom('');
                    setDateTo('');
                    setSortOrder('desc');
                  }}
                  className="px-4 py-2 rounded-lg border border-red-400 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {timetables.map((timetable) => {
              const type = getFileType(timetable.fileUrl, timetable.fileType);
              const fileTypeLabel = type === 'pdf' ? 'PDF' : type === 'image' ? 'Image' : 'File';
              return (
                <div key={timetable._id} className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] border border-[var(--accent)]/10 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow relative group flex flex-col justify-between">
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow mb-3 ${type === 'pdf' ? 'bg-red-100 text-red-700' : type === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                    {fileTypeLabel}
                  </span>
                  <button
                    onClick={() => setDeleteTarget(timetable)}
                    title="Delete Timetable"
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--primary)]/80 border border-[var(--accent)]/20 hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="mt-8">
                    <h3 className="text-lg font-bold mb-2 pr-8 truncate" title={timetable.teacherName}>
                      {timetable.teacherName}
                    </h3>
                    <div className="mb-4 text-xs text-[var(--neutral)]/60 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[var(--primary)]/60 rounded-full font-semibold">
                        {new Date(timetable.createdAt).toLocaleDateString()}
                      </span>
                      <span>by {timetable.uploadedByName}</span>
                    </div>
                    {type === 'image' && (
                      <div className="mb-4">
                        <img
                          src={timetable.fileUrl}
                          alt={`${timetable.teacherName} Timetable`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:shadow-md transition-shadow border border-[var(--accent)]/20"
                          onClick={() => setPreviewTimetable(timetable)}
                        />
                      </div>
                    )}
                    {type === 'pdf' ? (
                      <div className="flex flex-col gap-2">
                        <div className='flex gap-2'>
                          <a
                            href={timetable.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)]/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <FileText className="w-4 h-4" /> View PDF
                          </a>
                          <button
                            onClick={() => setPreviewTimetable(timetable)}
                            className="flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)]/10 transition-colors border border-[var(--accent)]/30 flex items-center justify-center gap-1"
                          >
                            <Eye className="w-4 h-4" /> Preview
                          </button>
                        </div>
                        <a
                          href={timetable.fileUrl}
                          download
                          className="flex-1 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-1"
                        >
                          <FileText className="w-4 h-4" /> Download
                        </a>
                      </div>
                    ) : type === 'image' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewTimetable(timetable)}
                          className="flex-1 px-3 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)]/20 transition-colors flex items-center justify-center gap-1 text-sm"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                        <a
                          href={timetable.fileUrl}
                          download
                          className="flex-1 px-3 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-1 text-sm"
                        >
                          <FileText className="w-4 h-4" /> Download
                        </a>
                      </div>
                    ) : (
                      <a
                        href={timetable.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="flex-1 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-1"
                      >
                        <FileText className="w-4 h-4" /> Download
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {timetables.length === 0 && (
            <div className="text-center py-16">
              <div className="text-[var(--neutral)]/50 text-7xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-[var(--neutral)] mb-2">No Timetables Found</h3>
              <p className="text-[var(--neutral)]/70 mb-6 text-lg">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-[var(--secondary)] rounded-xl shadow-lg max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-2xl text-[var(--neutral)]/60 hover:text-[var(--accent)]" onClick={() => setDeleteTarget(null)}>&times;</button>
            <h2 className="text-lg font-bold mb-4 text-center">Confirm Deletion</h2>
            <p className="mb-6 text-center">
              Are you sure you want to delete the timetable for <span className="font-semibold text-[var(--accent)]">{deleteTarget.teacherName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={async () => { await handleDelete(deleteTarget._id); }}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-6 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTimetable && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewTimetable(null)}>
          <div className="bg-[var(--secondary)] rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 z-10 text-2xl text-[var(--neutral)]/60 hover:text-[var(--accent)] bg-[var(--primary)] rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setPreviewTimetable(null)}
            >
              &times;
            </button>
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-[var(--neutral)] mb-1">{previewTimetable.teacherName}</h2>
                <p className="text-[var(--neutral)]/70">Uploaded on {new Date(previewTimetable.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex-1 flex items-center justify-center overflow-auto">
                {getFileType(previewTimetable.fileUrl, previewTimetable.fileType) === 'image' ? (
                  <img
                    src={previewTimetable.fileUrl}
                    alt="Timetable Preview"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <iframe
                    src={previewTimetable.fileUrl}
                    title="Timetable Preview"
                    className="w-full h-full rounded-lg border border-[var(--accent)]/20"
                  />
                )}
              </div>
              <div className="mt-4 flex justify-center gap-4">
                <a
                  href={previewTimetable.fileUrl}
                  download
                  className="px-6 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Download
                </a>
                <a
                  href={previewTimetable.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
