import { useState } from "react";
import searchIcon from "../../assets/images/search.png";
import { fakeFamilies } from "../../api/fakeData";
import {AddRelatives, FamilyPdfList, DoctorDetail} from "./subFamilyList/";
export default function FamilyList({families,}) {
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [view, setView] = useState("none");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const doctors = [
    { id: 1, name: "Nguyễn Văn A", specialty: "Tim mạch", email: "vana@example.com", phone: "0123456789", experience: "10 năm", hospital: "BV Chợ Rẫy" },
    { id: 2, name: "Trần Thị B", specialty: "Nhi khoa", email: "thib@example.com", phone: "0987654321", experience: "8 năm", hospital: "BV Nhi Đồng 1" },
    { id: 3, name: "Phạm Ngọc C", specialty: "Da liễu", email: "ngocc@example.com", phone: "0912345678", experience: "12 năm", hospital: "BV Da Liễu" },
    { id: 4, name: "Ngô Đức D", specialty: "Thần kinh", email: "ducd@example.com", phone: "0977123456", experience: "15 năm", hospital: "BV Nhân Dân 115" },
  ];

// Lọc danh sách bác sĩ theo tên
const filteredDoctors = doctors.filter((doctor) =>
  doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
);


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
        <div className="relative w-[400px] border-l bg-white border-[#ccc] flex flex-col">
          {/* Ô tìm kiếm */}
          <div className="relative w-full max-w-md p-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bác sĩ..."
              className="w-full rounded-full px-4 py-2 pl-10 bg-white border border-[#42A5F5] text-[#424242] placeholder-[#BDBDBD] focus:outline-none focus:ring-2 focus:ring-[#42A5F5]"
            />
            <img
              src={searchIcon}
              alt="search"
              className="absolute left-6 top-6 w-5 h-5 text-[#BDBDBD]"
            />
          </div>

        {/* Danh sách bác sĩ được lọc */}
        <div className="overflow-y-auto max-h-[500px] px-4 pb-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setView("doctorDetail");
                }}
                className="p-3 mb-2 bg-[#FAFAFA] border border-[#E0E0E0] rounded-md cursor-pointer hover:bg-[#E3F2FD] transition"
              >
                <p className="font-medium text-[#1E88E5]">{doctor.name}</p>
                <p className="text-sm text-[#616161]">{doctor.specialty}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Không tìm thấy bác sĩ</p>
          )}
        </div>
      </div>

      <main className="p-6">
        {view === "themnguoithan" && <AddRelatives user={fakeFamilies} onClose={() => setView("none")} />}
        {view === "pdfList" && <FamilyPdfList  member={fakeFamilies} onClose={() => setView("none")} />}
        {view === "doctorDetail" && <DoctorDetail doctor={selectedDoctor} onClose={() => setView("none")} />}
      </main>
    </div>
  );
}
