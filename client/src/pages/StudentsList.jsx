import { useState, useEffect, useRef, useCallback } from "react";
import axios from '../api/axios';
import { Filter, Search, Users, UserCheck, UserX, TrendingUp, XCircle, Loader2 } from 'lucide-react';

const statIcons = [
  Users,
  UserCheck,
  UserX,
  TrendingUp
];
const statColors = [
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-red-100 text-red-600',
  'bg-yellow-100 text-yellow-600'
];

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
  const statData = [
    {
      label: 'Total Students',
      value: stats.total,
      icon: Users,
      color: statColors[0]
    },
    {
      label: 'Finalized',
      value: stats.finalized,
      icon: UserCheck,
      color: statColors[1]
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: UserX,
      color: statColors[2]
    },
    {
      label: '% Finalized',
      value: stats.percentFinalized + '%',
      icon: TrendingUp,
      color: statColors[3]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--neutral)] px-2 sm:px-6 py-8">
      {/* Summary Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 top-0 z-10 bg-[var(--primary)]/80 backdrop-blur-md py-2 rounded-xl">
        {statData.map((stat, idx) => (
          <div key={stat.label} className={`flex flex-col items-center justify-center rounded-xl shadow-sm p-4 ${stat.color} bg-opacity-30`}>
            <stat.icon className="w-7 h-7 mb-2" />
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-xs font-medium opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-6xl mx-auto sticky top-16 z-30 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center mb-6 bg-[var(--secondary)]/80 backdrop-blur-md rounded-xl p-3 shadow-sm border border-[var(--accent)]/10">
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)]/70 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, roll, email, branch, group, cluster, specialization, campus..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button type="button" onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--accent)]/70 hover:text-red-500">
              <XCircle className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors shadow"
          >
            Search
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowFilter(true)}
          className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 shadow"
        >
          <Filter className="h-5 w-5" />
          Filter
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2 shadow"
        >
          Clear All
        </button>
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[var(--secondary)] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-[var(--accent)]/20 relative animate-fadeIn">
            <button onClick={() => setShowFilter(false)} className="absolute top-3 right-3 text-[var(--neutral)]/60 hover:text-[var(--accent)] text-2xl">&times;</button>
            <h3 className="text-xl font-bold mb-6 text-[var(--neutral)] text-center">Filter Students</h3>
            <form onSubmit={e => { e.preventDefault(); fetchStudents(true, 1, filters); setShowFilter(false); }} className="space-y-4">
              {['branch','updatedGroup','cluster','specialization','campus','finalStatus'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 text-[var(--neutral)] capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <select
                    className="w-full px-3 py-2 rounded border bg-[var(--primary)] text-[var(--neutral)] border-[var(--accent)]/20"
                    value={filters[field]}
                    onChange={e => setFilters(f => ({ ...f, [field]: e.target.value }))}
                  >
                    <option value="">Any</option>
                    {filterOptions[field] && filterOptions[field].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                    {field === 'finalStatus' && [
                      <option key="true" value="true">Finalized</option>,
                      <option key="false" value="false">Pending</option>
                    ]}
                  </select>
                </div>
              ))}
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => { setFilters({ branch: '', updatedGroup: '', cluster: '', specialization: '', campus: '', finalStatus: '' }); fetchStudents(true, 1, filters); setShowFilter(false); }} className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors">Clear</button>
                <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors">Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="max-w-6xl mx-auto overflow-x-auto rounded-xl shadow border border-[var(--accent)]/10 bg-[var(--secondary)]/60">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead className="sticky  z-10 bg-[var(--secondary)]/95">
            <tr>
              <th className="p-4 font-semibold text-left sticky left-0 bg-[var(--secondary)]/95 z-20">#</th>
              <th className="p-4 font-semibold text-left">Roll No</th>
              <th className="p-4 font-semibold text-left">Name</th>
              <th className="p-4 font-semibold text-left">Email</th>
              <th className="p-4 font-semibold text-left">Mobile</th>
              <th className="p-4 font-semibold text-left">Group</th>
              <th className="p-4 font-semibold text-left">Campus</th>
              <th className="p-4 font-semibold text-left">Branch</th>
              <th className="p-4 font-semibold text-left">Cluster</th>
              <th className="p-4 font-semibold text-left">Specialization</th>
              <th className="p-4 font-semibold text-left">Vendor</th>
              <th className="p-4 font-semibold text-left">Status</th>
              <th className="p-4 font-semibold text-left">Remarks</th>
              <th className="p-4 font-semibold text-left">Mother</th>
              <th className="p-4 font-semibold text-left">Father</th>
              <th className="p-4 font-semibold text-left">Parents Mobile</th>
            </tr>
          </thead>
          <tbody>
            {loading && students.length === 0 ? (
              <tr><td colSpan="16" className="text-center py-10"><Loader2 className="mx-auto animate-spin text-[var(--accent)] w-8 h-8" /></td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="16" className="text-center py-10 text-[var(--neutral)]/60">No students found.</td></tr>
            ) : students.map((student, index) => (
              <tr
                key={student._id}
                ref={students.length === index + 1 ? lastStudentRef : null}
                className={
                  index % 2 === 0
                    ? 'bg-[var(--primary)]/90 hover:bg-[var(--accent)]/10 transition-colors'
                    : 'bg-[var(--primary)]/70 hover:bg-[var(--accent)]/10 transition-colors'
                }
                style={{ height: '64px' }}
              >
                <td className="p-4 text-left font-semibold sticky left-0 bg-inherit z-10">{index + 1}</td>
                <td className="p-4 text-left font-semibold">{student.universityRollNumber || '-'}</td>
                <td className="p-4 text-left font-bold text-base text-[var(--accent)] whitespace-nowrap truncate max-w-xs">{student.studentName || '-'}</td>
                <td className="p-4 text-left font-medium">{student.email || '-'}</td>
                <td className="p-4 text-left">{student.mobNumber || '-'}</td>
                <td className="p-4 text-left">{student.updatedGroup || '-'}</td>
                <td className="p-4 text-left">{student.campus || '-'}</td>
                <td className="p-4 text-left">{student.branch || '-'}</td>
                <td className="p-4 text-left">{student.cluster || '-'}</td>
                <td className="p-4 text-left whitespace-nowrap truncate max-w-xs">{student.specialization || '-'}</td>
                <td className="p-4 text-left">{student.newVendor || '-'}</td>
                <td className="p-4 text-left">
                  {student.finalStatus ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Finalized</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Pending</span>
                  )}
                </td>
                <td className="p-4 text-left whitespace-nowrap truncate max-w-xs">{student.remarks || '-'}</td>
                <td className="p-4 text-left whitespace-nowrap truncate max-w-xs">{student.motherName || '-'}</td>
                <td className="p-4 text-left whitespace-nowrap truncate max-w-xs">{student.fatherName || '-'}</td>
                <td className="p-4 text-left">{student.parentsMobile || '-'}</td>
              </tr>
            ))}
            {loading && students.length > 0 && (
              <tr><td colSpan="16" className="text-center py-6"><Loader2 className="mx-auto animate-spin text-[var(--accent)] w-6 h-6" /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
