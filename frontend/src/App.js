import { useState } from "react";
import "./App.css";
import { useTodos } from "./hooks/useTodos";

// Import components
import Badge from "./components/Badge";
import StatusBadge from "./components/StatusBadge";
import Modal from "./components/Modal";
import TaskForm from "./components/TaskForm";
import ConfirmDialog from "./components/ConfirmDialog";
import Main from "./components/Main";
import Header from "./components/Header";
import Error from "./components/Error";
import AddTaskCard from "./components/AddTaskCard";
import ViewSwitcher from "./components/ViewSwitcher";
import Filters from "./components/Filters";
import TodosTable from "./components/TodosTable";
import Pagination from "./components/Pagination";
import Footer from "./components/Footer";

export default function App() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const {
    todos,
    loading,
    saving,
    error,
    page,
    totalPages,
    view,
    filters,
    setPage,
    setView,
    setFilter,
    clearFilters,
    clearError,
    createTodo,
    updateTodo,
    archiveTodo,
    deleteTodoPermanent,
    recoverTodo,
  } = useTodos();

  // ─── Handlers ────────────────────────────────────────────
  function onAddTask() {
    setShowAddModal(true);
  }
  async function handleCreate(form) {
    const success = await createTodo(form);
    if (success) setShowAddModal(false);
  }

  async function handleUpdate(form) {
    const success = await updateTodo(editTodo._id, form);
    if (success) setEditTodo(null);
  }

  async function handlePermanentDelete(id) {
    await deleteTodoPermanent(id);
    setDeleteConfirm(null);
  }

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  return (
    <div className="app">
      <Header />

      <Main>
        <Error error={error} onClearError={clearError} />
        <AddTaskCard onAdd={onAddTask} />
        <ViewSwitcher view={view} setView={setView} />
        {view === "active" && (
          <Filters
            filters={filters}
            setFilter={setFilter}
            clearFilters={clearFilters}
          />
        )}
        <TodosTable
          todos={todos}
          onEdit={setEditTodo}
          onArchive={archiveTodo}
          onDelete={setDeleteConfirm}
          onRecover={recoverTodo}
          loading={loading}
          view={view}
          isOverdue={isOverdue}
        />
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </Main>

      <Footer todos={todos} />

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
