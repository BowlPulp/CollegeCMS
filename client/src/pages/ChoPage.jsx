import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

export default function CHOPage() {
  const { theme } = useTheme();
  const [chos, setChos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', file: null });
  const [formErrors, setFormErrors] = useState({});
  const [uploading, setUploading] = useState(false);

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
    // Upload to Cloudinary
    const cloudinaryRes = await axios.post(CLOUDINARY_URL, data);

    const newCHO = {
      title: formData.title,
      description: formData.description,
      fileUrl: cloudinaryRes.data.secure_url,
      fileType: formData.file.type,
    };

    // Send to your backend API
    const apiRes = await axios.post(
      `${BASE_URL}/api/chos`,  // adjust the URL as per your backend route
      newCHO,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // if using JWT auth
        },
      }
    );

    setChos(prev => [apiRes.data, ...prev]); // Use response from DB, which includes _id etc.
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
    // Find the CHO with the matching fileUrl
    const choToDelete = chos.find(cho => cho.fileUrl === fileUrl);
    if (!choToDelete) return;

    // Send DELETE request to backend
    await axios.delete(`${BASE_URL}/api/chos/${choToDelete._id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // if using JWT
      },
    });

    // Remove from UI after successful backend deletion
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



  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--neutral)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">CHO Uploads</h1>
            <p className="text-[var(--neutral)]/70">Teachers can upload CHO PDFs or images</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormData({ title: '', description: '', file: null });
              setFormErrors({});
            }}
            className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg flex items-center gap-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            {showForm ? 'Close Form' : 'Add New CHO'}
          </button>
        </div>

        {showForm && (
          <div className="bg-[var(--secondary)] rounded-xl p-6 mb-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Upload CHO</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="CHO Title"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  setFormErrors(prev => ({ ...prev, title: '' }));
                }}
                className={`w-full p-3 rounded-lg border ${
                  formErrors.title ? 'border-red-500' : 'border-[var(--accent)]/30'
                } bg-[var(--primary)] text-[var(--neutral)]`}
              />
              {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}

              <textarea
                placeholder="Description"
                rows={4}
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  setFormErrors(prev => ({ ...prev, description: '' }));
                }}
                className={`w-full p-3 rounded-lg border ${
                  formErrors.description ? 'border-red-500' : 'border-[var(--accent)]/30'
                } bg-[var(--primary)] text-[var(--neutral)]`}
              />
              {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}

              <input
                type="file"
                accept=".pdf, image/*"
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, file: e.target.files[0] }));
                  setFormErrors(prev => ({ ...prev, file: '' }));
                }}
                className="block w-full p-3 text-[var(--neutral)] bg-[var(--primary)] border border-[var(--accent)]/30 rounded-lg"
              />
              {formErrors.file && <p className="text-red-500 text-sm">{formErrors.file}</p>}

              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg flex items-center gap-2 font-medium"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--primary)] border-t-transparent"></div>
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload CHO
              </button>
            </form>
          </div>
        )}

        {/* CHO Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chos.map((cho, index) => (
            <div key={index} className="bg-[var(--secondary)] rounded-xl p-4 shadow-lg relative">
              <h3 className="text-lg font-semibold mb-1">{cho.title}</h3>
              <p className="text-sm text-[var(--neutral)]/70 mb-2">{cho.description}</p>

              {cho.fileType.includes('pdf') ? (
                <a
                  href={cho.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--accent)] text-sm underline flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" /> View PDF
                </a>
              ) : (
                <img
                  src={cho.fileUrl}
                  alt={cho.title}
                  className="rounded-lg mt-2 max-h-48 object-cover"
                />
              )}

              <button
                onClick={() => handleDelete(cho.fileUrl)}
                title="Delete"
                className="absolute top-4 right-4"
              >
                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
              </button>
            </div>
          ))}
        </div>

        {chos.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-[var(--neutral)] mb-2">No CHOs uploaded yet</h3>
            <p className="text-[var(--neutral)]/70 mb-6">Be the first to upload course handouts</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium"
            >
              Upload CHO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
