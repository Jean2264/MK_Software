import "./ConfirmModal.css";
function ConfirmModal({
  isOpen,
  title = "",
  message = "",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-modal-overlay">
      <section className="confirm-modal">
        <div className="confirm-modal-icon">
          <i className="bi bi-trash"></i>
        </div>

        <div className="confirm-modal-content">
          <h2>{title}</h2>
          <p>{message}</p>
        </div>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="confirm-modal-confirm"
            onClick={onConfirm}
          >
            <i className="bi bi-trash"></i>
            Eliminar
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;
