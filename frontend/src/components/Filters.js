const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];
const STATUS_OPTIONS = ["todo", "in-progress", "done"];

function Filters({ filters, setFilter, clearFilters }) {
  return (
    <div className="filters">
      <span className="filters-label">Filter:</span>

      <button
        className={`btn btn-sm ${filters.dueThisWeek ? "btn-cyan" : "btn-outline"}`}
        onClick={() => setFilter("dueThisWeek", !filters.dueThisWeek)}
      >
        📅 Due This Week
      </button>

      {STATUS_OPTIONS.map((s) => (
        <button
          key={s}
          className={`btn btn-sm ${filters.status === s && !filters.dueThisWeek ? "btn-primary" : "btn-outline"}`}
          onClick={() => {
            setFilter("status", filters.status === s ? "" : s);
            setFilter("dueThisWeek", false);
          }}
        >
          {s === "todo" ? "🔲" : s === "in-progress" ? "⏳" : "✅"} {s}
        </button>
      ))}

      {PRIORITY_OPTIONS.map((p) => (
        <button
          key={p}
          className={`btn btn-sm ${filters.priority === p && !filters.dueThisWeek ? `btn-priority-${p}` : "btn-outline"}`}
          onClick={() => {
            setFilter("priority", filters.priority === p ? "" : p);
            setFilter("dueThisWeek", false);
          }}
        >
          {p === "urgent"
            ? "🔴"
            : p === "high"
              ? "🟠"
              : p === "medium"
                ? "🟡"
                : "🟢"}{" "}
          {p}
        </button>
      ))}

      {(filters.status || filters.priority || filters.dueThisWeek) && (
        <button className="btn btn-sm btn-clear" onClick={clearFilters}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}

export default Filters;
