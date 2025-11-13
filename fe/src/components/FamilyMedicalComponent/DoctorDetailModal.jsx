import React, { useEffect, useRef } from 'react';

const DoctorDetailModal = ({ doctor, onClose, onRequest }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-[#000000] bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div
        ref={modalRef}
        className="bg-[#FFFFFF] rounded-lg shadow-xl w-full max-w-md p-6 sm:p-8 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctor-modal-title"
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#9CA3AF] hover:bg-[#E5E7EB]"
            aria-label="Đóng"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <img
          className="w-24 h-24 rounded-full mx-auto -mt-4 mb-4 border-4 border-[#FFFFFF] shadow-md"
          src={`https://picsum.photos/seed/${doctor.ID}/200`}
          alt={doctor.fullName}
        />

        <h2
          id="doctor-modal-title"
          className="text-2xl font-bold text-[#2563EB] mb-4"
        >
          {doctor.fullName}
        </h2>

        <div className="text-left space-y-3 text-[#374151]">
          {/* <p>
            <strong className="font-medium w-28 inline-block">Chuyên khoa:</strong> {doctor.specialty}
          </p> */}
          <p>
            <strong className="font-medium w-28 inline-block">Email:</strong> {doctor.email}
          </p>
          <p>
            <strong className="font-medium w-28 inline-block">Số điện thoại:</strong> {doctor.phoneNumber}
          </p>
          <p>
            <strong className="font-medium w-28 inline-block">Kinh nghiệm:</strong> {doctor.yearsOfExperience}
          </p>
          <p>
            <strong className="font-medium w-28 inline-block">Bệnh viện:</strong> {doctor.hospitalName}
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onRequest(doctor)}
            className="w-full px-6 py-3 bg-[#10B981] text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#059669] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981]"
          >
            Yêu cầu trở thành bác sĩ gia đình
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#3B82F6] text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#2563EB] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6]"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailModal;
