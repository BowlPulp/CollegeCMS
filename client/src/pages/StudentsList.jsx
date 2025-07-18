import { useState } from "react";

// Sample hardcoded student data
const studentData = [
  { id: 1, name: "Aarav Mehta", branch: "CSE", placed: true, company: "Google" },
  { id: 2, name: "Isha Patel", branch: "ECE", placed: false, company: "" },
  { id: 3, name: "Karan Singh", branch: "IT", placed: true, company: "Amazon" },
  { id: 4, name: "Meena Joshi", branch: "EEE", placed: false, company: "" },
  { id: 5, name: "Ravi Shah", branch: "CSE", placed: true, company: "Microsoft" },
];

export default function StudentsList() {
  const [search, setSearch] = useState("");

  const filtered = studentData.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.branch.toLowerCase().includes(search.toLowerCase()) ||
    student.company.toLowerCase().includes(search.toLowerCase())
  );

  const total = studentData.length;
  const placed = studentData.filter((s) => s.placed).length;
  const unplaced = total - placed;
  const percentPlaced = ((placed / total) * 100).toFixed(1);

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
          <p className="text-sm text-gray-300">Placed</p>
          <p className="text-2xl font-bold text-green-400">{placed}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--secondary)" }}>
          <p className="text-sm text-gray-300">Unplaced</p>
          <p className="text-2xl font-bold text-red-400">{unplaced}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--secondary)" }}>
          <p className="text-sm text-gray-300">% Placed</p>
          <p className="text-2xl font-bold text-yellow-400">{percentPlaced}%</p>
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search by name, branch, or company..."
          className="w-full p-3 rounded-lg outline-none"
          style={{
            backgroundColor: "var(--neutral)",
            color: "var(--primary)",
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Student Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead>
            <tr>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>#</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Name</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Branch</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Placed</th>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>Company</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, index) => (
              <tr key={student.id}>
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border">{student.name}</td>
                <td className="p-2 border text-center">{student.branch}</td>
                <td className="p-2 border text-center">
                  {student.placed ? (
                    <span className="text-green-400 font-semibold">Yes</span>
                  ) : (
                    <span className="text-red-400 font-semibold">No</span>
                  )}
                </td>
                <td className="p-2 border text-center">
                  {student.company || "-"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-red-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
