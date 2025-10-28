import React, { useState } from "react";

export default function PaymentPlans() {
  const [selected, setSelected] = useState(null);

  const plans = [
    { id: 1, type: "1 tháng", price: "100.000đ" },
    { id: 2, type: "6 tháng", price: "500.000đ" },
    { id: 3, type: "1 năm", price: "900.000đ" },
  ];

  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Chọn gói sử dụng</h2>
      <div className="grid grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={`cursor-pointer p-4 rounded-lg border-2 transition-transform hover:scale-105 ${
              selected === plan.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <h3 className="text-lg font-semibold text-blue-600">{plan.type}</h3>
            <p className="text-gray-700 mt-2">{plan.price}</p>
          </div>
        ))}
      </div>

      <button
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
        disabled={!selected}
        onClick={() => alert("Thanh toán gói " + plans.find(p => p.id === selected)?.type)}
      >
        Thanh toán ngay
      </button>
    </div>
  );
}
