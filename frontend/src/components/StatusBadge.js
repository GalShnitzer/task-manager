function StatusBadge({ status }) {
  return (
    <span
      className={`badge badge-status badge-status-${status.replace("-", "")}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
