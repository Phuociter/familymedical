import React, { useState } from 'react';
import { FAMILY_MEMBERS } from '../../constants.js';
import MedicalRecordModal from './MedicalRecordModal.jsx';

const FamilyMemberCard = ({ member, onViewDetails }) => {
    const initials = member.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between transition-shadow hover:shadow-md">
            <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full ${member.avatarColor} flex items-center justify-center text-white font-bold text-xl mr-4`}>
                    {initials}
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.relationship}</p>
                </div>
            </div>
            <button onClick={() => onViewDetails(member)} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Xem chi tiết &gt;
            </button>
        </div>
    );
};

const FamilyList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const filteredMembers = FAMILY_MEMBERS.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (member) => {
    setSelectedMember(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  return (
    <>
      <div className="p-6 md:p-8">
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <input
                      type="text"
                      placeholder="Tìm kiếm theo tên chủ hộ hoặc bệnh nhân..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                  />
              </div>
              <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  + Thêm thành viên
              </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => <FamilyMemberCard key={member.id} member={member} onViewDetails={handleViewDetails} />)
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500">Không tìm thấy thành viên nào.</p>
            </div>
          )}
        </div>
      </div>
      {selectedMember && (
        <MedicalRecordModal 
          member={selectedMember} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
};

export default FamilyList;