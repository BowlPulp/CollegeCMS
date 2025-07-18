import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Upload, Eye, Trash2, ExternalLink, Calendar, User, Plus, Shield, Copy, FileText } from 'lucide-react';
import SheetPreview from '../components/SheetPreview';

export default function SheetManager() {
  const { theme } = useTheme();
  const [sheets, setSheets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [previewSheet, setPreviewSheet] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteOTP, setDeleteOTP] = useState('');
  const [userOTP, setUserOTP] = useState('');
  const [otpError, setOtpError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load sheets from localStorage on component mount
  useEffect(() => {
    const savedSheets = localStorage.getItem('uploaded-sheets');
    if (savedSheets) {
      setSheets(JSON.parse(savedSheets));
    }
  }, []);

  // Save sheets to localStorage whenever sheets change
  useEffect(() => {
    localStorage.setItem('uploaded-sheets', JSON.stringify(sheets));
  }, [sheets]);

  // Generate random 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Validate Google Sheets URL
  const validateGoogleSheetsUrl = (url) => {
    const googleSheetsRegex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    return googleSheetsRegex.test(url);
  };

  // Convert Google Sheets URL to embeddable format
  const convertToEmbeddableUrl = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      const sheetId = match[1];
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`;
    }
    return url;
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      errors.title = 'Title must not exceed 100 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }

    if (!formData.link.trim()) {
      errors.link = 'Google Sheets link is required';
    } else if (!validateGoogleSheetsUrl(formData.link)) {
      errors.link = 'Please provide a valid Google Sheets URL';
    }

    return errors;
  };

  // Handle form submission
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSheet = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        originalLink: formData.link.trim(),
        embeddableLink: convertToEmbeddableUrl(formData.link.trim()),
        uploadedBy: 'devtester',
        userId: '123456',
        uploadDate: new Date().toISOString(),
        createdAt: new Date().toLocaleString()
      };

      setSheets(prev => [newSheet, ...prev]);
      setFormData({ title: '', description: '', link: '' });
      setFormErrors({});
      setShowForm(false);
    } catch (error) {
      setFormErrors({ submit: 'Failed to upload sheet. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (sheetId) => {
    const otp = generateOTP();
    setDeleteOTP(otp);
    setDeleteConfirm(sheetId);
    setUserOTP('');
    setOtpError('');
  };

  // Handle OTP input
  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only allow digits, max 6
    setUserOTP(value);
    if (otpError) {
      setOtpError('');
    }
  };

  // Prevent paste in OTP field
  const handleOTPPaste = (e) => {
    e.preventDefault();
    return false;
  };

  // Handle delete sheet
  const handleDelete = () => {
    if (userOTP !== deleteOTP) {
      setOtpError('OTP does not match. Please try again.');
      return;
    }

    setSheets(prev => prev.filter(sheet => sheet.id !== deleteConfirm));
    setDeleteConfirm(null);
    setDeleteOTP('');
    setUserOTP('');
    setOtpError('');
  };

  // Handle preview
  const handlePreview = (sheet) => {
    setPreviewSheet(sheet);
  };

  // Get sheet to delete details
  const sheetToDelete = sheets.find(sheet => sheet.id === deleteConfirm);

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--neutral)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--neutral)] mb-2">
              Google Sheets Manager
            </h1>
            <p className="text-[var(--neutral)]/70">
              Upload and manage your Google Sheets for easy access and sharing
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Sheet
          </button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="bg-[var(--secondary)] rounded-xl p-6 mb-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-[var(--neutral)]">
              Upload New Google Sheet
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                      formErrors.title ? 'border-red-500' : 'border-[var(--accent)]/30'
                    }`}
                    placeholder="Enter sheet title"
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                    Google Sheets Link *
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                      formErrors.link ? 'border-red-500' : 'border-[var(--accent)]/30'
                    }`}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                  />
                  {formErrors.link && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.link}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                    formErrors.description ? 'border-red-500' : 'border-[var(--accent)]/30'
                  }`}
                  placeholder="Describe what this sheet contains..."
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>
              {formErrors.submit && (
                <p className="text-red-500 text-sm">{formErrors.submit}</p>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--primary)] border-t-transparent"></div>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isLoading ? 'Uploading...' : 'Upload Sheet'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: '', description: '', link: '' });
                    setFormErrors({});
                  }}
                  className="px-6 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sheets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="bg-[var(--secondary)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[var(--neutral)] line-clamp-2">
                  {sheet.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(sheet)}
                    className="p-2 text-[var(--neutral)]/70 hover:text-[var(--accent)] transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(sheet.id)}
                    className="p-2 text-[var(--neutral)]/70 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-[var(--neutral)]/70 text-sm mb-4 line-clamp-3">
                {sheet.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-[var(--neutral)]/60 mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {sheet.uploadedBy}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(sheet.uploadDate).toLocaleDateString()}
                </div>
              </div>
              
              <button
                onClick={() => window.open(sheet.originalLink, '_blank')}
                className="w-full px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Sheet
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sheets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[var(--neutral)]/50 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-[var(--neutral)] mb-2">
              No sheets uploaded yet
            </h3>
            <p className="text-[var(--neutral)]/70 mb-6">
              Upload your first Google Sheet to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
            >
              Upload Your First Sheet
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewSheet && (
        <SheetPreview
          sheet={previewSheet}
          onClose={() => setPreviewSheet(null)}
        />
      )}

      {/* Delete Confirmation Modal with OTP */}
      {deleteConfirm && sheetToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--secondary)] rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-[var(--neutral)]">
                Confirm Deletion
              </h3>
            </div>
            
            <p className="text-[var(--neutral)]/70 mb-4">
              Are you sure you want to delete this sheet? This action cannot be undone.
            </p>

            {/* Sheet Details */}
            <div className="bg-[var(--primary)] rounded-lg p-4 mb-6 border border-[var(--accent)]/20">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[var(--neutral)] mb-2 break-words">
                    {sheetToDelete.title}
                  </h4>
                  <p className="text-sm text-[var(--neutral)]/70 mb-3 break-words">
                    {sheetToDelete.description.length > 100 
                      ? `${sheetToDelete.description.substring(0, 100)}...` 
                      : sheetToDelete.description
                    }
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-[var(--neutral)]/60">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Uploaded by: {sheetToDelete.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Date: {new Date(sheetToDelete.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Display */}
            <div className="bg-[var(--primary)] rounded-lg p-3 mb-4 border-2 border-[var(--accent)]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-[var(--neutral)]">
                    Verification Code:
                  </p>
                  <p className="text-lg font-mono font-bold text-[var(--accent)] tracking-widest">
                    {deleteOTP}
                  </p>
                </div>
              </div>
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                Enter the verification code:
              </label>
              <input
                type="text"
                value={userOTP}
                onChange={handleOTPChange}
                onPaste={handleOTPPaste}
                className={`w-full px-4 py-2 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono text-xl tracking-widest text-center ${
                  otpError ? 'border-red-500' : 'border-[var(--accent)]/30'
                }`}
                placeholder="000000"
                maxLength={6}
              />
              {otpError && (
                <p className="text-red-500 text-sm mt-1">{otpError}</p>
              )}
              <p className="text-xs text-[var(--neutral)]/60 mt-2">
                Type the 6-digit code above. Paste is disabled for security.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                disabled={userOTP.length !== 6}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Sheet
              </button>
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setDeleteOTP('');
                  setUserOTP('');
                  setOtpError('');
                }}
                className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors"
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
