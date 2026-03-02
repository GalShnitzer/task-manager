function SummarySection({ stats, loading }) {
  return (
    <div className="footer-top">
      <span className="footer-label">📊 Summary</span>
      <div className="footer-stats-group">
        <span className="footer-stat">
          <strong>{stats?.totalTodos || 0}</strong> total tasks
        </span>
        {stats && (
          <span className="footer-stat">
            ✅ <strong>{stats.completionStats.doneTodos}</strong> done
            <span className="footer-percentage">
              ({stats.completionStats.percentageDone}%)
            </span>
          </span>
        )}
      </div>
      <span className="footer-credit">Task Manager · Built with ♥</span>
    </div>
  );
}

export default SummarySection;
