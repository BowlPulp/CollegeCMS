import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import dayjs from 'dayjs';
import useAuthStore from '../store/authStore';

const tabs = [
  { key: 'all', label: 'All Duties' },
  { key: 'my', label: 'My Duties' },
  { key: 'assign', label: 'Assign Duty' },
];

const timeOptions = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00'
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekDaysFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const startHour = 9;
const endHour = 16;
const slotMinutes = [0, 15, 30, 45];

const dutyColors = [
  'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
  'bg-yellow-600', 'bg-indigo-600', 'bg-pink-600', 'bg-teal-600',
  'bg-orange-600', 'bg-cyan-600', 'bg-rose-600', 'bg-emerald-600'
];

// Utility to get Monday-Sunday range of a week (Monday is startOf('week') + 1 day)
function getWeekRange(date = new Date()) {
  const d = dayjs(date);
  const monday = d.startOf('week').add(1, 'day'); // Monday
  const sunday = monday.add(6, 'day');
  return [monday.startOf('day'), sunday.endOf('day')];
}

export default function DutyPage() {
  // Common states
  const [activeTab, setActiveTab] = useState('my');
  const [dutyTypes, setDutyTypes] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const user = useAuthStore(s => s.user);

  // Duties state
  const [allDuties, setAllDuties] = useState([]);
  const [myDuties, setMyDuties] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMy, setLoadingMy] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Assign Duty form and UI states
  const [form, setForm] = useState({
    title: '',
    description: '',
    dutyType: '',
    customType: '',
    dates: [],
    startTime: '',
    endTime: '',
    assignedTo: [],
    location: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Delete confirmation modal state
  const [confirmDelete, setConfirmDelete] = useState({ open: false, duty: null, isMine: false });

  // New state to toggle All Duties view mode
  const [allDutiesView, setAllDutiesView] = useState('table'); // 'table' or 'list'

  // Compute next 7 days for date selector in Assign Duty
  const today = dayjs();
  const weekDates = Array.from({ length: 7 }).map((_, idx) => {
    const dayObj = today.add(idx, 'day');
    return {
      day: dayObj.format('dddd'),
      label: dayObj.format('MMM D'),
      iso: dayObj.format('YYYY-MM-DD'),
    };
  });

  // Fetch duty types from API
  useEffect(() => {
    fetchDutyTypes();
    fetchStaffList();
  }, []);

  // Fetch duty types
  async function fetchDutyTypes() {
    try {
      const res = await axios.get('/api/duties/types');
      setDutyTypes(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch duty types', err);
    }
  }

  // Fetch staff emails
  async function fetchStaffList() {
    try {
      const res = await axios.get('/api/events/staff-emails');
      setStaffList(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch staff list', err);
    }
  }

  // Fetch all duties for current week
  async function fetchAllDuties() {
    setLoadingAll(true);
    const [weekStart, weekEnd] = getWeekRange();
    try {
      const res = await axios.get('/api/duties', {
        params: { weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString() },
      });
      setAllDuties(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch all duties', err);
    }
    setLoadingAll(false);
  }

  // Fetch my duties for current week
  async function fetchMyDuties() {
    setLoadingMy(true);
    const [weekStart, weekEnd] = getWeekRange();
    if (!user?.email) {
      console.error("User not found or email missing");
      setLoadingMy(false);
      return;
    }
    try {
      const res = await axios.get('/api/duties', {
        params: {
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          teacher: user.email,
        }
      });
      setMyDuties(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch my duties', err);
    }
    setLoadingMy(false);
  }

  // On active tab change, fetch duties accordingly
  useEffect(() => {
    if (activeTab === 'all') fetchAllDuties();
    else if (activeTab === 'my') fetchMyDuties();
  }, [activeTab]);

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // If start time is changed, reset end time if it's now invalid
      if (name === 'startTime' && value && prev.endTime) {
        if (value >= prev.endTime) {
          newForm.endTime = '';
        }
      }
      
      return newForm;
    });
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    if (successMsg) setSuccessMsg('');
  };

  // Toggle date selection in multi-date selector
  const toggleDateSelection = (date) => {
    setForm(prev => {
      let dates = [...prev.dates];
      if (dates.includes(date)) {
        dates = dates.filter(d => d !== date);
      } else {
        dates.push(date);
      }
      return { ...prev, dates };
    });
    if (formErrors.dates) setFormErrors(prev => ({ ...prev, dates: '' }));
    if (successMsg) setSuccessMsg('');
  };

  // Tag input for assigning staff
  const handleTagInputChange = (e) => {
    const val = e.target.value;
    setTagInput(val);
    if (val.startsWith('@')) {
      const searchTerm = val.slice(1).toLowerCase();
      setFilteredStaff(staffList.filter(s => s.email.toLowerCase().includes(searchTerm)));
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };

  const handleTagSelect = (staff) => {
    if (!form.assignedTo.includes(staff.email)) {
      setForm(prev => ({ ...prev, assignedTo: [...prev.assignedTo, staff.email] }));
    }
    setTagInput('');
    setShowTagSuggestions(false);
    if (formErrors.assignedTo) setFormErrors(prev => ({ ...prev, assignedTo: '' }));
    if (successMsg) setSuccessMsg('');
  };

  const removeTag = (email) => {
    setForm(prev => ({ ...prev, assignedTo: prev.assignedTo.filter(e => e !== email) }));
  };

  // Get filtered end time options based on start time
  const getEndTimeOptions = (startTime) => {
    if (!startTime) return timeOptions;
    return timeOptions.filter(time => time > startTime);
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required.';
    if (!form.dutyType) errors.dutyType = 'Duty type is required.';
    if (form.dutyType === 'Custom' && !form.customType.trim()) errors.customType = 'Custom type is required.';
    if (!form.dates.length) errors.dates = 'Please select at least one date.';
    if (!form.startTime) errors.startTime = 'Start time is required.';
    if (!form.endTime) errors.endTime = 'End time is required.';
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errors.endTime = 'End time must be after start time.';
    }
    if (!form.assignedTo.length) errors.assignedTo = 'Please assign at least one teacher.';
    return errors;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('/api/duties', { ...form, createdBy: user?.email || 'admin@demo.com' });
      setSuccessMsg('Duty assigned successfully!');
      // Reset form
      setForm({
        title: '',
        description: '',
        dutyType: '',
        customType: '',
        dates: [],
        startTime: '',
        endTime: '',
        assignedTo: [],
        location: '',
      });
      // Refresh list based on active tab
      if (activeTab === 'all') await fetchAllDuties();
      if (activeTab === 'my') await fetchMyDuties();
    } catch (err) {
      setSuccessMsg('Failed to assign duty.');
      console.error(err);
    }
    setIsSubmitting(false);
  };

  // Get duty color mapping
  const getDutyColor = (dutyId, colorMap) => {
    if (!colorMap.has(dutyId)) {
      const colorIndex = colorMap.size % dutyColors.length;
      colorMap.set(dutyId, dutyColors[colorIndex]);
    }
    return colorMap.get(dutyId);
  };

  // Calculate position of duty within one hour block (for My Duties Timetable)
  const calculateDutyPosition = (duty, date, hour) => {
    const startTime = dayjs(`${date}T${duty.startTime}`);
    const endTime = dayjs(`${date}T${duty.endTime}`);
    const hourStart = dayjs(`${date}T${hour.toString().padStart(2, '0')}:00`);
    const hourEnd = hourStart.add(1, 'hour');

    if (startTime >= hourEnd || endTime <= hourStart) return null;

    let startPercent = 0;
    if (startTime > hourStart) {
      const minutesFromHourStart = startTime.diff(hourStart, 'minute');
      startPercent = (minutesFromHourStart / 60) * 100;
    }

    let endPercent = 100;
    if (endTime < hourEnd) {
      const minutesToHourEnd = hourEnd.diff(endTime, 'minute');
      endPercent = 100 - (minutesToHourEnd / 60) * 100;
    }

    return {
      left: startPercent,
      width: endPercent - startPercent
    };
  };

  const deleteDuty = (dutyId, isMine, dutyObj) => {
    setConfirmDelete({ open: true, duty: { ...dutyObj, _id: dutyId }, isMine });
  };

  const handleConfirmDelete = async () => {
    const { duty } = confirmDelete;
    setDeleteLoadingId(duty._id);
    setConfirmDelete({ open: false, duty: null, isMine: false });
    try {
      await axios.delete(`/api/duties/${duty._id}`);
      setSuccessMsg('Duty deleted!');
      if (activeTab === 'all') await fetchAllDuties();
      if (activeTab === 'my') await fetchMyDuties();
    } catch (err) {
      setSuccessMsg('Failed to delete duty.');
      console.error(err);
    }
    setDeleteLoadingId(null);
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ open: false, duty: null, isMine: false });
  };

  // Modal to show duty details
  function DutyDetailsModal({ duty, onClose }) {
    if (!duty) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
          <button
            className="absolute top-2 right-4 text-xl text-gray-700 font-bold"
            onClick={onClose}
            aria-label="Close details"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-2">{duty.title}</h2>
          <div className="mb-1">
            <b>Type:</b> {duty.dutyType}
            {duty.dutyType === "Custom" && duty.customType ? ` (${duty.customType})` : ""}
          </div>
          <div className="mb-1"><b>Description:</b> {duty.description || "No description"}</div>
          <div className="mb-1"><b>Date(s):</b> {duty.dates && duty.dates.join(", ")}</div>
          <div className="mb-1"><b>Time:</b> {duty.startTime} - {duty.endTime}</div>
          <div className="mb-1"><b>Location:</b> {duty.location || "—"}</div>
          <div className="mb-1"><b>Assigned To:</b> {(duty.assignedTo && duty.assignedTo.length) ? duty.assignedTo.join(", ") : "—"}</div>
        </div>
      </div>
    );
  }

  // My Duties timetable component with styled blocks and delete buttons
  function MyDutiesTimetable({ duties, deleteDuty, deleteLoadingId }) {
    const [selectedDuty, setSelectedDuty] = useState(null);
    const colorMap = new Map();
    const [weekStart] = getWeekRange();
    const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

    // Prepare duties by day and hour with position info
    const dutyData = {};
    const maxDutiesPerDay = {};

    weekDays.forEach((day) => {
      const date = weekStart.add(weekDays.indexOf(day), 'day').format('YYYY-MM-DD');
      dutyData[day] = {};
      const dayDuties = Array.from(
        new Set(duties.filter(d => d.dates.some(dt => dayjs(dt).format("YYYY-MM-DD") === date)).map(d => d._id))
      );
      const dayDutyLevels = {};
      dayDuties.forEach((dutyId, idx) => { dayDutyLevels[dutyId] = idx; });
      let maxDuties = dayDuties.length;

      hours.forEach(hour => {
        const hourKey = `${hour}-${hour + 1}`;
        dutyData[day][hourKey] = [];
        duties.forEach(duty => {
          if (duty.dates.some(dt => dayjs(dt).format("YYYY-MM-DD") === date)) {
            const position = calculateDutyPosition(duty, date, hour);
            if (position) {
              dutyData[day][hourKey].push({
                ...duty,
                position,
                color: getDutyColor(duty._id, colorMap),
                level: dayDutyLevels[duty._id],
              });
            }
          }
        });
        dutyData[day][hourKey].sort((a, b) => a.level - b.level);
      });
      maxDutiesPerDay[day] = maxDuties;
    });

    return (
      <div className="overflow-x-auto">
        <DutyDetailsModal duty={selectedDuty} onClose={() => setSelectedDuty(null)} />
        <div className="border-2 border-gray-400 rounded-lg overflow-hidden bg-white">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--primary)]">
                <th className="p-3 sticky left-0 z-10 font-bold border-r-2 border-gray-400 text-[var(--neutral)]">Day</th>
                {hours.map((hour, index) => (
                  <th
                    key={hour}
                    className={`p-3 min-w-[140px] font-bold text-[var(--neutral)] ${index < hours.length - 1 ? "border-r border-gray-300" : ""}`}
                  >
                    {hour}:00 - {hour + 1}:00
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekDays.map(day => {
                const date = weekStart.add(weekDays.indexOf(day), 'day');
                const maxDuties = maxDutiesPerDay[day] || 1;
                const baseHeight = 60;
                const rowHeight = Math.max(80, maxDuties * baseHeight);
                return (
                  <tr key={day} className="border-t-2 border-gray-300">
                    <td
                      className="p-3 bg-[var(--primary)] sticky left-0 z-10 font-bold border-r-2 border-gray-400 text-[var(--neutral)]"
                      style={{ height: `${rowHeight}px` }}
                    >
                      <div>{day}</div>
                      <div className="text-xs opacity-70">{date.format("MM/DD")}</div>
                    </td>
                    {hours.map(hour => {
                      const hourKey = `${hour}-${hour + 1}`;
                      const hourDuties = dutyData[day][hourKey] || [];
                      return (
                        <td
                          key={hourKey}
                          className={`py-2 align-top relative bg-gray-50 ${hour !== endHour - 1 ? "border-r border-gray-300" : ""}`}
                          style={{ height: `${rowHeight}px` }}
                        >
                          <div className="relative w-full h-full">
                            {hourDuties.map(duty => {
                              const dutyHeight = Math.max(50, (rowHeight - 16) / maxDuties);
                              const topPosition = 8 + duty.level * (dutyHeight + 4);
                              return (
                                <div
                                  key={`${duty._id}-${hour}`}
                                  className={`${duty.color} absolute flex flex-col justify-center px-2 py-1 font-bold overflow-hidden shadow-sm cursor-pointer border-2 border-white`}
                                  style={{
                                    left: `${duty.position.left}%`,
                                    width: `${duty.position.width}%`,
                                    top: `${topPosition}px`,
                                    height: `${dutyHeight}px`,
                                    borderRadius: "4px",
                                    color: "white",
                                    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                                    zIndex: 10,
                                  }}
                                  tabIndex={0}
                                  title={`${duty.title}\n${duty.startTime} ~ ${duty.endTime}${duty.location ? ` @ ${duty.location}` : ""}`}
                                  onClick={() => setSelectedDuty(duty)}
                                >
                                  <div className="truncate leading-tight text-white text-center font-bold flex justify-between items-center">
                                    <span className="w-full">
                                      {duty.title}
                                      <div className="text-xs truncate leading-tight text-white text-center">
                                        {duty.startTime} - {duty.endTime}
                                      </div>
                                      {duty.location && (
                                        <div className="text-xs truncate leading-tight text-white text-center">
                                          {duty.location}
                                        </div>
                                      )}
                                    </span>
                                    <button
                                      type="button"
                                      className="ml-1 text-red-200 font-bold rounded hover:bg-red-100/30 px-1"
                                      style={{ minWidth: 24 }}
                                      disabled={deleteLoadingId === duty._id}
                                      tabIndex={-1}
                                      onClick={e => {
                                        e.stopPropagation();
                                        deleteDuty(duty._id, true, duty);
                                      }}
                                      title="Delete"
                                    >
                                      {deleteLoadingId === duty._id ? (
                                        <span className="inline-block animate-spin" style={{ width: 14, height: 14 }}>⏳</span>
                                      ) : (
                                        "🗑"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render all duties timetable (improved table view)
  const renderTimetable = (duties, isMine) => {
    const map = {};
    duties.forEach(duty => {
      duty.dates.forEach(dateStr => {
        const date = dayjs(dateStr).format('YYYY-MM-DD');
        if (!map[date]) map[date] = {};
        let t = dayjs(`${date}T${duty.startTime}`);
        const end = dayjs(`${date}T${duty.endTime}`);
        while (t.isBefore(end)) {
          const slot = t.format('HH:mm');
          if (!map[date][slot]) map[date][slot] = [];
          map[date][slot].push(duty);
          t = t.add(15, 'minute');
        }
      });
    });

    const [weekStart] = getWeekRange();

    return (
      <div className="overflow-x-auto rounded-lg border border-[var(--accent)] bg-white shadow-sm">
        <table className="min-w-full border-collapse border border-gray-300 text-xs font-sans">
          <thead>
            <tr className="bg-[var(--primary)] text-[var(--neutral)]">
              <th className="border border-gray-300 p-2 sticky left-0 z-10 bg-[var(--primary)]">Time</th>
              {weekDays.map((wd, i) => (
                <th key={wd} className="border border-gray-300 p-2 font-semibold">{wd}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: (endHour - startHour) * 4 + 1 }).map((_, rowIdx) => {
              const hour = startHour + Math.floor(rowIdx / 4);
              const min = slotMinutes[rowIdx % 4];
              const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
              return (
                <tr key={timeStr} className="even:bg-gray-50 hover:bg-gray-100 transition-colors">
                  <td className="border border-gray-300 p-1 text-right sticky left-0 z-10 bg-[var(--primary)] text-[var(--neutral)] font-semibold select-none" style={{ minWidth: '50px' }}>
                    {timeStr}
                  </td>
                  {weekDays.map((wd, colIdx) => {
                    const date = weekStart.add(colIdx, 'day').format('YYYY-MM-DD');
                    const slotDuties = (map[date] && map[date][timeStr]) || [];
                    return (
                      <td key={wd} className="border border-gray-300 p-1 min-w-[110px] align-top">
                        {slotDuties.map((duty, i) => (
                          <div
                            key={duty._id + i}
                            className={`rounded px-1 py-0.5 mb-1 text-xs font-semibold flex items-center justify-between gap-1 cursor-pointer select-none
                              ${isMine ? 'bg-green-200 text-green-900' : 'bg-blue-200 text-blue-900'}
                              `}
                            title={
                              `${duty.title} (${duty.startTime}-${duty.endTime})\nType: ${duty.dutyType}${duty.customType ? ` (${duty.customType})` : ''}\nLocation: ${duty.location || '—'}\nAssigned To: ${duty.assignedTo.join(', ')}`
                            }
                            tabIndex={0}
                          >
                            <span className="truncate">
                              {duty.title} <span className="font-normal">({duty.assignedTo.join(', ')})</span>
                            </span>
                            <button
                              type="button"
                              className="ml-1 text-red-600 font-bold rounded hover:bg-red-100 px-1"
                              style={{ minWidth: 24 }}
                              disabled={deleteLoadingId === duty._id}
                              onClick={() => deleteDuty(duty._id, false, duty)}
                              title="Delete"
                            >
                              {deleteLoadingId === duty._id ? (
                                <span className="inline-block animate-spin mr-1" style={{ width: 14, height: 14 }}>⏳</span>
                              ) : (
                                "🗑"
                              )}
                            </button>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // List view: duties grouped by day cards
  function renderListView(duties) {
    const dutiesByDate = {};
    duties.forEach(duty => {
      duty.dates.forEach(dateStr => {
        const date = dayjs(dateStr).format('YYYY-MM-DD');
        if (!dutiesByDate[date]) dutiesByDate[date] = [];
        dutiesByDate[date].push(duty);
      });
    });

    // Get sorted dates in current week
    const [weekStart] = getWeekRange();
    const weekDatesSorted = weekDays.map(day => weekStart.add(weekDays.indexOf(day), 'day').format('YYYY-MM-DD'));

    return (
      <div className="space-y-6">
        {weekDatesSorted.map(date => (
          <div key={date} className="bg-[var(--primary)] p-4 rounded-lg border border-[var(--accent)]/40 shadow">
            <h3 className="text-lg font-bold mb-3 text-[var(--accent)]">
              {dayjs(date).format('dddd, MMM D')}
            </h3>
            {dutiesByDate[date] && dutiesByDate[date].length > 0 ? (
              dutiesByDate[date].map(duty => (
                <div
                  key={duty._id}
                  className="mb-3 p-3 rounded border-l-8 border-[var(--accent)] bg-[var(--secondary)] shadow-sm cursor-pointer hover:shadow-md transition select-none"
                  title={`Type: ${duty.dutyType}${duty.customType ? ` (${duty.customType})` : ''}\nLocation: ${duty.location || '—'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[var(--primary)]">{duty.title}</p>
                      <p className="text-sm text-[var(--neutral)]">
                        {duty.startTime} - {duty.endTime} {duty.location ? `@ ${duty.location}` : ''}
                      </p>
                    </div>
                    <div className="text-xs text-slate-400 italic truncate max-w-[150px]">
                      {duty.assignedTo.join(', ')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--neutral)] italic gap-2 flex items-center">
                No duties assigned for this day.
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // --- Render Assign Duty form (redesigned with multi-date buttons) ---
  const renderAssignDutyForm = () => (
    <div className="max-w-xl mx-auto bg-[var(--primary)] p-8 rounded-lg shadow-lg border border-[var(--accent)]/40 text-[var(--neutral)]">
      <h2 className="text-3xl font-bold mb-6 text-[var(--accent)] text-center">Assign Duty</h2>
      {successMsg && (
        <div className="mb-6 p-3 rounded bg-green-700 text-white font-semibold text-center animate-fadeIn">
          {successMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Duty Details */}
        <section>
          <h3 className="mb-2 text-lg font-semibold border-b border-[var(--accent)]/50 pb-1">Duty Details</h3>
          <div className="mb-4">
            <label htmlFor="title" className="block mb-1 font-semibold">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleFormChange}
              className={`w-full rounded-lg border p-3 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition ${
                formErrors.title ? 'border-red-500' : 'border-[var(--accent)]/50'
              }`}
              placeholder="Duty title"
              autoComplete="off"
            />
            {formErrors.title && <p className="mt-1 text-red-400 text-sm">{formErrors.title}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-1 font-semibold">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows={3}
              placeholder="Optional description of duty"
              className="w-full rounded-lg border border-[var(--accent)]/50 p-3 bg-[var(--primary)] text-[var(--neutral)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="dutyType" className="block mb-1 font-semibold">Duty Type</label>
            <select
              id="dutyType"
              name="dutyType"
              value={form.dutyType}
              onChange={handleFormChange}
              className={`w-full rounded-lg border p-3 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition ${
                formErrors.dutyType ? 'border-red-500' : 'border-[var(--accent)]/50'
              }`}
            >
              <option value="">Select duty type</option>
              {dutyTypes && dutyTypes.length
                ? dutyTypes.map(type => <option key={type} value={type}>{type}</option>)
                : <option disabled>No duty types available</option>
              }
            </select>
            {form.dutyType === 'Custom' && (
              <input
                type="text"
                name="customType"
                value={form.customType}
                onChange={handleFormChange}
                placeholder="Enter custom duty type"
                className={`mt-2 w-full rounded-lg border p-3 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition ${
                  formErrors.customType ? 'border-red-500' : 'border-[var(--accent)]/50'
                }`}
              />
            )}
            {formErrors.dutyType && <p className="mt-1 text-red-400 text-sm">{formErrors.dutyType}</p>}
            {formErrors.customType && <p className="mt-1 text-red-400 text-sm">{formErrors.customType}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="location" className="block mb-1 font-semibold">Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={form.location}
              onChange={handleFormChange}
              placeholder="Duty Location (optional)"
              className="w-full rounded-lg border border-[var(--accent)]/50 p-3 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
              autoComplete="off"
            />
          </div>
        </section>

        {/* Select Dates */}
        <section>
          <h3 className="mb-2 text-lg font-semibold border-b border-[var(--accent)]/50 pb-1">Select Date(s) (Next 7 Days)</h3>
          <div className="flex flex-wrap gap-3">
            {weekDates.map(({ day, label, iso }) => (
              <button
                key={iso}
                type="button"
                onClick={() => toggleDateSelection(iso)}
                className={`px-4 py-3 rounded-lg border font-semibold transition select-none 
                ${form.dates.includes(iso)
                  ? 'bg-[var(--accent)] text-[var(--primary)] border-[var(--accent)]'
                  : 'bg-[var(--primary)] text-[var(--neutral)] border-[var(--accent)]/40 hover:bg-[var(--accent)]/30'}
                `}
                aria-pressed={form.dates.includes(iso)}
                aria-label={`${day}, ${label} - ${form.dates.includes(iso) ? 'Selected' : 'Not selected'}`}
              >
                <div className="text-xs opacity-70">{day}</div>
                <div className="text-sm">{label}</div>
              </button>
            ))}
          </div>
          {formErrors.dates && <p className="text-red-400 mt-2 text-sm">{formErrors.dates}</p>}
          {form.dates.length > 0 && (
            <p className="mt-2 text-[var(--accent)] text-sm font-medium">
              Selected: {form.dates.map(d => dayjs(d).format('MMM D')).join(', ')}
            </p>
          )}
        </section>

        {/* Time */}
        <section>
          <h3 className="mb-2 text-lg font-semibold border-b border-[var(--accent)]/50 pb-1">Time</h3>
          <div className="flex gap-6">
            <div className="flex-1">
              <label htmlFor="startTime" className="block mb-1 font-semibold">Start Time</label>
              <select
                id="startTime"
                name="startTime"
                value={form.startTime}
                onChange={handleFormChange}
                className={`w-full rounded-lg border p-3 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition ${
                  formErrors.startTime ? 'border-red-500' : 'border-[var(--accent)]/50'
                }`}
              >
                <option value="">Select start</option>
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {formErrors.startTime && <p className="mt-1 text-red-400 text-sm">{formErrors.startTime}</p>}
            </div>
            <div className="flex-1">
              <label htmlFor="endTime" className="block mb-1 font-semibold">End Time</label>
              <select
                id="endTime"
                name="endTime"
                value={form.endTime}
                onChange={handleFormChange}
                className={`w-full rounded-lg border p-3 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition ${
                  formErrors.endTime ? 'border-red-500' : 'border-[var(--accent)]/50'
                }`}
                disabled={!form.startTime}
              >
                <option value="">{form.startTime ? 'Select end' : 'Select start time first'}</option>
                {getEndTimeOptions(form.startTime).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {formErrors.endTime && <p className="mt-1 text-red-400 text-sm">{formErrors.endTime}</p>}
              {form.startTime && getEndTimeOptions(form.startTime).length === 0 && (
                <p className="mt-1 text-yellow-400 text-sm">No valid end times available for this start time.</p>
              )}
            </div>
          </div>
        </section>

        {/* Assign To */}
        <section>
          <h3 className="mb-2 text-lg font-semibold border-b border-[var(--accent)]/50 pb-1">Assign To (Tag by Email)</h3>
          <div className="relative">
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              placeholder="Type @ to search staff emails"
              className="w-full rounded-lg border border-[var(--accent)]/50 p-3 bg-[var(--primary)] text-[var(--neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
              aria-autocomplete="list"
              aria-expanded={showTagSuggestions}
            />
            {showTagSuggestions && filteredStaff.length > 0 && (
              <ul className="absolute top-full left-0 right-0 max-h-40 overflow-y-auto border border-[var(--accent)]/50 bg-[var(--secondary)] rounded-b-lg shadow-lg z-20">
                {filteredStaff.map(staff => (
                  <li
                    key={staff.email}
                    onClick={() => handleTagSelect(staff)}
                    className="cursor-pointer px-4 py-2 hover:bg-[var(--accent)]/30"
                    role="option"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTagSelect(staff);
                      }
                    }}
                  >
                    {staff.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.assignedTo.map(email => (
              <span
                key={email}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/40 text-[var(--primary)] px-3 py-1 text-sm select-none"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeTag(email)}
                  className="ml-2 focus:outline-none hover:text-red-500 font-bold"
                  aria-label={`Remove ${email}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          {formErrors.assignedTo && <p className="mt-1 text-red-400 text-sm">{formErrors.assignedTo}</p>}
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-bold text-[var(--primary)] transition focus:outline-none focus:ring-4 ${
            isSubmitting
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-[var(--accent)] hover:bg-[var(--accent)]/90'
          }`}
          aria-live="polite"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-[var(--primary)]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Assigning duty, sending mail...
            </span>
          ) : (
            'Assign Duty'
          )}
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Delete Confirmation Modal */}
      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full relative animate-fadeIn">
            <div className="absolute top-2 right-4">
              <button onClick={handleCancelDelete} className="text-gray-400 hover:text-gray-600 text-2xl font-bold" aria-label="Close delete confirmation">&times;</button>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Delete Duty?</h2>
              <p className="text-gray-600 mb-4 text-center">This action cannot be undone.<br/>Are you sure you want to delete <span className="font-semibold text-red-600">{confirmDelete.duty?.title || 'this duty'}</span>?</p>
              <div className="flex gap-4 mt-2">
                <button
                  className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  onClick={handleCancelDelete}
                  disabled={deleteLoadingId === confirmDelete.duty?._id}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-semibold shadow"
                  onClick={handleConfirmDelete}
                  disabled={deleteLoadingId === confirmDelete.duty?._id}
                >
                  {deleteLoadingId === confirmDelete.duty?._id ? (
                    <span className="inline-block animate-spin mr-1" style={{ width: 16, height: 16 }}>⏳</span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[var(--neutral)] p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-[var(--accent)] mb-6 tracking-tight">Duty Manager</h1>

          <div className="flex gap-4 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm ${
                  activeTab === tab.key
                    ? 'bg-[var(--accent)] text-[var(--primary)]'
                    : 'bg-[var(--primary)] text-[var(--accent)] border border-[var(--accent)]/30'
                }`}
                aria-current={activeTab === tab.key ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'all' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">All Teachers' Duties (Weekly View)</h2>
              <div className="flex items-center gap-3 mb-4">
                <button
                  className={`px-4 py-1 rounded ${allDutiesView === 'table' ? 'bg-[var(--accent)] text-[var(--primary)]' : 'bg-[var(--primary)] text-[var(--accent)] border border-[var(--accent)]/30'}`}
                  onClick={() => setAllDutiesView('table')}
                  aria-pressed={allDutiesView === 'table'}
                >
                  Table View
                </button>
                <button
                  className={`px-4 py-1 rounded ${allDutiesView === 'list' ? 'bg-[var(--accent)] text-[var(--primary)]' : 'bg-[var(--primary)] text-[var(--accent)] border border-[var(--accent)]/30'}`}
                  onClick={() => setAllDutiesView('list')}
                  aria-pressed={allDutiesView === 'list'}
                >
                  List View
                </button>
                <button
                  onClick={fetchAllDuties}
                  className="ml-auto px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded font-semibold"
                >
                  Refresh
                </button>
              </div>

              {loadingAll ? (
                <div className="p-8 text-center text-[var(--neutral)]/60">Loading...</div>
              ) : (
                allDutiesView === 'table' ? renderTimetable(allDuties, false) : renderListView(allDuties)
              )}
            </div>
          )}

          {activeTab === 'my' && (
            <div>
              {loadingMy ? (
                <div className="p-8 text-center text-[var(--neutral)]/60">Loading...</div>
              ) : (
                <MyDutiesTimetable duties={myDuties} deleteDuty={deleteDuty} deleteLoadingId={deleteLoadingId} />
              )}
            </div>
          )}

          {activeTab === 'assign' && renderAssignDutyForm()}
        </div>
      </div>
    </>
  );
}
