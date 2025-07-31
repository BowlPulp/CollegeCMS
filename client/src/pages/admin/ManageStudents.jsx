import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Users, 
  UserPlus, 
  Upload, 
  FileText, 
  Database,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download
} from 'lucide-react';
import axios from '../../api/axios';

const ManageStudents = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("add");
  const [addOption, setAddOption] = useState("one");
  const [bulkOption, setBulkOption] = useState("json");
  const [jsonInput, setJsonInput] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searching, setSearching] = useState(false);
  const observer = useRef();
  // Add these missing states:
  const [filters, setFilters] = useState({
    branch: '',
    updatedGroup: '',
    cluster: '',
    specialization: '',
    campus: '',
    finalStatus: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    branch: [],
    updatedGroup: [],
    cluster: [],
    specialization: [],
    campus: [],
    finalStatus: []
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    universityRollNumber: '',
    updatedGroup: '',
    campus: '',
    branch: '',
    cluster: '',
    specialization: '',
    newVendor: '',
    finalStatus: false,
    remarks: '',
    motherName: '',
    fatherName: '',
    parentsMobile: '',
    mobNumber: ''
  });
  const [showFilter, setShowFilter] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Fetch filter options on mount
  useEffect(() => {
    axios.get('/api/students/filters').then(res => {
      setFilterOptions(res.data.data);
    });
  }, []);

  // Fetch students (paginated, filtered)
  const fetchStudents = useCallback(async (reset = false, customPage = 1, customFilters = filters) => {
    setLoading(true);
    try {
      const params = { ...customFilters, page: customPage, limit: 20 };
      const res = await axios.get('/api/students/list', { params });
      const newStudents = res.data.data.students;
      setStudents(prev => reset ? newStudents : [...prev, ...newStudents]);
      setHasMore(res.data.data.page < res.data.data.totalPages);
      setPage(res.data.data.page);
    } catch (err) {
      if (reset) setStudents([]);
      setHasMore(false);
    }
    setLoading(false);
  }, [filters]);

  // Initial and filter change load
  useEffect(() => {
    setPage(1);
    fetchStudents(true, 1, filters);
  }, [filters, fetchStudents]);

  // Infinite scroll observer
  const lastStudentRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !searching) {
        fetchStudents(false, page + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, fetchStudents, searching]);

  // Search logic (local first, then API if not found)
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    // Local search
    const localResults = students.filter(s =>
      (s.studentName && s.studentName.toLowerCase().includes(searchInput.toLowerCase())) ||
      (s.universityRollNumber && s.universityRollNumber.toLowerCase().includes(searchInput.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchInput.toLowerCase()))
    );
    if (localResults.length > 0) {
      setStudents(localResults);
      setHasMore(false);
      setSearching(false);
      setSearchTerm(searchInput);
      return;
    }
    // API search
    setLoading(true);
    try {
      const params = { ...filters, search: searchInput, page: 1, limit: 20 };
      const res = await axios.get('/api/students/list', { params });
      setStudents(res.data.data.students);
      setHasMore(res.data.data.page < res.data.data.totalPages);
      setPage(res.data.data.page);
      setSearchTerm(searchInput);
    } catch (err) {
      setStudents([]);
      setHasMore(false);
    }
    setLoading(false);
    setSearching(false);
  };

  // Reset search
  const handleResetSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
    fetchStudents(true, 1, filters);
  };

  // Add one student
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/students', formData);
      setFormData({
        studentName: '', email: '', universityRollNumber: '', updatedGroup: '', campus: '', branch: '', cluster: '', specialization: '', newVendor: '', finalStatus: false, remarks: '', motherName: '', fatherName: '', parentsMobile: '', mobNumber: ''
      });
      fetchStudents();
      alert('Student added successfully!');
    } catch (err) {
      alert('Failed to add student.');
    }
  };

  // Bulk add students from JSON
  const handleBulkJson = async () => {
    try {
      const studentsArr = JSON.parse(jsonInput);
      await axios.post('/api/students/upload', { students: studentsArr });
      setJsonInput("");
      fetchStudents();
      alert('Bulk students added!');
    } catch (err) {
      alert('Bulk add failed. Check your JSON.');
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await axios.delete(`/api/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const sampleJsonFormat = `[
  {
    "studentName": "John Doe",
    "email": "john@example.com",
    "universityRollNumber": "CSE001"
  },
  {
    "studentName": "Jane Smith",
    "email": "jane@example.com",
    "universityRollNumber": "CSE002"
  }
]`;

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--neutral)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto pt-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-[var(--accent)]" />
            <h1 className="text-3xl font-bold text-[var(--neutral)]">
              Manage Students
            </h1>
          </div>
          <p className="text-[var(--neutral)]/70">
            Add new students or manage existing student records in your system
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-[var(--secondary)] p-2 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "add" 
                ? "bg-[var(--accent)] text-[var(--primary)]" 
                : "text-[var(--neutral)] hover:bg-[var(--accent)]/20"
            }`}
          >
            <Plus className="h-4 w-4" />
            Add Students
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "manage" 
                ? "bg-[var(--accent)] text-[var(--primary)]" 
                : "text-[var(--neutral)] hover:bg-[var(--accent)]/20"
            }`}
          >
            <Eye className="h-4 w-4" />
            Manage Students
          </button>
        </div>

        {/* Add Students Tab */}
        {activeTab === "add" && (
          <div className="bg-[var(--secondary)] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-[var(--neutral)]">
              Add New Students
            </h2>

            {/* Add Options */}
            <div className="flex gap-2 mb-6 bg-[var(--primary)] p-2 rounded-lg w-fit">
              <button
                onClick={() => setAddOption("one")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  addOption === "one" 
                    ? "bg-[var(--accent)] text-[var(--primary)]" 
                    : "text-[var(--neutral)] hover:bg-[var(--accent)]/20"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Add One by One
              </button>
              <button
                onClick={() => setAddOption("bulk")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  addOption === "bulk" 
                    ? "bg-[var(--accent)] text-[var(--primary)]" 
                    : "text-[var(--neutral)] hover:bg-[var(--accent)]/20"
                }`}
              >
                <Database className="h-4 w-4" />
                Add in Bulk
              </button>
            </div>

            {/* Add One by One Form */}
            {addOption === "one" && (
              <div className="bg-[var(--primary)] rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-[var(--neutral)]">
                  Student Information
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter student name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      University Roll Number *
                    </label>
                    <input
                      type="text"
                      name="universityRollNumber"
                      value={formData.universityRollNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter roll number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      name="mobNumber"
                      value={formData.mobNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Group
                    </label>
                    <input
                      type="text"
                      name="updatedGroup"
                      value={formData.updatedGroup}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter group"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Campus
                    </label>
                    <input
                      type="text"
                      name="campus"
                      value={formData.campus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter campus"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Branch
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter branch"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Cluster
                    </label>
                    <input
                      type="text"
                      name="cluster"
                      value={formData.cluster}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter cluster"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter specialization"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      New Vendor
                    </label>
                    <input
                      type="text"
                      name="newVendor"
                      value={formData.newVendor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter new vendor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Final Status
                    </label>
                    <input
                      type="checkbox"
                      name="finalStatus"
                      checked={formData.finalStatus}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-[var(--neutral)]">Finalized</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Remarks
                    </label>
                    <input
                      type="text"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter remarks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Mother Name
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter mother name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Father Name
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter father name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Parents Mobile
                    </label>
                    <input
                      type="text"
                      name="parentsMobile"
                      value={formData.parentsMobile}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter parents mobile"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button 
                      type="submit" 
                      className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add Student
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Bulk Add Options */}
            {addOption === "bulk" && (
              <div className="bg-[var(--primary)] rounded-lg p-6">
                <div className="flex gap-2 mb-6 bg-[var(--secondary)] p-2 rounded-lg w-fit">
                  <button
                    onClick={() => setBulkOption("json")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      bulkOption === "json" 
                        ? "bg-[var(--accent)] text-[var(--primary)]" 
                        : "text-[var(--neutral)] hover:bg-[var(--accent)]/20"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Paste JSON
                  </button>
                  <button
                    onClick={() => setBulkOption("excel")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      bulkOption === "excel" 
                        ? "bg-[var(--accent)] text-[var(--primary)]" 
                        : "text-[var(--neutral)] hover:bg-[var(--accent)]/20"
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Excel
                  </button>
                </div>

                {bulkOption === "json" && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      JSON Data
                    </label>
                    <div className="mb-4 p-3 bg-[var(--secondary)] rounded-lg border border-[var(--accent)]/30">
                      <p className="text-sm text-[var(--neutral)]/70 mb-2">Expected format:</p>
                      <pre className="text-xs text-[var(--accent)] overflow-x-auto">
                        {sampleJsonFormat}
                      </pre>
                    </div>
                    <textarea
                      rows={8}
                      className="w-full px-4 py-3 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Paste students JSON data here..."
                      value={jsonInput}
                      onChange={e => setJsonInput(e.target.value)}
                    />
                    <button type="button" onClick={handleBulkJson} className="mt-4 px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Add Students from JSON
                    </button>
                  </div>
                )}

                {bulkOption === "excel" && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Excel File
                    </label>
                    <div className="border-2 border-dashed border-[var(--accent)]/30 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-[var(--accent)] mx-auto mb-4" />
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={e => setExcelFile(e.target.files[0])}
                        className="mb-4"
                        id="excel-upload"
                      />
                      <label htmlFor="excel-upload" className="block">
                        <p className="text-[var(--neutral)] mb-2">
                          {excelFile ? excelFile.name : "Choose Excel file or drag and drop"}
                        </p>
                        <p className="text-[var(--neutral)]/60 text-sm">
                          Supports .xlsx and .xls files
                        </p>
                      </label>
                    </div>
                    <button 
                      className="mt-4 px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2"
                      disabled={!excelFile}
                    >
                      <Upload className="h-4 w-4" />
                      Upload & Add Students
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manage Students Tab */}
        {activeTab === "manage" && (
          <div className="bg-[var(--secondary)] rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[var(--neutral)]">
                Student Records
              </h2>
              <button className="px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral)]/50" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleSearch(e);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral)]/70 hover:text-[var(--accent)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                  </button>
                )}
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral)]/70 hover:text-[var(--accent)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </button>
                )}
              </div>
              <button type="button" onClick={() => setShowFilter(true)} className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>

            {/* Filter Modal */}
            {showFilter && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-[var(--secondary)] rounded-xl p-6 w-full max-w-md shadow-lg relative">
                  <button onClick={() => setShowFilter(false)} className="absolute top-2 right-2 text-[var(--neutral)]/60 hover:text-[var(--accent)] text-xl">&times;</button>
                  <h3 className="text-lg font-semibold mb-4 text-[var(--neutral)]">Filter Students</h3>
                  <form onSubmit={e => { e.preventDefault(); fetchStudents(true, 1, filters); setShowFilter(false); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--neutral)]">Branch</label>
                      <select className="w-full px-3 py-2 rounded border bg-[var(--primary)] text-[var(--neutral)]" value={filters.branch} onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))} >
                        <option value="">Any</option>
                        {filterOptions.branch.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--neutral)]">Group</label>
                      <select className="w-full px-3 py-2 rounded border bg-[var(--primary)] text-[var(--neutral)]" value={filters.updatedGroup} onChange={e => setFilters(f => ({ ...f, updatedGroup: e.target.value }))} >
                        <option value="">Any</option>
                        {filterOptions.updatedGroup.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--neutral)]">Cluster</label>
                      <select className="w-full px-3 py-2 rounded border bg-[var(--primary)] text-[var(--neutral)]" value={filters.cluster} onChange={e => setFilters(f => ({ ...f, cluster: e.target.value }))} >
                        <option value="">Any</option>
                        {filterOptions.cluster.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--neutral)]">Specialization</label>
                      <select className="w-full px-3 py-2 rounded border bg-[var(--primary)] text-[var(--neutral)]" value={filters.specialization} onChange={e => setFilters(f => ({ ...f, specialization: e.target.value }))} >
                        <option value="">Any</option>
                        {filterOptions.specialization.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--neutral)]">Campus</label>
                      <select className="w-full px-3 py-2 rounded border bg-[var(--primary)] text-[var(--neutral)]" value={filters.campus} onChange={e => setFilters(f => ({ ...f, campus: e.target.value }))} >
                        <option value="">Any</option>
                        {filterOptions.campus.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--neutral)]">Final Status</label>
                      <select className="w-full px-3 py-2 rounded border bg-[var(--primary)] text-[var(--neutral)]" value={filters.finalStatus} onChange={e => setFilters(f => ({ ...f, finalStatus: e.target.value }))}>
                        <option value="">Any</option>
                        <option value="true">Finalized</option>
                        <option value="false">Pending</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button type="button" onClick={() => { setFilters({ branch: '', updatedGroup: '', cluster: '', specialization: '', campus: '', finalStatus: '' }); fetchStudents(true, 1, filters); setShowFilter(false); }} className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors">Clear</button>
                      <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors">Apply</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View Student Modal */}
            {showViewModal && selectedStudent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all">
                <div className="bg-white dark:bg-[var(--secondary)] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 relative animate-fadeIn">
                  <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-[var(--accent)]">
                    <h3 className="text-lg font-bold text-[var(--primary)]">Student Details</h3>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="text-[var(--primary)] text-2xl font-bold hover:text-red-500 transition"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      {Object.entries(selectedStudent).filter(([key]) =>
                        !['_id', '__v', 'createdAt', 'updatedAt'].includes(key)
                      ).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wide mb-1">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="text-base text-[var(--neutral)] break-all">
                            {typeof value === 'boolean'
                              ? value ? 'Yes' : 'No'
                              : (value === '' || value == null ? <span className="text-gray-400">—</span> : value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Student Modal */}
            {showEditModal && editFormData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all">
                <div className="bg-white dark:bg-[var(--secondary)] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 relative animate-fadeIn">
                  <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-[var(--accent)]">
                    <h3 className="text-lg font-bold text-[var(--primary)]">Edit Student</h3>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-[var(--primary)] text-2xl font-bold hover:text-red-500 transition"
                    >
                      &times;
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await axios.put(`/api/students/${editFormData._id}`, editFormData);
                        setShowEditModal(false);
                        setEditFormData(null);
                        fetchStudents(true, 1, filters);
                        alert('Student updated successfully!');
                      } catch (err) {
                        alert('Failed to update student.');
                      }
                    }}
                    className="p-6 max-h-[70vh] overflow-y-auto space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      {Object.entries(editFormData).filter(([key]) =>
                        !['_id', '__v', 'createdAt', 'updatedAt'].includes(key)
                      ).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <label className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wide mb-1">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </label>
                          {typeof value === 'boolean' ? (
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={e => setEditFormData(f => ({ ...f, [key]: e.target.checked }))}
                              className="h-5 w-5 accent-[var(--accent)]"
                            />
                          ) : (
                            <input
                              type="text"
                              value={value || ''}
                              onChange={e => setEditFormData(f => ({ ...f, [key]: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] border-[var(--accent)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Student Modal with OTP */}
            {showDeleteModal && deleteStudent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all">
                <div className="bg-white dark:bg-[var(--secondary)] rounded-2xl shadow-2xl w-full max-w-md mx-4 relative animate-fadeIn">
                  <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-red-500">
                    <h3 className="text-lg font-bold text-white">Delete Student</h3>
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="text-white text-2xl font-bold hover:text-yellow-200 transition"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="p-6">
                    <p className="mb-2 text-[var(--neutral)]">
                      Are you sure you want to <span className="font-bold text-red-500">delete</span> this student?
                    </p>
                    <div className="mb-4 text-sm text-[var(--neutral)]/80">
                      <div><span className="font-semibold">Name:</span> {deleteStudent.studentName}</div>
                      <div><span className="font-semibold">Roll No:</span> {deleteStudent.universityRollNumber}</div>
                      <div><span className="font-semibold">Email:</span> {deleteStudent.email}</div>
                    </div>
                    <div className="mb-4">
                      <div className="mb-1 text-sm text-[var(--neutral)]/80">Enter the OTP to confirm deletion:</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 font-mono text-lg tracking-widest text-[var(--accent)]">{deleteOtp}</span>
                        <button
                          type="button"
                          className="text-xs text-[var(--accent)] underline"
                          onClick={() => {
                            const otp = Math.floor(100000 + Math.random() * 900000).toString();
                            setDeleteOtp(otp);
                            setEnteredOtp('');
                            setDeleteError('');
                          }}
                        >
                          Regenerate
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={e => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-2 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] border-[var(--accent)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        placeholder="Enter OTP"
                      />
                      {deleteError && <div className="text-red-500 text-xs mt-1">{deleteError}</div>}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-[var(--neutral)] rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                        onClick={async () => {
                          if (enteredOtp !== deleteOtp) {
                            setDeleteError('Incorrect OTP. Please try again.');
                            return;
                          }
                          try {
                            await axios.delete(`/api/students/${deleteStudent._id}`);
                            setShowDeleteModal(false);
                            setDeleteStudent(null);
                            fetchStudents(true, 1, filters);
                            alert('Student deleted successfully!');
                          } catch (err) {
                            setDeleteError('Delete failed. Please try again.');
                          }
                        }}
                        disabled={enteredOtp.length !== 6}
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--accent)]/20">
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Roll No</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Group</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Branch</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Cluster</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Specialization</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Campus</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Mobile</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Parents Mobile</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Mother Name</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Father Name</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Remarks</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">New Vendor</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={16} className="text-center py-6">Loading...</td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan={16} className="text-center py-6">No students found.</td></tr>
                  ) : students.map((student, index) => (
                    <tr key={student._id} className="border-b border-[var(--accent)]/10 hover:bg-[var(--primary)] transition-colors" ref={students.length === index + 1 ? lastStudentRef : null}>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.studentName}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]/70">{student.email}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.universityRollNumber}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.updatedGroup}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.branch}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.cluster}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.specialization}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.campus}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.mobNumber}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.parentsMobile}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.motherName}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.fatherName}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.remarks}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.newVendor}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.finalStatus
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {student.finalStatus ? 'Finalized' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            className="p-1 text-[var(--neutral)]/70 hover:text-[var(--accent)] transition-colors"
                            onClick={() => { setSelectedStudent(student); setShowViewModal(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-[var(--neutral)]/70 hover:text-[var(--accent)] transition-colors"
                            onClick={() => { setEditFormData(student); setShowEditModal(true); }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-[var(--neutral)]/70 hover:text-red-500 transition-colors"
                            onClick={() => {
                              const otp = Math.floor(100000 + Math.random() * 900000).toString();
                              setDeleteOtp(otp);
                              setEnteredOtp('');
                              setDeleteError('');
                              setDeleteStudent(student);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination would go here */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-[var(--neutral)]/70">
                Showing {students.length} student{students.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                {/* Add pagination buttons here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
