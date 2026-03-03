import { useEffect, useState } from "react";

export function useMonthlyData(todos) {
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedField, setSelectedField] = useState("createdAt");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMonthlyData() {
      // Only set loading if we don't have any data yet
      if (!monthlyData) setLoading(true);

      try {
        const url = `/api/v1/todos/todos-by-month?field=${selectedField}&year=${selectedYear}`;
        console.log("Fetching monthly data from:", url);
        const res = await fetch(url);
        const data = await res.json();
        console.log("Monthly data response:", data);
        if (res.ok) {
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const formattedData = data.data.monthlyTodos.map((item) => ({
            month: monthNames[item.month - 1],
            tasks: item.numTodos,
          }));
          console.log("Formatted monthly data:", formattedData);
          setMonthlyData(formattedData);
        } else {
          console.error("Error response:", data);
        }
      } catch (error) {
        console.error("Failed to fetch monthly data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMonthlyData();
  }, [selectedField, selectedYear, todos]);

  return {
    monthlyData,
    selectedField,
    setSelectedField,
    selectedYear,
    setSelectedYear,
    loading,
  };
}
