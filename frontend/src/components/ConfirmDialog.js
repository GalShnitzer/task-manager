import Modal from "./Modal";

function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  return (
    <Modal open={open} title="⚠️ Confirm Delete" onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Delete Permanently
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
