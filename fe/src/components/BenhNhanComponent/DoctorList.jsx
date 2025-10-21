export default function DoctorList({ doctors, onAdd, onEdit, onDelete, previewUrl }) {
  return (
    <aside className="sidebar right">
      <div className="doctors-head">
        <h3>Bác sĩ</h3>
        <button onClick={onAdd}>+ Thêm</button>
      </div>
      <div className="doctor-list">
        {doctors.map((d) => (
          <div className="doctor-item" key={d.id}>
            <div>
              <strong>{d.name}</strong>
            </div>
            <div>
              <button onClick={() => onEdit(d.id)}>✏️</button>
              <button onClick={() => onDelete(d.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <div className="preview-box">
        <h4>Xem PDF</h4>
        {previewUrl ? (
          <iframe src={previewUrl} style={{ width: '100%', height: 400 }} />
        ) : (
          <div className="empty">Chưa chọn file</div>
        )}
      </div>
    </aside>
  );
}
