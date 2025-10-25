import { useState } from "react";
import searchIcon from "../../assets/images/search.png";

export default function FamilyList({
  families,
  // selectedFamilyId,
  // onSelectFamily,
  // onAddFamily,
  // onDeleteFamily,
  // onRenameFamily,
  // onSelectMember,
  // membersData
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showPDFs, setShowPDFs] = useState(false);
  const [pdfList, setPdfList] = useState([]);

  // 🟡 Khi click 1 hồ sơ bệnh nhân
  const handleSelectMember = (member) => {
    setSelectedMemberId(member.id);
    setShowPDFs(true);
    setPdfList(member.pdfs || []); // Dữ liệu bệnh án (PDF) của bệnh nhân
    if (onSelectMember) onSelectMember(member.id);
  };

  // 💗 Khi thêm file PDF
  const handleAddPDF = () => {
    const newPdf = {
      id: Date.now(),
      name: `BenhAn_${pdfList.length + 1}.pdf`,
      addedAt: new Date().toLocaleString(),
      note: "Bệnh án mới được thêm.",
    };
    setPdfList([...pdfList, newPdf]);
  };

  return (
    <div className="flex w-full h-full bg-gray-50 justify-end">
      {/* 🟩 Cột trái: danh sách hộ */}
      {/* <h3>Hộ gia đình</h3> */}
          

      {/* danh sách hồ sơ bệnh nhân */}
      <section className="flex-1 p-6 bg-[#ffffff] mr-3 pd-1 overflow-y-auto">
        {/* sau đó sẽ sửa lại sau lấy tên hộ gđ từ db */}
        <h3 className="flex-1 flex justify-center text-lg font-semibold text-gray-800 mb-4">Hộ gia đình</h3> 
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Danh sách hồ sơ </h3>
        <div className="grid grid-cols-2 gap-4">
          {families.map((m) => (
            <div
              key={m.id}
              className={`p-4 bg-white shadow rounded-md border hover:shadow-lg cursor-pointer ${
                selectedMemberId === m.id ? "border-blue-500" : "border-gray-200"
              }`}
              onClick={() => handleSelectMember(m)}
            >
              <div className="font-medium text-gray-800">{m.name}</div>
              <div className="text-sm text-gray-500">Số bệnh án: {m.caseNumber}</div>
            </div>
          ))}
            {/* 🟡 Thêm người thân */}
          <div
            onClick={() => alert("Thêm người thân mới!")} // bạn có thể thay alert = mở modal
            className="flex flex-col items-center justify-center p-4 bg-gray-50 border-2 border-dashed border-blue-400 rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition"
          >
            <span className="text-blue-500 font-semibold text-lg">+ Thêm người thân</span>
          </div>
        </div>

        {/* 🩷 Vùng PDF (hiện khi chọn bệnh nhân) */}
        {showPDFs && (
          <div className="mt-8 p-4 border-2 border-dashed border-pink-400 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Danh sách bệnh án</h4>

            {/* Lọc bệnh án */}
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm text-gray-600">Lọc theo thời gian thêm:</label>
              <select className="border rounded px-2 py-1 text-sm">
                <option>Tất cả</option>
                <option>Mới nhất</option>
                <option>Cũ nhất</option>
              </select>
            </div>

            {/* Danh sách PDF */}
            <ul className="flex flex-col gap-2">
              {pdfList.map((pdf) => (
                <li
                  key={pdf.id}
                  className="p-3 bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200"
                >
                  <div className="text-gray-700 font-medium">{pdf.note}</div>
                  <div className="text-xs text-gray-500">{pdf.addedAt}</div>
                  <div className="text-sm text-blue-600 mt-1">{pdf.name}</div>
                </li>
              ))}
            </ul>

            {/* Thêm PDF mới */}
            <button
              onClick={handleAddPDF}
              className="mt-4 w-full border-2 border-blue-400 text-blue-500 font-medium py-3 rounded-lg hover:bg-blue-50"
            >
              + Thêm PDF
            </button>

          </div>
        )}
      </section>
        {/* tìm kiếm bác sĩ */}
        <div className="relative w-[500px] border-l justify-end ">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ..."
              className="w-full rounded-full px-4 py-2 pl-10 ml-5 mt-3 mr-150  bg-white border border-blue-500 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <img
              src={searchIcon}
              className="absolute left-3 ml-5 top-6 w-5 h-5 text-gray-400"
            >
            </img>
          </div>
        </div>
    </div>
  );
}
