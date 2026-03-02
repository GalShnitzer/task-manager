function Error({ error, onClearError }) {
  if (!error) return null;
  return (
    <div className="error-banner">
      <span>⚠️ {error}</span>
      <button className="error-close" onClick={onClearError}>
        ✕
      </button>
    </div>
  );
}

export default Error;
