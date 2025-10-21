export default function FamilyList({ families, selectedFamilyId, onSelect, onAdd, onDelete, onRename }) {
  return (
    <aside className="sidebar left">
      <div className="family-head">
        <h3>Hộ gia đình</h3>
        <button onClick={onAdd}>+ Thêm hộ</button>
      </div>
      <div className="family-list">
        {families.map((f) => (
          <div
            key={f.id}
            className={`family-item ${f.id === selectedFamilyId ? 'active' : ''}`}
            onClick={() => onSelect(f.id)}
          >
            <div>{f.name}</div>
            <div className="family-actions">
              <button onClick={(e) => { e.stopPropagation(); onRename(f.id); }}>✏️</button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(f.id); }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
