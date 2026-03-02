function Badge({ priority }) {
  return (
    <span className={`badge badge-priority badge-${priority}`}>{priority}</span>
  );
}

export default Badge;
