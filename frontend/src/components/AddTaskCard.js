function AddTaskCard({ onAdd }) {
  return (
    <div className="add-task-card">
      <div>
        <div className="add-task-title">Add a new task</div>
        <div className="add-task-sub">
          Tip: Break big tasks down into smaller steps.
        </div>
      </div>
      <button className="btn btn-primary" onClick={onAdd}>
        ＋ New Task
      </button>
    </div>
  );
}

export default AddTaskCard;
