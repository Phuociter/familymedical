import React, { useEffect, useState } from 'react';
// import { DOCTORS } from '../../constants.js';
import DoctorDetailModal from './DoctorDetailModal.jsx';
import DoctorAPI from '../../api/DoctorAPI.js';

const DoctorList = ({ familyDoctorId, onSetFamilyDoctor }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctors, setDoctors] = useState([]);
    

    useEffect(() =>{
        const fetchDoctors = async() => {
            try {
                const token = localStorage.getItem('userToken');
                // const token = localStorage.getItem('token');
                const doctorData = await DoctorAPI.getAllDoctor(token);
                setDoctors(doctorData);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách bác sĩ:', error);
            }
        };
        fetchDoctors();
    }, [])
    const filteredDoctors = doctors.filter(doctor =>
        doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    
    const handleDoctorClick = (doctor) => {
        setSelectedDoctor(doctor);
    };

    const handleCloseModal = () => {
        setSelectedDoctor(null);
    };

    const handleRequestDoctor = (doctor) => {
        if (familyDoctorId !== null) {
            alert('Không thể yêu cầu trở thành bác sĩ gia đình do vẫn còn hợp đồng với bác sĩ trước đó.');
        } else {
            onSetFamilyDoctor(doctor.id);
            alert(`Đã gửi yêu cầu thành công tới bác sĩ ${doctor.name}.`);
            handleCloseModal();
        }
    };

  return (
    <>
        <div className="p-6 md:p-8">
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm bác sĩ theo tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md transition bg-[#FFFFFF] border-[#D1D5DB] focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                />
            </div>
            <div className="bg-[#FFFFFF] rounded-lg shadow-sm border border-[#EEEEEE] overflow-hidden">
                <ul className="divide-y divide-[#EEEEEE]">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map(doctor => (
                            <li
                                key={doctor.id}
                                onClick={() => handleDoctorClick(doctor)}
                                className="p-4 flex items-center space-x-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                            >
                                <img
                                    className="h-12 w-12 rounded-full object-cover"
                                    src={`https://picsum.photos/seed/${doctor.ID}/100`}
                                    alt={`Bác sĩ ${doctor.fullName}`}
                                />
                                <div>
                                    <p className="font-semibold text-[#111827]">{doctor.fullName}</p>
                                    {/* <p className="text-sm text-[#4B5563]">{doctor.specialty}</p> */}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-[#6B7280]">
                            Không tìm thấy bác sĩ nào.
                        </li>
                    )}
                </ul>
            </div>
        </div>
        {selectedDoctor && (
            <DoctorDetailModal
                doctor={selectedDoctor}
                onClose={handleCloseModal}
                onRequest={handleRequestDoctor}
            />
        )}
    </>
  );
};

export default DoctorList;
