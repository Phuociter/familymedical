import { useState, useEffect } from 'react';

export default function EditMemberModal({ member: init, doctors, onClose, onSave }) {
  const [member, setMember] = useState(init);
  useEffect(() => setMember(init), [init]);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Chỉnh sửa hồ sơ</h3>

        <div className="form-row">
          <label>Tên</label>
          <input
            value={member.name}
            onChange={(e) => setMember({ ...member, name: e.target.value })}
          />
        </div>

        <div className="form-row">
          <label>Ngày sinh</label>
          <input
            type="date"
            value={member.dob}
            onChange={(e) => setMember({ ...member, dob: e.target.value })}
          />
        </div>

        <div className="form-row">
          <label>Giới tính</label>
          <select
            value={member.gender}
            onChange={(e) => setMember({ ...member, gender: e.target.value })}
          >
            <option>Nam</option>
            <option>Nữ</option>
            <option>Khác</option>
          </select>
        </div>

        <div className="form-row">
          <label>Bác sĩ</label>
          <select
            value={member.doctorId || ''}
            onChange={(e) => setMember({ ...member, doctorId: e.target.value })}
          >
            <option value="">-- Chưa chọn --</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Ghi chú</label>
          <textarea
            value={member.notes}
            onChange={(e) => setMember({ ...member, notes: e.target.value })}
          />
        </div>

        <div className="modal-actions">
          <button onClick={() => onSave(member)}>Lưu</button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
