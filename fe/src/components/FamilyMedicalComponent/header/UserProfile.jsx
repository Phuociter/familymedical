import React from "react";

export default function FamilyHeadInfo({ user }) {
  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">
        Thông tin chủ hộ
      </h2>

      {/* Thông tin cá nhân */}
      <div className="grid grid-cols-2 gap-4 text-gray-700">
        <p><span className="font-semibold">Họ và tên:</span> {user.FullName}</p>
        <p><span className="font-semibold">Email:</span> {user.Email}</p>
        <p><span className="font-semibold">Số điện thoại:</span> {user.PhoneNumber || "Chưa cập nhật"}</p>
        <p><span className="font-semibold">CCCD:</span> {user.CCCD}</p>
        <p className="col-span-2">
          <span className="font-semibold">Địa chỉ:</span> {user.Address || "Chưa cập nhật"}
        </p>
      </div>

      {/* Gói dịch vụ */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Gói sử dụng</h3>
        <p><span className="font-medium">Loại gói:</span> {user.PackageType}</p>
        <p><span className="font-medium">Trạng thái:</span> 
          <span className={`ml-2 px-2 py-1 rounded ${
            user.PaymentStatus === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {user.PaymentStatus}
          </span>
        </p>
        <p><span className="font-medium">Ngày hết hạn:</span> {user.ExpiryDate}</p>
      </div>
    </div>
  );
}
