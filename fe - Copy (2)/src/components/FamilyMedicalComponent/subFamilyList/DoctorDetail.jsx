import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

export default function DoctorDetail({ doctor, onClose }) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("");

  if (!doctor) return null;

  const handleSendRequest = () => {
    if (!selectedDuration) {
      alert("Vui lòng chọn thời gian mong muốn được chăm sóc!");
      return;
    }

    // Gửi yêu cầu (ở đây chỉ demo alert, sau này có thể gọi API)
    alert(
      `Đã gửi yêu cầu trở thành bác sĩ gia đình trong ${selectedDuration} cho bác sĩ ${doctor.name}.`
    );

    // Reset form
    setSelectedDuration("");
    setShowRequestForm(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[500px]">
        {/* Nút thoát */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#9E9E9E] hover:text-[#F44336] transition"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Thông tin bác sĩ */}
        <h2 className="text-2xl font-semibold text-[#1E88E5] mb-4 text-center">
          {doctor.name}
        </h2>
        <div className="space-y-2 text-gray-700">
          <p><strong>Chuyên khoa:</strong> {doctor.specialty}</p>
          <p><strong>Email:</strong> {doctor.email}</p>
          <p><strong>Số điện thoại:</strong> {doctor.phone}</p>
          <p><strong>Kinh nghiệm:</strong> {doctor.experience}</p>
          <p><strong>Bệnh viện:</strong> {doctor.hospital}</p>
        </div>

        {/* Nút chức năng */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={() => setShowRequestForm(true)}
            className="bg-[#66BB6A] text-white px-5 py-2 rounded-md hover:bg-[#43A047] transition"
          >
            Yêu cầu trở thành bác sĩ gia đình
          </button>

          <button
            onClick={onClose}
            className="bg-[#42A5F5] text-white px-5 py-2 rounded-md hover:bg-[#1E88E5] transition"
          >
            Quay lại
          </button>
        </div>

        {/* Form yêu cầu */}
        {showRequestForm && (
          <div className="mt-5 border-t pt-4">
            <h3 className="text-lg font-medium mb-2 text-[#43A047] text-center">
              Thời gian mong muốn được chăm sóc
            </h3>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#43A047]"
            >
              <option value="">-- Chọn thời gian --</option>
              <option value="1 tháng">1 tháng</option>
              <option value="6 tháng">6 tháng</option>
              <option value="12 tháng">12 tháng</option>
            </select>

            <div className="flex justify-center mt-4 gap-3">
              <button
                onClick={handleSendRequest}
                className="bg-[#43A047] text-white px-4 py-2 rounded-md hover:bg-[#2E7D32] transition"
              >
                Gửi yêu cầu
              </button>
              <button
                onClick={() => setShowRequestForm(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
