import React, { useState } from "react";
import { FaTimes, FaEdit, FaSave } from "react-icons/fa";

export default function FamilyHeadInfo({ user, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    alert("✅ Đã lưu thay đổi thành công!");
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-40 z-30"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200 animate-[fadeIn_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🔹 Header */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-600">
            Thông tin chủ hộ
          </h2>

          <div className="flex items-center gap-3 z-20 ">
            {/* 🖊️ Nút chỉnh sửa / lưu */}
            <button
              onClick={() =>
                isEditing ? handleSave() : setIsEditing(true)
              }
              className={`flex items-center gap-1 px-3 bg-[#000000] py-1.5 rounded-md text-sm font-medium transition
                ${
                  isEditing
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            >
              {isEditing ? <FaSave /> : <FaEdit />}
              {isEditing ? "Lưu" : "Chỉnh sửa"}
            </button>

            {/* ❌ Nút thoát */}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500 transition"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 🔸 Thông tin cá nhân */}
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <div>
            <span className="font-semibold">Họ và tên:</span>{" "}
            {isEditing ? (
              <input
                name="FullName"
                value={formData.FullName || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full mt-1"
              />
            ) : (
              formData.FullName || "Chưa cập nhật"
            )}
          </div>

          <div>
            <span className="font-semibold">Email:</span>{" "}
            {isEditing ? (
              <input
                name="Email"
                value={formData.Email || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full mt-1"
              />
            ) : (
              formData.Email || "Chưa có"
            )}
          </div>

          <div>
            <span className="font-semibold">Số điện thoại:</span>{" "}
            {isEditing ? (
              <input
                name="PhoneNumber"
                value={formData.PhoneNumber || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full mt-1"
              />
            ) : (
              formData.PhoneNumber || "Chưa cập nhật"
            )}
          </div>

          <div>
            <span className="font-semibold">CCCD:</span>{" "}
            {isEditing ? (
              <input
                name="CCCD"
                value={formData.CCCD || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full mt-1"
              />
            ) : (
              formData.CCCD || "Chưa cập nhật"
            )}
          </div>

          <div className="col-span-2">
            <span className="font-semibold">Địa chỉ:</span>{" "}
            {isEditing ? (
              <input
                name="Address"
                value={formData.Address || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full mt-1"
              />
            ) : (
              formData.Address || "Chưa cập nhật"
            )}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Sô thành viên trong GĐ:</span>{" "}
            {isEditing ? (
              <input
                name="Address"
                value={formData.Address || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full mt-1"
              />
            ) : (
              formData.Address || "Chưa cập nhật"
            )}
          </div>
        </div>


        {/* 🔹 Gói dịch vụ */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            Gói sử dụng
          </h3>
          <p>
            <span className="font-medium">Loại gói:</span>{" "}
            {formData.PackageType || "Chưa đăng ký"}
          </p>
          <p>
            <span className="font-medium">Trạng thái:</span>
            <span
              className={`ml-2 px-2 py-1 rounded ${
                formData.PaymentStatus === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {formData.PaymentStatus || "Chưa thanh toán"}
            </span>
          </p>
          <p>
            <span className="font-medium">Ngày hết hạn:</span>{" "}
            {formData.ExpiryDate || "Chưa có"}
          </p>
        </div>
      </div>
    </div>
  );
}
