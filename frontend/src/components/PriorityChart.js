import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PriorityChart({ stats, loading }) {
  const getPriorityChartData = () => {
    if (!stats) return [];
    return [
      { name: "Low", value: stats.priorityStats.lowPriority, color: "#22c55e" },
      {
        name: "Medium",
        value: stats.priorityStats.mediumPriority,
        color: "#eab308",
      },
      {
        name: "High",
        value: stats.priorityStats.highPriority,
        color: "#f97316",
      },
      {
        name: "Urgent",
        value: stats.priorityStats.urgentPriority,
        color: "#dc2626",
      },
    ];
  };

  const priorityData = getPriorityChartData();

  if (!stats) return null;

  return (
    <div
      className="footer-priority-section"
      style={{ opacity: loading ? 0.6 : 1 }}
    >
      <div className="footer-chart-container">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={priorityData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={0}
              dataKey="value"
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value} tasks`}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "4px",
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              height={25}
              wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PriorityChart;
