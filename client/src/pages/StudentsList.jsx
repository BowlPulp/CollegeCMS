import { useState, useEffect, useRef, useCallback } from "react";
import axios from '../api/axios';
import { Filter, Search } from 'lucide-react';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    finalized: 0,
    pending: 0,
    percentFinalized: '0.0'
  });
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
  const observer = useRef();

  // Fetch filter options and stats on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [filtersRes, statsRes] = await Promise.all([
          axios.get('/api/students/filters'),
          axios.get('/api/students/stats')
        ]);
        setFilterOptions(filtersRes.data.data);
        setStats(statsRes.data.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
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
      (s.email && s.email.toLowerCase().includes(searchInput.toLowerCase())) ||
      (s.branch && s.branch.toLowerCase().includes(searchInput.toLowerCase())) ||
      (s.updatedGroup && s.updatedGroup.toLowerCase().includes(searchInput.toLowerCase())) ||
      (s.cluster && s.cluster.toLowerCase().includes(searchInput.toLowerCase())) ||
      (s.specialization && s.specialization.toLowerCase().includes(searchInput.toLowerCase())) ||
      (s.campus && s.campus.toLowerCase().includes(searchInput.toLowerCase()))
    );
    if (localResults.length > 0) {
      setStudents(localResults);
      setHasMore(false);
      setSearching(false);
      setSearch(searchInput);
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
      setSearch(searchInput);
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
    setSearch("");
    setPage(1);
    fetchStudents(true, 1, filters);
  };

  // Clear all (filters and search)
  const handleClearAll = () => {
    setSearchInput("");
    setSearch("");
    setFilters({
      branch: '',
      updatedGroup: '',
      cluster: '',
      specialization: '',
      campus: '',
      finalStatus: ''
    });
    setPage(1);
    fetchStudents(true, 1, {
      branch: '',
      updatedGroup: '',
      cluster: '',
      specialization: '',
      campus: '',
      finalStatus: ''
    });
  };

  // Calculate statistics from database stats
  const { total, finalized, pending, percentFinalized } = stats;

  return (
    <div
      className="p-6 space-y-6 max-w-6xl mx-auto"
      style={{ backgroundColor: "var(--primary)", color: "var(--neutral)" }}
    >
      {/* Summary Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--secondary)" }}>
          <p className="text-sm text-gray-300">Total Students</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--secondary)" }}>
          <p className="text-sm text-gray-300">Finalized</p>
          <p className="text-2xl font-bold text-green-400">{finalized}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--secondary)" }}>
          <p className="text-sm text-gray-300">Pending</p>
          <p className="text-2xl font-bold text-red-400">{pending}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--secondary)" }}>
          <p className="text-sm text-gray-300">% Finalized</p>
          <p className="text-2xl font-bold text-yellow-400">{percentFinalized}%</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral)]/50" />
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search by name, roll number, email, branch, group, cluster, specialization, or campus..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-[var(--neutral)] text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border-[var(--accent)]/30"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
            >
              Search
            </button>
          </form>
          {/* {search && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral)]/70 hover:text-[var(--accent)]"
            >
              Clear
            </button>
          )} */}
        </div>
        <button 
          type="button" 
          onClick={() => setShowFilter(true)} 
          className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
        <button 
          type="button" 
          onClick={handleClearAll} 
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          Clear All
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

      {/* Student Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs md:text-sm">
          <thead>
            <tr>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>#</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Name</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Roll No</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Email</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Mobile</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Group</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Campus</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Branch</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Cluster</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Specialization</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Vendor</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Status</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Remarks</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Mother</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Father</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Parents Mobile</th>
            </tr>
          </thead>
          <tbody>
            {loading && students.length === 0 ? (
              <tr><td colSpan="16" className="text-center py-6">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="16" className="text-center py-6">No students found.</td></tr>
            ) : students.map((student, index) => (
              <tr key={student._id} ref={students.length === index + 1 ? lastStudentRef : null}>
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border">{student.studentName || '-'}</td>
                <td className="p-2 border text-center">{student.universityRollNumber || '-'}</td>
                <td className="p-2 border">{student.email || '-'}</td>
                <td className="p-2 border text-center">{student.mobNumber || '-'}</td>
                <td className="p-2 border text-center">{student.updatedGroup || '-'}</td>
                <td className="p-2 border text-center">{student.campus || '-'}</td>
                <td className="p-2 border text-center">{student.branch || '-'}</td>
                <td className="p-2 border text-center">{student.cluster || '-'}</td>
                <td className="p-2 border text-center">{student.specialization || '-'}</td>
                <td className="p-2 border text-center">{student.newVendor || '-'}</td>
                <td className="p-2 border text-center">
                  {student.finalStatus ? (
                    <span className="text-green-400 font-semibold">Finalized</span>
                  ) : (
                    <span className="text-red-400 font-semibold">Pending</span>
                  )}
                </td>
                <td className="p-2 border text-center">{student.remarks || '-'}</td>
                <td className="p-2 border text-center">{student.motherName || '-'}</td>
                <td className="p-2 border text-center">{student.fatherName || '-'}</td>
                <td className="p-2 border text-center">{student.parentsMobile || '-'}</td>
              </tr>
            ))}
            {loading && students.length > 0 && (
              <tr><td colSpan="16" className="text-center py-4">Loading more...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
