function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button
        className="btn btn-outline"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        ← Prev
      </button>
      <span className="pagination-info">
        Page {page} of {totalPages}
      </span>
      <button
        className="btn btn-outline"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;
