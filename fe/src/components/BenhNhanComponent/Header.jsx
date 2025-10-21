export default function Header({ onAddFamily }) {
  return (
    <header className="app-header">
      <div className="logo">🏥 Quản lý hồ sơ y tế gia đình</div>
      <div className="header-actions">
        <button onClick={onAddFamily}>+ Thêm hộ</button>
      </div>
    </header>
  );
}
