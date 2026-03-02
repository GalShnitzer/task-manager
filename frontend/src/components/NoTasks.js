function NoTasks({ view }) {
  return (
    <div className="table-empty">
      <div className="table-empty-icon">
        {view === "archived" ? "🗄️" : "🎉"}
      </div>
      {view === "archived"
        ? "No archived tasks"
        : "No tasks found — add one above!"}
    </div>
  );
}

export default NoTasks;
