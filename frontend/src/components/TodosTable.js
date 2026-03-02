import StatusBadge from "./StatusBadge";
import Badge from "./Badge";
import TaskLoader from "./TaskLoader";
import NoTasks from "./NoTasks";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TodosTable({
  todos,
  onEdit,
  onArchive,
  onDelete,
  onRecover,
  loading,
  view,
  isOverdue,
}) {
  return (
    <div className="table-card">
      {loading ? (
        <TaskLoader />
      ) : todos.length === 0 ? (
        <NoTasks view={view} />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Created</th>
              <th className="th-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo._id}>
                <td>
                  <div className="todo-title">{todo.title}</div>
                  {todo.description && (
                    <div className="todo-desc">{todo.description}</div>
                  )}
                </td>
                <td>
                  <StatusBadge status={todo.status} />
                </td>
                <td>
                  <Badge priority={todo.priority} />
                </td>
                <td
                  className={
                    isOverdue(todo.dueDate) ? "text-red" : "text-muted"
                  }
                >
                  {formatDate(todo.dueDate)}
                </td>
                <td className="text-muted">{formatDate(todo.createdAt)}</td>
                <td>
                  <div className="action-btns">
                    {view === "active" ? (
                      <>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => onEdit(todo)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-indigo"
                          onClick={() => onArchive(todo._id)}
                        >
                          🗄️ Archive
                        </button>
                        <button
                          className="btn btn-sm btn-outline-red"
                          onClick={() => onDelete(todo)}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-outline-green"
                          onClick={() => onRecover(todo._id)}
                        >
                          ↩️ Recover
                        </button>
                        <button
                          className="btn btn-sm btn-outline-red"
                          onClick={() => onDelete(todo)}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TodosTable;
