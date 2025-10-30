import { useState } from "react";
import searchIcon from "../../assets/images/search.png";
import AddRelatives from "./subFamilyList/AddRelatives";
import FamilyPdfList from "./subFamilyList/FamilyPdfList";
import { fakeFamilies } from "../../api/fakeData";

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
  const [view, setView] = useState("none");

  // 🟡 Khi click 1 hồ sơ bệnh nhân
  // const handleSelectMember = (member) => {
  //   setSelectedMemberId(member.id);
  //   setShowPDFs(true);
  //   setPdfList(member.pdfs || []); // Dữ liệu bệnh án (PDF) của bệnh nhân
  //   if (onSelectMember) onSelectMember(member.id);
  // };

  // 💗 Khi thêm file PDF
  // const handleAddPDF = () => {
  //   const newPdf = {
  //     id: Date.now(),
  //     name: `BenhAn_${pdfList.length + 1}.pdf`,
  //     addedAt: new Date().toLocaleString(),
  //     note: "Bệnh án mới được thêm.",
  //   };
  //   setPdfList([...pdfList, newPdf]);
  // };

  return (
    <div className="flex w-full h-full bg-[#f4f6f8] justify-end">
        

      {/* danh sách hồ sơ bệnh nhân */}
      <section className="flex-1 p-6 bg-[#f4f6f8] mr-3 pd-1 overflow-y-auto">
        {/* sau đó sẽ sửa lại sau lấy tên hộ gđ từ db */}
        <h3 className="flex-1 flex justify-center text-lg font-semibold text-[#424242] mb-4">Hộ gia đình</h3> 
        <h3 className="text-lg font-semibold text-[#424242] mb-4">Danh sách hồ sơ </h3>
        <div className="grid grid-cols-2 gap-4 " >
          {families.map((m) => (
            <div
              key={m.id}
              className={`p-4 bg-white shadow rounded-md border border-[#ccc] hover:shadow-lg transform hover:scale-105 transition duration-200 cursor-pointer ${
                selectedMemberId === m.id ? "border-[#2196F3]" : "border-[#EEEEEE]"
              }`}
              onClick={() => {setView("pdfList");}}
            >
              <div className="font-medium text-gray-800">{m.name}</div>
              <div className="text-sm text-gray-500">Số bệnh án: {m.caseNumber}</div>
              <div className="text-sm text-gray-500">Hồ sơ được gửi đến bác sĩ: {m.caseNumber}</div>
            </div>
          ))}
            {/* 🟡 Thêm người thân */}
          <div
            // onClick={() => alert("Thêm người thân mới!")} // bạn có thể thay alert = mở modal
            className="flex flex-col items-center justify-center p-4 bg-gray-50 border-2 border-dashed border-[#42A5F5] rounded-md cursor-pointer hover:bg-[#E3F2FD] hover:border-[#42A5F5] transition"
          >
            <button onClick={() => {setView("themnguoithan");}} 
            className="text-[#42A5F5] font-semibold text-lg"
            >
              + Thêm người thân
            </button>
          </div>
        </div>

      </section>
        {/* tìm kiếm bác sĩ */}
        <div className="relative w-[400px] border-l bg-white border-[#ccc] justify-end ">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ..."
              className="w-[390px] rounded-full px-4 py-2 pl-10 ml-1 mt-3 mr-150  bg-white border border-blue-500 text-[#424242] placeholder-[#BDBDBD] focus:outline-none focus:ring-2 focus:ring-[#42A5F5]"
            />
            <img
              src={searchIcon}
              className="absolute left-3 ml-1 top-6 w-5 h-5 text-[#BDBDBD]"
            >
            </img>
          </div>
        </div>
      <main className="p-6">
        {view === "themnguoithan" && <AddRelatives user={fakeFamilies} onClose={() => setView("none")} />}
        {view === "pdfList" && <FamilyPdfList  member={fakeFamilies} onClose={() => setView("none")} />}
      </main>
    </div>
  );
}
