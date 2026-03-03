import { useEffect, useState } from "react";

export function useTodoStats(todos) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Only set loading if we don't have any data yet
      if (!stats) setLoading(true);

      try {
        const res = await fetch("/api/v1/todos/todos-stats");
        const data = await res.json();
        if (res.ok) {
          setStats(data.data.todoStats);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [todos]);

  return { stats, loading };
}
