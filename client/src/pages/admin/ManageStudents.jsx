import React, { useState } from "react";
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

const ManageStudents = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("add");
  const [addOption, setAddOption] = useState("one");
  const [bulkOption, setBulkOption] = useState("json");
  const [jsonInput, setJsonInput] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sample student data for the manage tab
  const [students] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", rollNo: "CSE001", class: "CSE-A", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", rollNo: "CSE002", class: "CSE-A", status: "Active" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", rollNo: "CSE003", class: "CSE-B", status: "Inactive" }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    class: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  const sampleJsonFormat = `[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "rollNo": "CSE001",
    "class": "CSE-A"
  },
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "rollNo": "CSE002",
    "class": "CSE-A"
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
                      name="name"
                      value={formData.name}
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
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter roll number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--neutral)]">
                      Class *
                    </label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border bg-[var(--secondary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                      placeholder="Enter class"
                      required
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
                    <button className="mt-4 px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2">
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
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
                />
              </div>
              <button className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--accent)]/20">
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Roll No</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Class</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[var(--neutral)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-[var(--accent)]/10 hover:bg-[var(--primary)] transition-colors">
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.name}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]/70">{student.email}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.rollNo}</td>
                      <td className="py-3 px-4 text-[var(--neutral)]">{student.class}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="p-1 text-[var(--neutral)]/70 hover:text-[var(--accent)] transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-[var(--neutral)]/70 hover:text-[var(--accent)] transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-[var(--neutral)]/70 hover:text-red-500 transition-colors">
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
                Showing 3 of 3 students
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
