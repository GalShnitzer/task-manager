import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import Badge from "./Badge";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(d) {
  if (!d) return "—";
  const date = new Date(d);
  return (
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " at " +
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function TodoDetailModal({ open, todo, onClose }) {
  if (!todo) return null;

  return (
    <Modal open={open} title="Task Details" onClose={onClose}>
      <div className="todo-detail">
        <div className="todo-detail-section">
          <h3 className="todo-detail-title">{todo.title}</h3>
        </div>

        {todo.description && (
          <div className="todo-detail-section">
            <p className="todo-detail-description">{todo.description}</p>
          </div>
        )}

        <div className="todo-detail-grid">
          <div className="todo-detail-section">
            <label className="todo-detail-label">Status</label>
            <StatusBadge status={todo.status} />
          </div>

          <div className="todo-detail-section">
            <label className="todo-detail-label">Priority</label>
            <Badge priority={todo.priority} />
          </div>
        </div>

        <div className="todo-detail-grid">
          <div className="todo-detail-section">
            <label className="todo-detail-label">Due Date</label>
            <div className="todo-detail-text">{formatDate(todo.dueDate)}</div>
          </div>

          <div className="todo-detail-section">
            <label className="todo-detail-label">Created At</label>
            <div className="todo-detail-text">
              {formatDateTime(todo.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default TodoDetailModal;
