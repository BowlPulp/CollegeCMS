const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = [
  "9:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 1:00",
  "1:00 - 2:00", "2:00 - 3:00", "3:00 - 4:00", "4:00 - 5:00"
];

export default function Timetable() {
  return (
    <div
      className="p-4 md:p-6 max-w-6xl mx-auto "
      style={{ backgroundColor: "var(--primary)", color: "var(--neutral)" }}
    >
      <h2
        className="text-3xl font-bold mb-6 text-center"
        style={{ color: "var(--accent)" }}
      >
        Weekly Timetable
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead>
            <tr>
              <th className="p-2 border" style={{ backgroundColor: "var(--secondary)" }}>
                Time
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="p-2 border"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, rowIndex) => (
              <tr key={slot}>
                <td
                  className="p-2 border font-medium"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  {slot}
                </td>
                {days.map((day, colIndex) => (
                  <td
                    key={`${day}-${slot}`}
                    className="p-2 border text-center hover:opacity-80 cursor-pointer transition"
                    style={{
                      backgroundColor: "var(--neutral)",
                      color: "var(--primary)",
                    }}
                  >
                    {/* Placeholder - you can replace with dynamic subject data */}
                    -
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
