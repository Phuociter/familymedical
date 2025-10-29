import React, { useState } from "react";

export default function FamilyPdfList({ member, onClose }) {
  const [pdfList, setPdfList] = useState(member.pdfs || []);

  // 🟣 Thêm file PDF bệnh án mới
  const handleAddPDF = () => {
    const newPdf = {
      id: Date.now(),
      name: `BenhAn_${pdfList.length + 1}.pdf`,
      addedAt: new Date().toLocaleString(),
      note: "Bệnh án mới được thêm.",
    };
    setPdfList([...pdfList, newPdf]);
  };

  // 🟣 Xoá file PDF
  const handleDeletePDF = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bệnh án này?")) {
      setPdfList(pdfList.filter((pdf) => pdf.id !== id));
    }
  };

  return (
    // lớp phủ modal
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-40 z-30"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🔹 Tiêu đề */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-blue-600">
            Danh sách bệnh án của {member.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            ✖
          </button>
        </div>

        {/* 🔸 Danh sách PDF */}
        {pdfList.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Chưa có bệnh án nào được thêm.
          </p>
        ) : (
          <ul className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {pdfList.map((pdf) => (
              <li
                key={pdf.id}
                className="p-3 bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200 flex justify-between items-center"
              >
                <div>
                  <div className="text-gray-700 font-medium">{pdf.note}</div>
                  <div className="text-xs text-gray-500">{pdf.addedAt}</div>
                  <div className="text-sm text-blue-600 mt-1">{pdf.name}</div>
                </div>
                <button
                  onClick={() => handleDeletePDF(pdf.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* 🔘 Nút thêm PDF mới */}
        <button
          onClick={handleAddPDF}
          className="mt-6 w-full border-2 border-blue-500 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50 transition"
        >
          + Thêm PDF bệnh án mới
        </button>
      </div>
    </div>
  );
}
