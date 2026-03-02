import { useTodoStats } from "../hooks/useTodoStats";
import SummarySection from "./SummarySection";
import PriorityChart from "./PriorityChart";
import MonthlyChart from "./MonthlyChart";

function Footer({ todos }) {
  const { stats, loading } = useTodoStats(todos);

  return (
    <footer className="footer">
      <SummarySection stats={stats} loading={loading} />

      <div className="footer-charts-row">
        <PriorityChart stats={stats} loading={loading} />
        <MonthlyChart todos={todos} />
      </div>
    </footer>
  );
}

export default Footer;
