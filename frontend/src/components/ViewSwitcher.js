function ViewSwitcher({ view, setView }) {
  return (
    <div className="view-switcher">
      <button
        className={`btn ${view === "active" ? "btn-primary" : "btn-outline"}`}
        onClick={() => setView("active")}
      >
        📋 Active Tasks
      </button>
      <button
        className={`btn ${view === "archived" ? "btn-indigo" : "btn-outline"}`}
        onClick={() => setView("archived")}
      >
        🗄️ Archive
      </button>
    </div>
  );
}

export default ViewSwitcher;
