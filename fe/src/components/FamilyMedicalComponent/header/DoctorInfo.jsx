import { FaTimes } from "react-icons/fa";
import React, { useState } from "react";

export default function DoctorInfo({ doctor, onClose }) {
  console.log("doctor");
  // if (!doctor) return null;
  const [formData, setFormData] = useState(doctor || {});
  return (
    // Lớp phủ tối nền + căn giữa modal
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-40 z-30"
      onClick={onClose} // Click ra ngoài để thoát
    >
      {/* Modal chính */}
      <div
        className="relative w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200"
        onClick={(e) => e.stopPropagation()} // Ngăn click bên trong bị tính là click ngoài
      >
        {/* Nút thoát */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Thông tin bác sĩ gia đình
        </h2>

        {/* Thông tin bác sĩ */}
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p>
            <span className="font-semibold">Họ và tên:</span>{" "}
            {/* {doctor.FullName || "Chưa có"} */}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {/* {doctor.Email || "Chưa có"} */}
          </p>
          <p>
            <span className="font-semibold">Mã bác sĩ:</span>{" "}
            {/* {doctor.DoctorCode || "Không rõ"} */}
          </p>
          <p>
            <span className="font-semibold">CCCD:</span>{" "}
            {/* {doctor.CCCD || "Chưa cập nhật"} */}
          </p>
        </div>

        {/* Phần phân công */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            Thông tin phân công
          </h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            {/* <li>Ngày bắt đầu: {doctor.StartDate || "Chưa có"}</li>
            <li>Ngày kết thúc: {doctor.EndDate || "Chưa có"}</li> */}
            <li>Ngày bắt đầu: {"Chưa có"}</li>
            <li>Ngày kết thúc: {"Chưa có"}</li>
            <li>
              Trạng thái yêu cầu:{" "}
              <span
                className={`px-2 py-1 rounded ${
                  // doctor.Status === "Approved"
                    "Approved"
                    ? "bg-green-100 text-green-700"
                    // : doctor.Status === "Rejected"
                    : "Rejected"

                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {/* {doctor.Status || "Pending"} */}
                {"Pending"}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
