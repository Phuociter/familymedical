import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

export default function PaymentPlans({ onClose }) {
  const [selected, setSelected] = useState(null);

  const plans = [
    { id: 1, type: "1 tháng", price: "100.000đ" },
    { id: 2, type: "6 tháng", price: "500.000đ" },
    { id: 3, type: "1 năm", price: "900.000đ" },
  ];

  return (
    // 🩵 Nền mờ phủ toàn màn hình
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-40 z-30"
      onClick={onClose} // Bấm ra ngoài để thoát
    >
      {/* 🔹 Khung modal chính */}
      <div
        className="relative w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200 transition-transform transform animate-[fadeIn_0.25s_ease]"
        onClick={(e) => e.stopPropagation()} // Ngăn tắt khi bấm bên trong
      >
        {/* ❌ Nút thoát */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* 🔹 Tiêu đề */}
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Chọn gói sử dụng
        </h2>

        {/* 🔸 Danh sách gói */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`cursor-pointer p-5 rounded-lg border-2 text-center transition-all duration-200 transform hover:scale-105 ${
                selected === plan.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-gray-50 hover:border-blue-400"
              }`}
            >
              <h3 className="text-lg font-semibold text-blue-700">
                {plan.type}
              </h3>
              <p className="text-gray-700 mt-2 font-medium">{plan.price}</p>
            </div>
          ))}
        </div>

        {/* 🔹 Nút thanh toán */}
        <button
          className={`mt-6 w-full py-2 rounded-lg font-semibold text-white transition 
          ${
            selected
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!selected}
          onClick={() =>
            alert(
              "💳 Thanh toán gói: " +
                plans.find((p) => p.id === selected)?.type
            )
          }
        >
          Thanh toán ngay
        </button>
      </div>
    </div>
  );
}
