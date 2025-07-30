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
const startHour = 9;
const endHour = 16;
const slotMinutes = [0, 15, 30, 45];

// Color palette for different duties
const dutyColors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
  'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
  'bg-orange-500', 'bg-cyan-500'
];

function getWeekRange(date = new Date()) {
  const d = dayjs(date);
  const monday = d.startOf('week').add(1, 'day');
  const sunday = monday.add(6, 'day');
  return [monday.startOf('day'), sunday.endOf('day')];
}

export default function DutyPage() {
  const [activeTab, setActiveTab] = useState('my');
  const [dutyTypes, setDutyTypes] = useState([]);
  const [staffList, setStaffList] = useState([]);
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
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [allDuties, setAllDuties] = useState([]);
  const [myDuties, setMyDuties] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMy, setLoadingMy] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchDutyTypes();
    fetchStaffList();
  }, []);

  const fetchDutyTypes = async () => {
    const res = await axios.get('/api/duties/types');
    setDutyTypes(res.data.data || res.data);
  };
  const fetchStaffList = async () => {
    const res = await axios.get('/api/events/staff-emails');
    setStaffList(res.data.data || res.data);
  };

  // Fetch all duties for the week
  const fetchAllDuties = async () => {
    setLoadingAll(true);
    const [weekStart, weekEnd] = getWeekRange();
    const res = await axios.get('/api/duties', {
      params: {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
      },
    });
    setAllDuties(res.data.data || res.data);
    setLoadingAll(false);
  };

  // Fetch my duties for the week
  const fetchMyDuties = async () => {
    setLoadingMy(true);
    const [weekStart, weekEnd] = getWeekRange();
    if (!user || !user.email) {
      console.error("User not found or email is missing");
      setLoadingMy(false);
      return;
    }
    const res = await axios.get('/api/duties', {
      params: {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        teacher: user.email,
      },
    });
    setMyDuties(res.data.data || res.data);
    setLoadingMy(false);
  };

  // Fetch on tab switch
  useEffect(() => {
    if (activeTab === 'all') fetchAllDuties();
    if (activeTab === 'my') fetchMyDuties();
  }, [activeTab]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Multi-date picker (simple, not a calendar)
  const handleDateAdd = (e) => {
    const date = e.target.value;
    if (date && !form.dates.includes(date)) {
      setForm(prev => ({ ...prev, dates: [...prev.dates, date] }));
    }
  };
  const handleDateRemove = (date) => {
    setForm(prev => ({ ...prev, dates: prev.dates.filter(d => d !== date) }));
  };

  // Tagging
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    if (value.startsWith('@')) {
      const searchTerm = value.slice(1).toLowerCase();
      setFilteredStaff(staffList.filter(staff => staff.email.toLowerCase().includes(searchTerm)));
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
  };
  const removeTag = (email) => {
    setForm(prev => ({ ...prev, assignedTo: prev.assignedTo.filter(e => e !== email) }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title required';
    if (!form.dutyType) errors.dutyType = 'Duty type required';
    if (form.dutyType === 'Custom' && !form.customType.trim()) errors.customType = 'Custom type required';
    if (!form.dates.length) errors.dates = 'At least one date required';
    if (!form.startTime) errors.startTime = 'Start time required';
    if (!form.endTime) errors.endTime = 'End time required';
    if (!form.assignedTo.length) errors.assignedTo = 'Assign at least one teacher';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      await axios.post('/api/duties', {
        ...form,
        createdBy: 'admin@demo.com',
      });
      setSuccessMsg('Duty assigned successfully!');
      setForm({
        title: '', description: '', dutyType: '', customType: '', dates: [], startTime: '', endTime: '', assignedTo: [], location: ''
      });
    } catch (err) {
      setSuccessMsg('Failed to assign duty.');
    }
  };

  // Function to assign color to duty
  const getDutyColor = (dutyId, colorMap) => {
    if (!colorMap.has(dutyId)) {
      const colorIndex = colorMap.size % dutyColors.length;
      colorMap.set(dutyId, dutyColors[colorIndex]);
    }
    return colorMap.get(dutyId);
  };

  // Function to calculate duty coverage for an hour
  const calculateDutyCoverage = (duty, date, hour) => {
    const startTime = dayjs(`${date}T${duty.startTime}`);
    const endTime = dayjs(`${date}T${duty.endTime}`);
    const hourStart = dayjs(`${date}T${hour.toString().padStart(2, '0')}:00`);
    const hourEnd = hourStart.add(1, 'hour');
    
    // Check if duty overlaps with this hour
    if (startTime >= hourEnd || endTime <= hourStart) {
      return 0; // No overlap
    }
    
    // Calculate overlap
    const overlapStart = startTime.isAfter(hourStart) ? startTime : hourStart;
    const overlapEnd = endTime.isBefore(hourEnd) ? endTime : hourEnd;
    const overlapMinutes = overlapEnd.diff(overlapStart, 'minute');
    
    return Math.round((overlapMinutes / 60) * 100); // Return percentage
  };

  // New My Duties Timetable (Vertical Days, Horizontal Time)
  // Function to calculate duty positioning for seamless connection
const calculateDutyPosition = (duty, date, hour) => {
  const startTime = dayjs(`${date}T${duty.startTime}`);
  const endTime = dayjs(`${date}T${duty.endTime}`);
  const hourStart = dayjs(`${date}T${hour.toString().padStart(2, '0')}:00`);
  const hourEnd = hourStart.add(1, 'hour');
  
  // Check if duty overlaps with this hour
  if (startTime >= hourEnd || endTime <= hourStart) {
    return null; // No overlap
  }
  
  // Calculate start position within the hour (0-100%)
  let startPercent = 0;
  if (startTime > hourStart) {
    const minutesFromHourStart = startTime.diff(hourStart, 'minute');
    startPercent = (minutesFromHourStart / 60) * 100;
  }
  
  // Calculate end position within the hour (0-100%)
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



function DutyDetailsModal({ duty, onClose }) {
  if (!duty) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-2 right-4 text-xl text-gray-700 font-bold"
          onClick={onClose}
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


function MyDutiesTimetable({ duties }) {
  const [selectedDuty, setSelectedDuty] = useState(null);
  const colorMap = new Map();
  const [weekStart] = getWeekRange();
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);



  // Build duty data for each day-hour combination
  const dutyData = {};
  const maxDutiesPerDay = {};
  weekDays.forEach((day) => {
    const date = weekStart.add(weekDays.indexOf(day), "day").format("YYYY-MM-DD");
    dutyData[day] = {};

    const dayDuties = Array.from(
      new Set(duties.filter(d => d.dates.some(dt => dayjs(dt).format("YYYY-MM-DD") === date)).map(d => d._id))
    );
    const dayDutyLevels = {};
    dayDuties.forEach((dutyId, idx) => { dayDutyLevels[dutyId] = idx; });
    let maxDuties = dayDuties.length;

    hours.forEach((hour) => {
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
                  className={`p-3 min-w-[140px] font-bold text-[var(--neutral)] ${
                    index < hours.length - 1 ? "border-r border-gray-300" : ""
                  }`}
                >
                  {hour}:00 - {hour + 1}:00
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekDays.map((day) => {
              const date = weekStart.add(weekDays.indexOf(day), "day");
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
                  {hours.map((hour, hourIndex) => {
                    const hourKey = `${hour}-${hour + 1}`;
                    const hourDuties = dutyData[day][hourKey] || [];
                    return (
                      <td
                        key={hour}
                        className={`py-2 align-top relative bg-gray-50 ${hourIndex < hours.length - 1 ? "border-r border-gray-300" : ""}`}
                        style={{ height: `${rowHeight}px` }}
                      >
                        <div className="relative w-full h-full">
                          {hourDuties.map((duty) => {
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
                                onClick={() => setSelectedDuty(duty)}
                                tabIndex={0}
                                title={`${duty.title}\n${duty.startTime} ~ ${duty.endTime}${duty.location ? ` @ ${duty.location}` : ""}`}
                              >
                                <div className="truncate leading-tight text-white text-center font-bold">{duty.title}</div>
                                <div className="text-xs truncate leading-tight text-white text-center">{duty.startTime} - {duty.endTime}</div>
                                {duty.location && (
                                  <div className="text-xs truncate leading-tight text-white text-center">{duty.location}</div>
                                )}
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



// Make sure the color array has good contrast colors
const dutyColors = [
  'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600', 
  'bg-yellow-600', 'bg-indigo-600', 'bg-pink-600', 'bg-teal-600',
  'bg-orange-600', 'bg-cyan-600', 'bg-rose-600', 'bg-emerald-600'
];


  // Original Timetable for "All Duties" (keeping the existing format)
  function renderTimetable(duties, isMine) {
    // Build a map: { 'YYYY-MM-DD': { 'HH:mm': [duty, ...] } }
    const map = {};
    duties.forEach(duty => {
      duty.dates.forEach(dateStr => {
        const date = dayjs(dateStr).format('YYYY-MM-DD');
        if (!map[date]) map[date] = {};
        // For each slot in duty time, add to map
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
    // Build grid
    const [weekStart] = getWeekRange();
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              <th className="border p-2 bg-[var(--primary)] sticky left-0 z-10">Time</th>
              {weekDays.map((wd, i) => (
                <th key={wd} className="border p-2 bg-[var(--primary)]">{wd}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: (endHour - startHour) * 4 + 1 }).map((_, rowIdx) => {
              const hour = startHour + Math.floor(rowIdx / 4);
              const min = slotMinutes[rowIdx % 4];
              const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
              return (
                <tr key={timeStr}>
                  <td className="border p-2 bg-[var(--primary)] sticky left-0 z-10 font-bold">{timeStr}</td>
                  {weekDays.map((wd, colIdx) => {
                    const date = weekStart.add(colIdx, 'day').format('YYYY-MM-DD');
                    const slotDuties = (map[date] && map[date][timeStr]) || [];
                    return (
                      <td key={wd} className="border p-1 min-w-[100px] h-10 align-top">
                        {slotDuties.map((duty, i) => (
                          <div key={duty._id + i} className={`rounded px-1 py-0.5 mb-1 text-xs font-semibold ${isMine ? 'bg-green-200 text-green-900' : 'bg-blue-200 text-blue-900'}`}
                            title={`${duty.title} (${duty.startTime}-${duty.endTime})\n${duty.assignedTo.join(', ')}`}
                          >
                            {duty.title} <span className="font-normal">({duty.assignedTo.join(', ')})</span>
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
  }

  return (
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
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'all' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">All Teachers' Duties (Weekly Timetable)</h2>
            <button onClick={fetchAllDuties} className="mb-4 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded font-semibold">Refresh</button>
            {loadingAll ? (
              <div className="p-8 text-center text-[var(--neutral)]/60">Loading...</div>
            ) : (
              renderTimetable(allDuties, false)
            )}
          </div>
        )}
       {activeTab === 'my' && (
  <div>
    {/* ... */}
    {loadingMy ? (
      <div className="p-8 text-center text-[var(--neutral)]/60">Loading...</div>
    ) : (
      <MyDutiesTimetable duties={myDuties} />
    )}
  </div>
)}

        {activeTab === 'assign' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Assign Duty</h2>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
              {successMsg && <div className="text-green-600 font-semibold mb-2">{successMsg}</div>}
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input type="text" name="title" value={form.title} onChange={handleFormChange} className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]" />
                {formErrors.title && <div className="text-red-500 text-sm">{formErrors.title}</div>}
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Duty Type</label>
                <div className="text-xs text-[var(--neutral)]/60 mb-1">dutyTypes: {JSON.stringify(dutyTypes)}</div>
                <select name="dutyType" value={form.dutyType} onChange={handleFormChange} className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]">
                  <option value="">Select type</option>
                  {dutyTypes && dutyTypes.length > 0 ? (
                    dutyTypes.map(type => <option key={type} value={type}>{type}</option>)
                  ) : (
                    <option value="">No types found</option>
                  )}
                </select>
                {form.dutyType === 'Custom' && (
                  <input type="text" name="customType" value={form.customType} onChange={handleFormChange} placeholder="Custom type" className="w-full p-3 mt-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]" />
                )}
                {formErrors.dutyType && <div className="text-red-500 text-sm">{formErrors.dutyType}</div>}
                {formErrors.customType && <div className="text-red-500 text-sm">{formErrors.customType}</div>}
              </div>
              <div>
                <label className="block font-semibold mb-1">Location</label>
                <input type="text" name="location" value={form.location} onChange={handleFormChange} className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Dates</label>
                <div className="flex gap-2 mb-2">
                  <input type="date" onChange={handleDateAdd} className="p-2 rounded border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]" />
                  {form.dates.map(date => (
                    <span key={date} className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full text-xs">
                      {date}
                      <button type="button" onClick={() => handleDateRemove(date)} className="ml-1 text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
                {formErrors.dates && <div className="text-red-500 text-sm">{formErrors.dates}</div>}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Start Time</label>
                  <select name="startTime" value={form.startTime} onChange={handleFormChange} className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]">
                    <option value="">Start</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {formErrors.startTime && <div className="text-red-500 text-sm">{formErrors.startTime}</div>}
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">End Time</label>
                  <select name="endTime" value={form.endTime} onChange={handleFormChange} className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]">
                    <option value="">End</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {formErrors.endTime && <div className="text-red-500 text-sm">{formErrors.endTime}</div>}
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Assign To (Tag by email)</label>
                <div className="relative">
                  <input type="text" value={tagInput} onChange={handleTagInputChange} placeholder="Type @ to tag..." className="w-full p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--primary)] text-[var(--neutral)]" />
                  {showTagSuggestions && (
                    <div className="absolute top-full left-0 right-0 bg-[var(--secondary)] border border-[var(--accent)]/30 rounded shadow z-10 max-h-40 overflow-y-auto">
                      {filteredStaff.map(staff => (
                        <button key={staff.email} type="button" onClick={() => handleTagSelect(staff)} className="w-full text-left px-4 py-2 hover:bg-[var(--accent)]/10">
                          {staff.email}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.assignedTo.map(email => (
                    <span key={email} className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full text-xs">
                      {email}
                      <button type="button" onClick={() => removeTag(email)} className="ml-1 text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
                {formErrors.assignedTo && <div className="text-red-500 text-sm">{formErrors.assignedTo}</div>}
              </div>
              <button type="submit" className="px-6 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors shadow mt-4">Assign Duty</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
