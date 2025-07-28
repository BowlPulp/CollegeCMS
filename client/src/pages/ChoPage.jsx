import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Plus, Eye, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

function getFileType(url, fileType) {
  if (fileType?.includes('image')) return 'image';
  if (fileType?.includes('pdf')) return 'pdf';
  if (fileType?.includes('word') || url.endsWith('.doc') || url.endsWith('.docx')) return 'word';
  if (fileType?.includes('excel') || url.endsWith('.xls') || url.endsWith('.xlsx')) return 'excel';
  return 'other';
}

export default function CHOPage() {
  const { theme } = useTheme();
  const [chos, setChos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', file: null });
  const [formErrors, setFormErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [previewCHO, setPreviewCHO] = useState(null); // { url, type, title }
  // Search/filter/sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null); // cho object

  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhjp4nolc/upload';
  const UPLOAD_PRESET = 'my_preset_name';
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.file) errors.file = 'Please upload a PDF or JPEG file';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return setFormErrors(errors);

    setUploading(true);
    const data = new FormData();
    data.append('file', formData.file);
    data.append('upload_preset', UPLOAD_PRESET);

    try {
      const cloudinaryRes = await axios.post(CLOUDINARY_URL, data);

      const newCHO = {
        title: formData.title,
        description: formData.description,
        fileUrl: cloudinaryRes.data.secure_url,
        fileType: formData.file.type,
      };

      const apiRes = await axios.post(
        `${BASE_URL}/api/chos`,
        newCHO,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setChos(prev => [apiRes.data, ...prev]);
      setFormData({ title: '', description: '', file: null });
      setFormErrors({});
      setShowForm(false);
    } catch (err) {
      console.error('Error uploading CHO:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileUrl) => {
    try {
      const choToDelete = chos.find(cho => cho.fileUrl === fileUrl);
      if (!choToDelete) return;

      await axios.delete(`${BASE_URL}/api/chos/${choToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setChos(prev => prev.filter(cho => cho._id !== choToDelete._id));
    } catch (err) {
      console.error('Error deleting CHO:', err);
      alert('Failed to delete CHO. Make sure you are the owner.');
    }
  };

  useEffect(() => {
    const fetchCHOs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/chos`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setChos(res.data);
      } catch (err) {
        console.error('Error fetching CHOs:', err);
      }
    };

    fetchCHOs();
  }, []);

  // Filtered and sorted CHOs
  const filteredChos = chos
    .filter(cho => {
      const type = getFileType(cho.fileUrl, cho.fileType);
      if (searchTerm && !(
        cho.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cho.description.toLowerCase().includes(searchTerm.toLowerCase())
      )) return false;
      if (fileTypeFilter !== 'all' && type !== fileTypeFilter) return false;
      if (dateFrom && new Date(cho.createdAt || cho.uploadDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(cho.createdAt || cho.uploadDate) > new Date(dateTo)) return false;
      return true;
    })
    .sort((a, b) => {
      const aDate = new Date(a.createdAt || a.uploadDate);
      const bDate = new Date(b.createdAt || b.uploadDate);
      return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[var(--neutral)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--accent)] mb-2 tracking-tight drop-shadow-sm">
              CHO Uploads
            </h1>
            <p className="text-[var(--neutral)]/70 text-lg">
              Teachers can upload and manage CHO PDFs, images, and documents
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormData({ title: '', description: '', file: null });
              setFormErrors({});
            }}
            className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-xl font-semibold shadow-lg hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2 text-lg"
          >
            <Plus className="h-5 w-5" />
            {showForm ? 'Close Form' : 'Add New CHO'}
          </button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="bg-[var(--secondary)] rounded-2xl p-8 mb-10 shadow-xl border border-[var(--accent)]/20">
            <h2 className="text-2xl font-bold mb-6 text-[var(--accent)]">Upload CHO</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium mb-2 text-[var(--neutral)]">Title *</label>
                  <input
                    type="text"
                    placeholder="CHO Title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, title: e.target.value }));
                      setFormErrors(prev => ({ ...prev, title: '' }));
                    }}
                    className={`w-full px-4 py-3 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${formErrors.title ? 'border-red-500' : 'border-[var(--accent)]/30'}`}
                  />
                  {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-[var(--neutral)]">File *</label>
                  <input
                    type="file"
                    accept=".pdf, image/*, .doc, .docx, .xls, .xlsx"
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
                      setFormErrors(prev => ({ ...prev, file: '' }));
                    }}
                    className="block w-full px-4 py-3 text-[var(--neutral)] bg-[var(--primary)] border border-[var(--accent)]/30 rounded-lg"
                  />
                  {formErrors.file && <p className="text-red-500 text-sm mt-1">{formErrors.file}</p>}
                </div>
              </div>
              <div>
                <label className="block text-base font-medium mb-2 text-[var(--neutral)]">Description *</label>
                <textarea
                  placeholder="Description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                    setFormErrors(prev => ({ ...prev, description: '' }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${formErrors.description ? 'border-red-500' : 'border-[var(--accent)]/30'}`}
                />
                {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
              </div>
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
                  {uploading ? 'Uploading...' : 'Upload CHO'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: '', description: '', file: null });
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

        {/* Search & Filter Bar */}
        <div className="sticky top-16 z-30 mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-end bg-[var(--secondary)]/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-[var(--accent)]/10">
          <div className="flex-1 flex items-center gap-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)]/70 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title or description..."
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
              <label className="text-xs font-medium mb-1 text-[var(--neutral)]">File Type</label>
              <select
                className="px-3 py-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--primary)] text-[var(--neutral)]"
                value={fileTypeFilter}
                onChange={e => setFileTypeFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
                <option value="word">Word</option>
                <option value="excel">Excel</option>
                <option value="other">Other</option>
              </select>
            </div>
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
              <label className="text-xs font-medium mb-1 text-[var(--neutral)]"> </label>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFileTypeFilter('all');
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

        {/* CHO Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredChos.map((cho, index) => {
            const type = getFileType(cho.fileUrl, cho.fileType);
            const fileTypeLabel = type === 'pdf' ? 'PDF' : type === 'image' ? 'Image' : type === 'word' ? 'Word' : type === 'excel' ? 'Excel' : 'Other';
            return (
              <div key={index} className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] border border-[var(--accent)]/10 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow relative group flex flex-col justify-between">
                {/* File type badge */}
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow mb-3 ${type === 'pdf' ? 'bg-red-100 text-red-700' : type === 'image' ? 'bg-blue-100 text-blue-700' : type === 'word' ? 'bg-indigo-100 text-indigo-700' : type === 'excel' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{fileTypeLabel}</span>
                {/* Delete button */}
                <button
                  onClick={() => setDeleteTarget(cho)}
                  title="Delete"
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--primary)]/80 border border-[var(--accent)]/20 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <h3 className="text-xl font-bold mb-2 mt-5 pr-8 truncate" title={cho.title}>{cho.title}</h3>
                <p className="text-base text-[var(--neutral)]/70 mb-3 line-clamp-2" title={cho.description}>{cho.description}</p>
                {/* Upload date */}
                <div className="mb-3 text-xs text-[var(--neutral)]/60 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[var(--primary)]/60 rounded-full font-semibold">
                    {new Date(cho.createdAt || cho.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                {/* Preview/Download actions */}
                {type === 'pdf' ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className='flex gap-2'>
                      <a
                        href={cho.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)]/20 transition-colors flex items-center justify-center gap-1"
                      >
                        <FileText className="w-4 h-4" /> View PDF
                      </a>
                      <button
                        onClick={() => setPreviewCHO({ url: cho.fileUrl, type: 'pdf', title: cho.title })}
                        className="flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)]/10 transition-colors border border-[var(--accent)]/30 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> Preview
                      </button>
                    </div>
                    <a
                      href={cho.fileUrl}
                      download
                      className="flex-1 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText className="w-4 h-4" /> Download
                    </a>
                  </div>
                ) : type === 'image' ? (
                  <div className="flex gap-2 items-center mt-2">
                    <img
                      src={cho.fileUrl}
                      alt={cho.title}
                      className="rounded-lg max-h-32 object-cover cursor-pointer flex-1"
                      onClick={() => setPreviewCHO({ url: cho.fileUrl, type: 'image', title: cho.title })}
                    />
                    <a
                      href={cho.fileUrl}
                      download
                      className="flex-1 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText className="w-4 h-4" /> Download
                    </a>
                  </div>
                ) : type === 'word' || type === 'excel' ? (
                  <div className="flex gap-2 mt-2">
                    <a
                      href={cho.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)]/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText className="w-4 h-4" /> View
                    </a>
                    <button
                      onClick={() => setPreviewCHO({ url: cho.fileUrl, type, title: cho.title })}
                      className="flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)]/10 transition-colors border border-[var(--accent)]/30 flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                    <a
                      href={cho.fileUrl}
                      download
                      className="flex-1 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText className="w-4 h-4" /> Download
                    </a>
                  </div>
                ) : (
                  <a
                    href={cho.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="flex-1 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-1 mt-2"
                  >
                    <FileText className="w-4 h-4" /> Download
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {filteredChos.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[var(--neutral)]/50 text-7xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-[var(--neutral)] mb-2">No CHOs found</h3>
            <p className="text-[var(--neutral)]/70 mb-6 text-lg">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-[var(--secondary)] rounded-xl shadow-lg max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-2xl text-[var(--neutral)]/60 hover:text-[var(--accent)]" onClick={() => setDeleteTarget(null)}>&times;</button>
            <h2 className="text-lg font-bold mb-4 text-center">Confirm Deletion</h2>
            <p className="mb-6 text-center">Are you sure you want to delete <span className="font-semibold text-[var(--accent)]">{deleteTarget.title}</span>? This action cannot be undone.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={async () => {
                  await handleDelete(deleteTarget.fileUrl);
                  setDeleteTarget(null);
                }}
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

      {/* Universal Preview Modal */}
      {previewCHO && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewCHO(null)}
        >
          <div className="bg-[var(--secondary)] rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-2xl text-[var(--neutral)]/60 hover:text-[var(--accent)]"
              onClick={() => setPreviewCHO(null)}
            >
              &times;
            </button>
            <div className="p-6 flex-1 flex flex-col items-center justify-center overflow-auto">
              <h2 className="text-lg font-bold mb-4 text-center">{previewCHO.title}</h2>
              {previewCHO.type === 'image' && (
                <img src={previewCHO.url} alt="Preview" className="max-h-[60vh] rounded-lg shadow" />
              )}
              {previewCHO.type === 'pdf' && (
                <iframe
                  src={previewCHO.url}
                  title="PDF Preview"
                  className="w-full h-[60vh] rounded-lg border"
                />
              )}
              {(previewCHO.type === 'word' || previewCHO.type === 'excel') && (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(previewCHO.url)}&embedded=true`}
                  title="Office Preview"
                  className="w-full h-[60vh] rounded-lg border"
                />
              )}
              {previewCHO.type === 'other' && (
                <div className="text-center text-[var(--neutral)]/70">
                  <p>Preview not supported for this file type.</p>
                  <a href={previewCHO.url} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline">Download File</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
