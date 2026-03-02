import { useReducer, useEffect } from "react";

const API_BASE = "/api/v1/todos";
export const LIMIT = 10;

async function parseJsonOrThrow(res, fallbackMessage) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    const preview = text.slice(0, 120);
    throw new Error(
      `${fallbackMessage}: expected JSON but got ${contentType || "unknown"}. Response starts with: ${preview}`,
    );
  }

  return res.json();
}

const initialState = {
  loading: false,
  saving: false,
  todos: [],
  page: 1,
  refreshKey: 0,
  error: null,
  totalResults: 0,
  view: "active",
  filters: {
    status: "",
    priority: "",
    dueThisWeek: false,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };

    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        todos: action.payload.todos,
        totalResults: action.payload.totalResults,
      };

    case "REMOVE_TODO":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo._id !== action.payload),
        totalResults: Math.max(0, state.totalResults - 1),
      };

    case "UPSERT_TODO":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo._id === action.payload._id
            ? { ...todo, ...action.payload }
            : todo,
        ),
      };

    case "FETCH_ERROR":
      return { ...state, loading: false, todos: [], error: action.payload };

    case "SAVE_START":
      return { ...state, saving: true, error: null };

    case "SAVE_SUCCESS":
      return { ...state, saving: false };

    case "SAVE_ERROR":
      return { ...state, saving: false, error: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "SET_PAGE":
      return { ...state, page: action.payload };

    case "REFETCH":
      return { ...state, refreshKey: state.refreshKey + 1 };

    case "SET_VIEW":
      return {
        ...state,
        view: action.payload,
        page: 1,
        filters: initialState.filters,
      };

    case "SET_FILTER":
      return {
        ...state,
        page: 1,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
          // clear status/priority when enabling dueThisWeek
          ...(action.payload.key === "dueThisWeek" && action.payload.value
            ? { status: "", priority: "" }
            : {}),
        },
      };

    case "CLEAR_FILTERS":
      return { ...state, page: 1, filters: initialState.filters };

    default:
      return state;
  }
}

export function useTodos() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { page, view, filters, refreshKey } = state;

  // ─── Fetch ───────────────────────────────────────────────
  useEffect(() => {
    async function fetchTodos() {
      dispatch({ type: "FETCH_START" });
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
        const data = await parseJsonOrThrow(res, "Fetch failed");
        if (!res.ok) throw new Error(data.message || "Failed to fetch");

        dispatch({
          type: "FETCH_SUCCESS",
          payload: { todos: data.data.todos, totalResults: data.results || 0 },
        });
      } catch (e) {
        dispatch({ type: "FETCH_ERROR", payload: e.message });
      }
    }

    fetchTodos();
  }, [page, view, filters, refreshKey]);

  // ─── Refetch helper ───────────────────────────────────────
  function refetch() {
    dispatch({ type: "REFETCH" });
  }

  // ─── Mutations ────────────────────────────────────────────
  async function createTodo(form) {
    dispatch({ type: "SAVE_START" });
    try {
      const body = { ...form };
      if (!body.dueDate) delete body.dueDate;
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await parseJsonOrThrow(res, "Create failed");
      if (!res.ok) throw new Error(data.message || "Failed to create");
      dispatch({ type: "SAVE_SUCCESS" });
      refetch();
      return true;
    } catch (e) {
      dispatch({ type: "SAVE_ERROR", payload: e.message });
      return false;
    }
  }

  async function updateTodo(id, form) {
    dispatch({ type: "SAVE_START" });
    try {
      const body = { ...form };
      if (!body.dueDate) delete body.dueDate;
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await parseJsonOrThrow(res, "Update failed");
      if (!res.ok) throw new Error(data.message || "Failed to update");
      const updatedTodo = data?.data?.todo;
      if (updatedTodo) {
        dispatch({ type: "UPSERT_TODO", payload: updatedTodo });
      }
      dispatch({ type: "SAVE_SUCCESS" });
      refetch();
      return true;
    } catch (e) {
      dispatch({ type: "SAVE_ERROR", payload: e.message });
      return false;
    }
  }

  async function archiveTodo(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to archive");
      dispatch({ type: "REMOVE_TODO", payload: id });
      refetch();
    } catch (e) {
      dispatch({ type: "SAVE_ERROR", payload: e.message });
    }
  }

  async function deleteTodoPermanent(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}/permanent`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      dispatch({ type: "REMOVE_TODO", payload: id });
      refetch();
    } catch (e) {
      dispatch({ type: "SAVE_ERROR", payload: e.message });
    }
  }

  async function recoverTodo(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}/recover`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to recover");
      dispatch({ type: "REMOVE_TODO", payload: id });
      refetch();
    } catch (e) {
      dispatch({ type: "SAVE_ERROR", payload: e.message });
    }
  }

  // ─── Return ───────────────────────────────────────────────
  return {
    // state
    ...state,
    totalPages: Math.max(1, Math.ceil(state.totalResults / LIMIT)),

    // navigation
    setPage: (page) => dispatch({ type: "SET_PAGE", payload: page }),
    setView: (view) => dispatch({ type: "SET_VIEW", payload: view }),
    setFilter: (key, value) =>
      dispatch({ type: "SET_FILTER", payload: { key, value } }),
    clearFilters: () => dispatch({ type: "CLEAR_FILTERS" }),
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),

    // mutations
    createTodo,
    updateTodo,
    archiveTodo,
    deleteTodoPermanent,
    recoverTodo,
  };
}
