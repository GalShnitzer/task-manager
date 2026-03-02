function Footer({ todos }) {
  return (
    <footer className="footer">
      <span className="footer-label">Summary</span>
      <span className="footer-stat">
        📊 <strong>{todos.length}</strong> tasks shown
      </span>
      {/* Add more summary fields here */}
      <span className="footer-credit">Task Manager · Built with ♥</span>
    </footer>
  );
}

export default Footer;
