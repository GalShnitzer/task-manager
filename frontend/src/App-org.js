import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_BASE = "http://localhost:8000/api/v1/todos";

const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];
const STATUS_OPTIONS = ["todo", "in-progress", "done"];
const LIMIT = 10;

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Badge({ priority }) {
  return (
    <span className={`badge badge-priority badge-${priority}`}>{priority}</span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`badge badge-status badge-status-${status.replace("-", "")}`}
    >
      {status}
    </span>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function TaskForm({ initial = {}, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    priority: initial.priority || "low",
    dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : "",
    status: initial.status || "todo",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="task-form">
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className="form-input"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="What needs to be done?"
          maxLength={40}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-input form-textarea"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Add more details..."
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select
            className="form-input"
            value={form.priority}
            onChange={(e) => set("priority", e.target.value)}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input
            type="date"
            className="form-input"
            value={form.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
          />
        </div>
      </div>
      {initial._id && (
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-input"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onSave(form)}
          disabled={loading || !form.title.trim()}
        >
          {loading ? "Saving..." : "Save Task"}
        </button>
      </div>
    </div>
  );
}

function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  return (
    <Modal open={open} title="⚠️ Confirm Delete" onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Delete Permanently
        </button>
      </div>
    </Modal>
  );
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [view, setView] = useState("active");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    dueThisWeek: false,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalResults / LIMIT));

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        sort: "createdAt",
      });
      let url;

      if (view === "archived") {
        url = `${API_BASE}/archived?${params}`;
      } else if (filters.dueThisWeek) {
        url = `${API_BASE}/due-this-week?${params}`;
      } else {
        if (filters.status) params.set("status", filters.status);
        if (filters.priority) params.set("priority", filters.priority);
        url = `${API_BASE}?${params}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setTodos(data.data.todos);
      setTotalResults(data.results || 0);
    } catch (e) {
      setError(e.message);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, [page, view, filters]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const body = { ...form };
      if (!body.dueDate) delete body.dueDate;
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create");
      setShowAddModal(false);
      fetchTodos();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      const body = { ...form };
      if (!body.dueDate) delete body.dueDate;
      const res = await fetch(`${API_BASE}/${editTodo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setEditTodo(null);
      fetchTodos();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const handleArchive = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to archive");
      fetchTodos();
    } catch (e) {
      setError(e.message);
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/permanent`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteConfirm(null);
      fetchTodos();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRecover = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/recover`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to recover");
      fetchTodos();
    } catch (e) {
      setError(e.message);
    }
  };

  const setFilter = (key, val) => {
    setPage(1);
    setFilters((f) => ({
      ...f,
      [key]: val,
      ...(key === "dueThisWeek" && val ? { status: "", priority: "" } : {}),
    }));
  };

  const switchView = (v) => {
    setView(v);
    setPage(1);
    setFilters({ status: "", priority: "", dueThisWeek: false });
  };

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1 className="header-title">✅ Your Task Manager</h1>
        <p className="header-subtitle">
          Have a productive day! Manage your tasks efficiently and stay
          organized.
        </p>
      </header>

      <main className="main">
        {/* ERROR */}
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button className="error-close" onClick={() => setError(null)}>
              ✕
            </button>
          </div>
        )}

        {/* ADD TASK CARD */}
        <div className="add-task-card">
          <div>
            <div className="add-task-title">Add a new task</div>
            <div className="add-task-sub">Capture what's on your mind</div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            ＋ New Task
          </button>
        </div>

        {/* VIEW SWITCHER */}
        <div className="view-switcher">
          <button
            className={`btn ${view === "active" ? "btn-primary" : "btn-outline"}`}
            onClick={() => switchView("active")}
          >
            📋 Active Tasks
          </button>
          <button
            className={`btn ${view === "archived" ? "btn-indigo" : "btn-outline"}`}
            onClick={() => switchView("archived")}
          >
            🗄️ Archive
          </button>
        </div>

        {/* FILTERS */}
        {view === "active" && (
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
              <button
                className="btn btn-sm btn-clear"
                onClick={() => {
                  setFilters({ status: "", priority: "", dueThisWeek: false });
                  setPage(1);
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        )}

        {/* TABLE */}
        <div className="table-card">
          {loading ? (
            <div className="table-empty">
              <div className="table-empty-icon">⏳</div>
              Loading tasks...
            </div>
          ) : todos.length === 0 ? (
            <div className="table-empty">
              <div className="table-empty-icon">
                {view === "archived" ? "🗄️" : "🎉"}
              </div>
              {view === "archived"
                ? "No archived tasks"
                : "No tasks found — add one above!"}
            </div>
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
                              onClick={() => setEditTodo(todo)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-indigo"
                              onClick={() => handleArchive(todo._id)}
                            >
                              🗄️ Archive
                            </button>
                            <button
                              className="btn btn-sm btn-outline-red"
                              onClick={() => setDeleteConfirm(todo)}
                            >
                              🗑️ Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-sm btn-outline-green"
                              onClick={() => handleRecover(todo._id)}
                            >
                              ↩️ Recover
                            </button>
                            <button
                              className="btn btn-sm btn-outline-red"
                              onClick={() => setDeleteConfirm(todo)}
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

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <span className="footer-label">Summary</span>
        <span className="footer-stat">
          📊 <strong>{todos.length}</strong> tasks shown
        </span>
        {/* Add more summary fields here */}
        <span className="footer-credit">Task Manager · Built with ♥</span>
      </footer>

      {/* MODALS */}
      <Modal
        open={showAddModal}
        title="✨ New Task"
        onClose={() => setShowAddModal(false)}
      >
        <TaskForm
          onSave={handleCreate}
          onCancel={() => setShowAddModal(false)}
          loading={saving}
        />
      </Modal>

      <Modal
        open={!!editTodo}
        title="✏️ Edit Task"
        onClose={() => setEditTodo(null)}
      >
        {editTodo && (
          <TaskForm
            initial={editTodo}
            onSave={handleUpdate}
            onCancel={() => setEditTodo(null)}
            loading={saving}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        message={`Are you sure you want to permanently delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        onConfirm={() => handlePermanentDelete(deleteConfirm._id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
