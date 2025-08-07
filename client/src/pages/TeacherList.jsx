import { useState, useEffect, useRef, useCallback } from "react";
import axios from '../api/axios';
import { Filter, Search, Users, UserCheck, UserX, Loader2, Eye } from 'lucide-react';

const statIcons = [Users, UserCheck, UserX];
const statColors = [
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-red-100 text-red-600',
];

export default function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
  });
  const [filters, setFilters] = useState({
    role: 'teacher',
    designation: '',
    isVerified: 'true'
  });
  const [filterOptions, setFilterOptions] = useState({
    role: [],
    designation: [],
    isVerified: ["", "true", "false"]
  });
  const observer = useRef();
  const tableContainerRef = useRef();
  const [previewTeacher, setPreviewTeacher] = useState(null);

  // Fetch filter options and stats on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const filtersRes = await axios.get('/api/teachers/filters');
        setFilterOptions(filtersRes.data.data);
      } catch (error) {
        // fallback
        setFilterOptions({ role: [], designation: [], isVerified: ["", "true", "false"] });
      }
    };
    fetchInitialData();
  }, []);

  // Fetch teachers (paginated, filtered)
  const fetchTeachers = useCallback(async (reset = false, customPage = 1, customFilters = filters) => {
    setLoading(true);
    try {
      // Always enforce role: 'teacher' and isVerified: 'true' unless explicitly changed
      const params = { ...customFilters, role: 'teacher', isVerified: 'true', page: customPage, limit: 20 };
      console.log('[TeacherList] Fetching teachers with params:', params);
      const res = await axios.get('/api/teachers/list', { params });
      console.log('[TeacherList] API response:', res.data);
      const newTeachers = res.data.data?.teachers || res.data.teachers || [];
      setTeachers(prev => {
        const updated = reset ? newTeachers : [...prev, ...newTeachers];
        setStats({
          total: updated.length
        });
        return updated;
      });
      setHasMore(res.data.data?.page < (res.data.data?.totalPages || 1));
      setPage(res.data.data?.page);
    } catch (err) {
      console.error('[TeacherList] Error fetching teachers:', err, err?.response?.data);
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

  // Search logic (local first, then API if not found)
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    // Local search
    const localResults = teachers.filter(t =>
      (t.name && t.name.toLowerCase().includes(searchInput.toLowerCase())) ||
      (t.staffId && t.staffId.toLowerCase().includes(searchInput.toLowerCase())) ||
      (t.email && t.email.toLowerCase().includes(searchInput.toLowerCase()))
    );
    if (localResults.length > 0) {
      setTeachers(localResults);
      setHasMore(false);
      setSearching(false);
      setSearch(searchInput);
      return;
    }
    // API search
    setLoading(true);
    try {
      const params = { ...filters, search: searchInput, page: 1, limit: 20 };
      const res = await axios.get('/api/teachers/list', { params });
      setTeachers(res.data.data.teachers);
      setHasMore(res.data.data.page < res.data.data.totalPages);
      setPage(res.data.data.page);
      setSearch(searchInput);
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
    setSearch("");
    setPage(1);
    fetchTeachers(true, 1, filters);
  };

  // Clear all (filters and search)
  const handleClearAll = () => {
    setSearchInput("");
    setSearch("");
    setFilters({ role: '', designation: '', isVerified: '' });
    setPage(1);
    fetchTeachers(true, 1, { role: '', designation: '', isVerified: '' });
  };

  // Calculate statistics from database stats
  const statData = [
    {
      label: 'Total Verified Teachers',
      value: stats.total,
      icon: Users,
      color: statColors[0]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--neutral)] px-2 sm:px-6 py-8">
      {/* Summary Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 top-0 z-10 bg-[var(--primary)]/80 backdrop-blur-md py-2 rounded-xl">
          {statData.map((stat, idx) => (
            <div key={stat.label} className={`flex flex-col items-center justify-center rounded-xl shadow-sm p-4 ${stat.color} bg-opacity-30`}>
              <stat.icon className="w-7 h-7 mb-2" />
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs font-medium opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-6xl mx-auto sticky top-16 z-30 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center mb-6 bg-[var(--secondary)]/80 backdrop-blur-md rounded-xl p-3 shadow-sm border border-[var(--accent)]/10">
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)]/70 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, staff ID, email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button type="button" onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--accent)]/70 hover:text-red-500">
            </button>
          )}
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors shadow">
            Search
          </button>
        </form>
        <button
          type="button"
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2 shadow"
        >
          Clear All
        </button>
      </div>

    
     

      {/* Teacher Table */}
      <div ref={tableContainerRef} className="max-w-6xl mx-auto overflow-x-auto rounded-xl shadow border border-[var(--accent)]/10 bg-[var(--secondary)]/60 cursor-grab select-none">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead className="sticky  z-10 bg-[var(--secondary)]/95">
            <tr>
              <th className="p-4 font-semibold text-left sticky left-0 bg-[var(--secondary)]/95 z-20">#</th>
              <th className="p-4 font-semibold text-center">Preview</th>
              <th className="p-4 font-semibold text-left">Staff ID</th>
              <th className="p-4 font-semibold text-left">Name</th>
              <th className="p-4 font-semibold text-left">Email</th>
              <th className="p-4 font-semibold text-left">Contact No.</th>
              <th className="p-4 font-semibold text-left">Designation</th>
              <th className="p-4 font-semibold text-left">Role</th>
              <th className="p-4 font-semibold text-left">Verified</th>
              <th className="p-4 font-semibold text-left">Mentoring Groups</th>
            </tr>
          </thead>
          <tbody>
            {loading && teachers.length === 0 ? (
              <tr><td colSpan="10" className="text-center py-10"><Loader2 className="mx-auto animate-spin text-[var(--accent)] w-8 h-8" /></td></tr>
            ) : teachers.length === 0 ? (
              <tr><td colSpan="10" className="text-center py-10 text-[var(--neutral)]/60">No teachers found.</td></tr>
            ) : teachers.map((teacher, index) => (
              <tr
                key={teacher._id}
                ref={teachers.length === index + 1 ? lastTeacherRef : null}
                className={
                  index % 2 === 0
                    ? 'bg-[var(--primary)]/90 hover:bg-[var(--accent)]/10 transition-colors'
                    : 'bg-[var(--primary)]/70 hover:bg-[var(--accent)]/10 transition-colors'
                }
                style={{ height: '64px' }}
              >
                <td className="p-4 text-left font-semibold sticky left-0 bg-inherit z-10">{index + 1}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setPreviewTeacher(teacher)}
                    className="inline-flex items-center justify-center rounded-full bg-[var(--accent)]/10 hover:bg-[var(--accent)]/30 transition-colors p-2"
                    title="Preview Teacher"
                  >
                    <Eye className="w-7 h-7 text-[var(--accent)]" />
                  </button>
                </td>
                <td className="p-4 text-left font-semibold">{teacher.staffId || '-'}</td>
                <td className="p-4 text-left font-bold text-base text-[var(--accent)] whitespace-nowrap truncate max-w-xs">{teacher.name || '-'}</td>
                <td className="p-4 text-left font-medium">{teacher.email || '-'}</td>
                <td className="p-4 text-left">{teacher.contactNo || '-'}</td>
                <td className="p-4 text-left">{teacher.designation || '-'}</td>
                <td className="p-4 text-left">{teacher.role || '-'}</td>
                <td className="p-4 text-left">
                  {teacher.isVerified ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Verified</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Not Verified</span>
                  )}
                </td>
                <td className="p-4 text-left whitespace-nowrap truncate max-w-xs">{Array.isArray(teacher.mentoringGroups) ? teacher.mentoringGroups.join(', ') : '-'}</td>
              </tr>
            ))}
            {loading && teachers.length > 0 && (
              <tr><td colSpan="10" className="text-center py-6"><Loader2 className="mx-auto animate-spin text-[var(--accent)] w-6 h-6" /></td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Teacher Preview Modal */}
      {previewTeacher && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewTeacher(null)}>
          <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl shadow-2xl max-w-xl w-full p-0 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-[var(--accent)]/20 bg-[var(--secondary)]">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-extrabold text-[var(--accent)] tracking-tight">{previewTeacher.name || '-'}</h2>
                <h2 className=" text-[var(--neutral)] text-base rounded-full font-semibold tracking-wide">{previewTeacher.staffId || '-'}</h2>
              </div>
              <button className="text-4xl text-[var(--neutral)]/60 hover:text-[var(--accent)] font-bold" onClick={() => setPreviewTeacher(null)}>&times;</button>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Left column: Identity & Contact */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-[var(--accent)] uppercase mb-1 tracking-wider">Contact</div>
                  <div className="mb-1"><span className="font-semibold">Email:</span> <span className="text-[var(--neutral)]/90">{previewTeacher.email || '-'}</span></div>
                  <div><span className="font-semibold">Contact No.:</span> <span className="text-[var(--neutral)]/90">{previewTeacher.contactNo || '-'}</span></div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--accent)] uppercase mb-1 tracking-wider">Mentoring Groups</div>
                  <div>{Array.isArray(previewTeacher.mentoringGroups) ? previewTeacher.mentoringGroups.join(', ') : '-'}</div>
                </div>
              </div>
              {/* Right column: Academic & Status */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-[var(--accent)] uppercase mb-1 tracking-wider">Academic</div>
                  <div className="mb-1"><span className="font-semibold">Designation:</span> {previewTeacher.designation || '-'}</div>
                  <div className="mb-1"><span className="font-semibold">Role:</span> {previewTeacher.role || '-'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--accent)] uppercase mb-1 tracking-wider">Status</div>
                  <div className="mb-2">
                    {previewTeacher.isVerified ? (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">Verified</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">Not Verified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}