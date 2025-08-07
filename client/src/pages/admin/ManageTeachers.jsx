import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
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

const defaultForm = {
  name: '',
  email: '',
  staffId: '',
  contactNo: '',
  designation: '',
  role: 'teacher',
  isVerified: false,
  mentoringGroups: '',
  // `pinnedSheets` is not a text field, will be omitted from initial add
};

const ManageTeachers = () => {
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
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const currentUser = useAuthStore((s) => s.user);
  // Filter fields: role, isVerified, designation
  const [filters, setFilters] = useState({
  
  });
  const [filterOptions, setFilterOptions] = useState({
    role: [],
    designation: [],
    isVerified: ['', 'true', 'false'],
  });

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [showFilter, setShowFilter] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTeacher, setDeleteTeacher] = useState(null);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Fetch filter options on mount
  useEffect(() => {
    axios.get('/api/teachers/filters').then(res => {
      setFilterOptions({
        ...filterOptions,
        ...res.data.data
      });
    });
    // eslint-disable-next-line
  }, []);

  // Teacher Fetching
  const fetchTeachers = useCallback(async (reset = false, customPage = 1, customFilters = filters) => {
    setLoading(true);
    try {
      const params = { ...customFilters, page: customPage, limit: 20 };
      const res = await axios.get(`${API_BASE}/api/teachers/list`, { params });
      const newTeachers = res.data.data?.teachers || res.data.teachers || {};
      setTeachers(prev => reset ? newTeachers : [...prev, ...newTeachers]);
      setHasMore(res.data.data?.page < res.data.data?.totalPages);
      setPage(res.data.data?.page);
    } catch (err) {
      if (reset) setTeachers([]);
      setHasMore(false);
    }
    setLoading(false);
  }, [filters]);

  // Initial and filter change load
useEffect(() => {
    setPage(1);
    fetchTeachers(true, 1, filters);
}, [filters, fetchTeachers]);


  // Infinite scroll observer
  const lastTeacherRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !searching) {
        fetchTeachers(false, page + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, fetchTeachers, searching]);

  // Search
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    const localResults = teachers.filter(t =>
      (t.name && t.name.toLowerCase().includes(searchInput.toLowerCase())) ||
      (t.staffId && t.staffId.toLowerCase().includes(searchInput.toLowerCase())) ||
      (t.email && t.email.toLowerCase().includes(searchInput.toLowerCase()))
    );
    if (localResults.length > 0) {
      setTeachers(localResults);
      setHasMore(false);
      setSearching(false);
      setSearchTerm(searchInput);
      return;
    }
    setLoading(true);
    try {
      const params = { ...filters, search: searchInput, page: 1, limit: 20 };
      const res = await axios.get(`${API_BASE}/api/teachers/list`, { params });
      setTeachers(res.data.data.teachers);
      setHasMore(res.data.data.page < res.data.data.totalPages);
      setPage(res.data.data.page);
      setSearchTerm(searchInput);
    } catch (err) {
      setTeachers([]);
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
    fetchTeachers(true, 1, filters);
  };

  // Add one teacher
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${API_BASE}/api/teachers`, {
      name: formData.name,
      email: formData.email,
      password: '123',            // ADD
      staffId: formData.staffId,              // ADD
      contactNo: formData.contactNo,        // MAP TO correct field
      role: 'teacher',                        // SET DEFAULT
      designation: formData.designation,
      isVerified: true,                       // DEFAULT OR FROM FORM
      mentoringGroups: formData.mentoringGroups,                  // INITIALLY EMPTY
      pinnedSheets: [],                       // INITIALLY EMPTY
    //   uploadedBy: currentUser,                // Assuming it's a user ID
    });

    console.log('Teacher created:', response.data);
    setFormData({
      name: '',
      email: '',
      password: '',
      staffId: '',
      contactNo: '',
      designation: '',
    });
    fetchTeachers();
    console.log("this is form data ",FormData);

  } catch (error) {
    console.error('Error creating teacher:', error.response?.data || error.message);
  }
};

  // Bulk add teachers from JSON
  const handleBulkJson = async () => {
  try {
    const parsed = JSON.parse(jsonInput);

    // Ensure teachers array is present
    if (!Array.isArray(parsed.teachers)) {
      alert("❌ JSON must include a 'teachers' array.");
      return;
    }

    const teachersArr = parsed.teachers.map(t => ({
      ...t,
      mentoringGroups: t.mentoringGroups
        ? Array.isArray(t.mentoringGroups)
          ? t.mentoringGroups
          : t.mentoringGroups.split(',').map(x => x.trim()).filter(Boolean)
        : []
    }));

    const response = await axios.post(`${API_BASE}/api/teachers/upload`, {
      teachers: teachersArr
    });

    setJsonInput("");
    fetchTeachers();
    alert('✅ Bulk teachers added!');
  } catch (err) {
    console.error("❌ Bulk add failed:", err.response?.data || err.message);

    alert(
      `Bulk add failed.\n\n` +
      (err.response?.data?.errors
        ? err.response.data.errors
            .map((e, i) => `(${i}) ${e.message || JSON.stringify(e)}`)
            .join("\n")
        : err.response?.data?.message || err.message)
    );
  }
};


  // Delete teacher
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try {
      await axios.delete(`${API_BASE}/api/teachers/${id}`);
      fetchTeachers();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const sampleJsonFormat = `[
  {
    "name": "Dr. John Smith",
    "email": "john.smith@email.com",
    "staffId": "T001",
    "contactNo": "9876543210",
    "designation": "Professor",
    "role": "teacher",
    "isVerified": true,
    "mentoringGroups": ["Group1","Group2"]
  },
  {
    "name": "Jane Doe",
    "email": "jane.doe@email.com",
    "staffId": "T002",
    "contactNo": "9999999999",
    "designation": "Asst. Professor",
    "role": "teacher",
    "isVerified": false,
    "mentoringGroups": []
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
              Manage Teachers
            </h1>
          </div>
          <p className="text-[var(--neutral)]/70">
            Add new teachers or manage existing teacher records in your system.
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
            Add Teachers
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
            Manage Teachers
          </button>
        </div>

        {/* Add Teachers Tab */}
        {activeTab === "add" && (
          <div className="bg-[var(--secondary)] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-[var(--neutral)]">
              Add New Teachers
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
                  Teacher Information
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter teacher name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Email *
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
                      Staff ID *
                    </label>
                    <input
                      type="text"
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter staff ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Contact No.
                    </label>
                    <input
                      type="text"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter contact no."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Designation
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter designation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter role"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Verified
                    </label>
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-[var(--neutral)]">Is Verified</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Mentoring Groups
                    </label>
                    <input
                      type="text"
                      name="mentoringGroups"
                      value={formData.mentoringGroups}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Comma-separated (Group1, Group2, ...)"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add Teacher
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
                      placeholder="Paste teachers JSON data here..."
                      value={jsonInput}
                      onChange={e => setJsonInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleBulkJson}
                      className="mt-4 px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2"
                    >
                      <Database className="h-4 w-4" />
                      Add Teachers from JSON
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
                      Upload & Add Teachers
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manage Teachers Tab */}
        {activeTab === "manage" && ( 
          <div className="bg-[var(--secondary)] rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[var(--neutral)]">
                Teacher Records
                
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
                  placeholder="Search teachers..."
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                  </button>
                )}
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral)]/70 hover:text-[var(--accent)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
                  <h3 className="text-lg font-semibold mb-4 text-[var(--neutral)]">Filter Teachers</h3>
                  <form onSubmit={e => { e.preventDefault(); fetchTeachers(true, 1, filters); setShowFilter(false); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--neutral)]">Designation</label>
                      <select className="w-full px-3 py-2 rounded border bg-[var(--primary)] text-[var(--neutral)]" value={filters.designation} onChange={e => setFilters(f => ({ ...f, designation: e.target.value }))} >
                        <option value="">Any</option>
                        {filterOptions.designation.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--neutral)]">Role</label>
                      <select className="w-full px-3 py-2 rounded border bg-[var(--primary)] text-[var(--neutral)]" value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))} >
                        <option value="">Any</option>
                        {filterOptions.role.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--neutral)]">Verified?</label>
                      <select className="w-full px-3 py-2 rounded border bg-[var(--primary)] text-[var(--neutral)]"
                        value={filters.isVerified}
                        onChange={e => setFilters(f => ({ ...f, isVerified: e.target.value }))}>
                        <option value="">Any</option>
                        <option value="true">Verified</option>
                        <option value="false">Not Verified</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button type="button" onClick={() => { setFilters({ role: '', isVerified: '', designation: '' }); fetchTeachers(true, 1, filters); setShowFilter(false); }} className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors">Clear</button>
                      <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors">Apply</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View Teacher Modal */}
            {showViewModal && selectedTeacher && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all">
                <div className="bg-white dark:bg-[var(--secondary)] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 relative animate-fadeIn">
                  <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-[var(--accent)]">
                    <h3 className="text-lg font-bold text-[var(--primary)]">Teacher Details</h3>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="text-[var(--primary)] text-2xl font-bold hover:text-red-500 transition"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      {Object.entries(selectedTeacher).filter(([key]) =>
                        !['_id', '__v', 'createdAt', 'updatedAt', 'password'].includes(key)
                      ).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wide mb-1">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="text-base text-[var(--neutral)] break-all">
                            {Array.isArray(value)
                              ? (value.length > 0 ? value.join(', ') : <span className="text-gray-400">—</span>)
                              : typeof value === 'boolean'
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

            {/* Edit Teacher Modal */}
            {showEditModal && editFormData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all">
                <div className="bg-white dark:bg-[var(--secondary)] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 relative animate-fadeIn">
                  <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-[var(--accent)]">
                    <h3 className="text-lg font-bold text-[var(--primary)]">Edit Teacher</h3>
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
                        const payload = { ...editFormData };
                        // String to array for mentoringGroups if necessary
                        if (typeof payload.mentoringGroups === 'string') {
                          payload.mentoringGroups = payload.mentoringGroups
                            ? payload.mentoringGroups.split(',').map(x => x.trim()).filter(Boolean)
                            : [];
                        }
                        await axios.put(`${API_BASE}/api/teachers/${editFormData._id}`, payload);
                        setShowEditModal(false);
                        setEditFormData(null);
                        fetchTeachers(true, 1, filters);
                        alert('Teacher updated successfully!');
                      } catch (err) {
                        alert('Failed to update teacher.');
                      }
                    }}
                    className="p-6 max-h-[70vh] overflow-y-auto space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      {Object.entries(editFormData).filter(([key]) =>
                        !['_id', '__v', 'createdAt', 'updatedAt', 'password'].includes(key)
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
                              value={Array.isArray(value) ? value.join(', ') : value || ''}
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

            {/* Delete Teacher Modal with OTP */}
            {showDeleteModal && deleteTeacher && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all">
                <div className="bg-white dark:bg-[var(--secondary)] rounded-2xl shadow-2xl w-full max-w-md mx-4 relative animate-fadeIn">
                  <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-red-500">
                    <h3 className="text-lg font-bold text-white">Delete Teacher</h3>
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="text-white text-2xl font-bold hover:text-yellow-200 transition"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="p-6">
                    <p className="mb-2 text-[var(--neutral)]">
                      Are you sure you want to <span className="font-bold text-red-500">delete</span> this teacher?
                    </p>
                    <div className="mb-4 text-sm text-[var(--neutral)]/80">
                      <div><span className="font-semibold">Name:</span> {deleteTeacher.name}</div>
                      <div><span className="font-semibold">Staff ID:</span> {deleteTeacher.staffId}</div>
                      <div><span className="font-semibold">Email:</span> {deleteTeacher.email}</div>
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
                            await axios.delete(`${API_BASE}/api/teachers/${deleteTeacher._id}`);
                            setShowDeleteModal(false);
                            setDeleteTeacher(null);
                            fetchTeachers(true, 1, filters);
                            alert('Teacher deleted successfully!');
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

            {/* Teachers Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--accent)]/20">
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Staff ID</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Designation</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Contact No.</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Verified</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Mentoring Groups</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="text-center py-6">Loading...</td></tr>
                  ) : teachers.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-6">No teachers found.</td></tr>
                  ) : teachers.map((teacher, index) => (
                    <tr key={teacher._id} className="border-b border-[var(--accent)]/10 hover:bg-[var(--primary)] transition-colors"
                      ref={teachers.length === index + 1 ? lastTeacherRef : null}>
                      <td className="py-3 px-4 text-[var(--neutral)]">{teacher.name}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]/70">{teacher.email}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{teacher.staffId}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{teacher.designation}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{teacher.role}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{teacher.contactNo}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          teacher.isVerified
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {teacher.isVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--neutral)]">
                        {Array.isArray(teacher.mentoringGroups)
                          ? teacher.mentoringGroups.join(', ')
                          : String(teacher.mentoringGroups)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            className="p-1 text-[var(--neutral)]/70 hover:text-[var(--accent)] transition-colors"
                            onClick={() => { setSelectedTeacher(teacher); setShowViewModal(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-[var(--neutral)]/70 hover:text-[var(--accent)] transition-colors"
                            onClick={() => { setEditFormData(teacher); setShowEditModal(true); }}
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
                              setDeleteTeacher(teacher);
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

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-[var(--neutral)]/70">
                Showing {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
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

export default ManageTeachers;
