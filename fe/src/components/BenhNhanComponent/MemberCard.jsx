export default function MemberCard({
  member, familyId, onEdit, onDelete, onUpload, onRemoveFile,
  onPreviewFile, onAssignDoctor, doctors
}) {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>{member.name}</h3>
          <div className="meta">{member.gender} • {member.dob}</div>
        </div>
        <div className="card-actions">
          <button onClick={() => onEdit(member)}>✏️</button>
          <button onClick={() => onDelete(member.id, familyId)}>🗑️</button>
        </div>
      </div>
      <div className="card-body">
        <p>{member.notes || <i>Không có ghi chú</i>}</p>
        <div className="file-row">
          <div className="file-list">
            {member.files?.map((f) => (
              <div className="file-item" key={f.id}>
                <button onClick={() => onPreviewFile(f.url)}>{f.name}</button>
                <button onClick={() => onRemoveFile(f.id, member.id, familyId)}>X</button>
              </div>
            ))}
          </div>
          <button onClick={() => onUpload(member.id, familyId)}>Tải PDF</button>
        </div>
        <div className="assign-doctor">
          <label>Gán bác sĩ:</label>
          <select
            value={member.doctorId || ''}
            onChange={(e) => onAssignDoctor(e.target.value || null, member.id, familyId)}
          >
            <option value="">-- Chưa chọn --</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
