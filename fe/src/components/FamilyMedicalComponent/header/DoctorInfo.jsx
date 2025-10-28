import React from "react";

export default function DoctorInfo({ doctor }) {
  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">
        Thông tin bác sĩ gia đình
      </h2>

      <div className="grid grid-cols-2 gap-4 text-gray-700">
        <p><span className="font-semibold">Họ và tên:</span> {doctor.FullName}</p>
        <p><span className="font-semibold">Email:</span> {doctor.Email}</p>
        <p><span className="font-semibold">Mã bác sĩ:</span> {doctor.DoctorCode}</p>
        <p><span className="font-semibold">CCCD:</span> {doctor.CCCD}</p>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Thông tin phân công</h3>
        <ul className="list-disc list-inside text-gray-600">
          <li>Ngày bắt đầu: {doctor.StartDate || "Chưa có"}</li>
          <li>Ngày kết thúc: {doctor.EndDate || "Chưa có"}</li>
          <li>Trạng thái yêu cầu: {doctor.Status || "Pending"}</li>
        </ul>
      </div>
    </div>
  );
}
