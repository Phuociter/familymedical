import React, { useEffect, useState } from 'react';
// import { DOCTORS } from '../../constants.js';
// import DoctorDetailModal from './DoctorDetailModal.jsx';
import * as DoctorDetailModalModule from './DoctorDetailModal.jsx'
const DoctorDetailModal = DoctorDetailModalModule.default;
import DoctorAPI from '../../api/DoctorAPI.js';

const DoctorList = ({ familyDoctorId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [doctorRequest,setDoctorRequest] = useState();
    const token = localStorage.getItem('userToken');
    const user = JSON.parse(localStorage.getItem('user'));
    // console.log("familyID",familyDoctorId);
    useEffect(() =>{
        const fetchDoctors = async() => {
            try {
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

    const onSetFamilyDoctor = async(doctorID) => {
        try{
                const doctorDataR = await DoctorAPI.createDoctorRequest(doctorID, user.userID, token);
                setDoctorRequest(doctorDataR);  
                console.log("create doctor request:", doctorDataR);
                if(doctorDataR==null){
                    console.log("tạo yêu cầu tới bác sĩ lỗi");
                }          
        }catch(error){
            throw(error);
        }
    }

    const handleRequestDoctor = (doctorID) => {
        onSetFamilyDoctor(doctorID);
        handleCloseModal();
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
                                key={doctor.userID}
                                onClick={() => handleDoctorClick(doctor)}
                                className="p-4 flex items-center space-x-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                            >
                                <img
                                    className="h-12 w-12 rounded-full object-cover"
                                    src={`${doctor.avatarUrl}`}
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
