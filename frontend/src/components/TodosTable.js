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

function truncateText(text, maxLength = 30) {
  if (!text || text.length <= maxLength) return text;

  const words = text.split(" ");
  let result = "";

  for (const word of words) {
    const testResult = result ? result + " " + word : word;
    if (testResult.length > maxLength) break;
    result = testResult;
  }

  return result ? result + "..." : "...";
}

function TodosTable({
  todos,
  onEdit,
  onArchive,
  onDelete,
  onRecover,
  onStatusChange,
  onViewDetail,
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
              <tr
                key={todo._id}
                className="clickable-row"
                onClick={() => onViewDetail(todo)}
              >
                <td>
                  <div className="todo-title">{todo.title}</div>
                  {todo.description && (
                    <div className="todo-desc">
                      {truncateText(todo.description)}
                    </div>
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
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="action-btns">
                    {view === "active" ? (
                      <>
                        {todo.status === "todo" && (
                          <button
                            className="btn btn-sm btn-outline-amber"
                            onClick={() =>
                              onStatusChange(todo._id, "in-progress")
                            }
                            title="Mark as In Progress"
                          >
                            started working!
                          </button>
                        )}
                        {todo.status === "in-progress" && (
                          <button
                            className="btn btn-sm btn-outline-green"
                            onClick={() => onStatusChange(todo._id, "done")}
                            title="Mark as Done"
                          >
                            finished!
                          </button>
                        )}
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
