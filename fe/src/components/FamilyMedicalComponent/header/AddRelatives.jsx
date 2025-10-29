import React, { useState } from "react";
import { FaTimes, FaFileUpload, FaPlus } from "react-icons/fa";

export default function AddRelatives({ user, onClose }) {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    address: "",
    relationship: "",
    pdfFiles: [],
  });

  // 🧩 Nhập dữ liệu form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 📂 Thêm file PDF
  const handleAddPdf = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      addedAt: new Date().toLocaleString(),
    }));
    setFormData((prev) => ({
      ...prev,
      pdfFiles: [...prev.pdfFiles, ...newFiles],
    }));
  };

  // 💾 Lưu thông tin
  const handleSave = () => {
    if (!formData.fullName.trim()) {
      alert("⚠️ Vui lòng nhập họ và tên!");
      return;
    }
    console.log("🧍‍♂️ Người thân mới:", formData);
    alert("✅ Thêm người thân thành công!");
    onClose();
  };

  return (
    // 🔹 Lớp phủ nền đen
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fadeIn"
      onClick={onClose}
    >
      {/* 🔸 Khung chính */}
      <div
        className="relative w-full max-w-2xl bg-white p-6 rounded-xl shadow-2xl border border-[#E0E0E0] animate-[slideIn_0.3s_ease] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Ngăn click trong form đóng modal
      >
        {/* ❌ Nút thoát (góc trên) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#9E9E9E] hover:text-[#F44336] transition"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* 🧾 Tiêu đề */}
        <h2 className="text-2xl font-bold text-[#1E88E5] mb-6 text-center">
          Thêm người thân mới
        </h2>

        {/* 🧍‍♂️ Form nhập thông tin */}
        <div className="grid grid-cols-2 gap-4 text-[#616161]">
          <div>
            <label className="font-semibold">Họ và tên</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#42A5F5]"
              placeholder="Nhập họ và tên"
            />
          </div>

          <div>
            <label className="font-semibold">Tuổi</label>
            <input
              name="age"
              value={formData.age}
              onChange={handleChange}
              type="number"
              min="0"
              className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#42A5F5]"
              placeholder="Nhập tuổi"
            />
          </div>

          <div className="col-span-2">
            <label className="font-semibold">Địa chỉ</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#42A5F5]"
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div className="col-span-2">
            <label className="font-semibold">Quan hệ với chủ hộ</label>
            <input
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#42A5F5]"
              placeholder="Ví dụ: Con, Vợ, Chồng..."
            />
          </div>
        </div>

        {/* 📎 File bệnh án */}
        <div className="mt-6 p-4 bg-[#E3F2FD] border border-[#64B5F6] rounded-lg">
          <h3 className="text-lg font-semibold text-[#1976D2] mb-3 flex items-center gap-2">
            <FaFileUpload /> Thêm file bệnh án (PDF)
          </h3>

          <label className="flex items-center justify-center w-full border-2 border-dashed border-[#42A5F5] rounded-lg py-4 cursor-pointer hover:bg-[#BBDEFB] transition">
            <FaPlus className="mr-2" />
            <span className="text-[#1E88E5] font-medium">Chọn file PDF</span>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleAddPdf}
              className="hidden"
            />
          </label>

          {formData.pdfFiles.length > 0 && (
            <ul className="mt-3 space-y-2 max-h-32 overflow-y-auto">
              {formData.pdfFiles.map((file) => (
                <li
                  key={file.id}
                  className="p-2 bg-white rounded border border-[#B0BEC5] text-sm flex justify-between"
                >
                  <span className="text-[#616161]">{file.name}</span>
                  <span className="text-[#BDBDBD]">{file.addedAt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 🔘 Nút lưu + thoát */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#E0E0E0] hover:bg-[#78909C] text-[#424242] font-medium rounded-lg transition"
          >
            Thoát
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#1E88E5] text-white font-semibold rounded-lg hover:bg-[#424242] transition"
          >
            Lưu người thân
          </button>
        </div>
      </div>
    </div>
  );
}
