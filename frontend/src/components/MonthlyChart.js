import { useMonthlyData } from "../hooks/useMonthlyData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function MonthlyChart({ todos }) {
  const {
    monthlyData,
    selectedField,
    setSelectedField,
    selectedYear,
    setSelectedYear,
    loading,
  } = useMonthlyData(todos);

  if (loading || !monthlyData) return null;

  return (
    <div className="footer-monthly-section">
      <div className="footer-field-selector">
        <div className="selector-group">
          <label htmlFor="field-select">View by:</label>
          <select
            id="field-select"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="field-select"
          >
            <option value="createdAt">Created Date</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>

        <div className="selector-group">
          <label htmlFor="year-select">Year:</label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="field-select"
          >
            {[2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="footer-bar-chart-wrapper">
        <div className="footer-bar-chart-container">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={monthlyData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              barCategoryGap="15%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#64748b" }}
                interval={0}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                formatter={(value) => `${value} tasks`}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                }}
              />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default MonthlyChart;
