import React, { useState, useEffect } from 'react';
import { FAMILY_MEMBERS } from '../../constants.js';
import MedicalRecordModal from './MedicalRecordModal.jsx';
import AddMemberModal from './AddMemberModal.jsx';

const FamilyMemberCard = ({ member, onViewDetails }) => {
    const initials = member.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div className="bg-[#FFFFFF] p-4 rounded-lg shadow-sm border border-[#EEEEEE] flex items-center justify-between transition-shadow hover:shadow-md">
            <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full ${member.avatarColor} flex items-center justify-center text-[#FFFFFF] font-bold text-xl mr-4`}>
                    {initials}
                </div>
                <div>
                    <p className="font-semibold text-[#111827]">{member.name}</p>
                    <p className="text-sm text-[#6B7280]">{member.relationship}</p>
                </div>
            </div>
            <button onClick={() => onViewDetails(member)} className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]">
                Xem chi tiết &gt;
            </button>
        </div>
    );
};

const FamilyList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredMembers = FAMILY_MEMBERS.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (member) => {
    setSelectedMember(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  useEffect(() => {
    // const fetchMembers = async () => {
    //   try {
    //     setIsLoading(true);
    //     setError(null);
    //     const responseData = await graphqlRequest({ query: GET_FAMILY_MEMBERS_QUERY });
    //     setFamilyMembers(responseData.familyMembers || []);
    //   } catch (error) {
    //     console.error("Failed to fetch family members:", error);
    //     setError("Không thể tải danh sách thành viên. Vui lòng thử lại.");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchMembers();
  }, []);

  const handleAddMember = async (memberData) => {
    try {
        const responseData = await graphqlRequest({
            query: ADD_FAMILY_MEMBER_MUTATION,
            variables: { input: memberData }
        });
        const newMember = responseData.addFamilyMember;
        // Cập nhật state để hiển thị thành viên mới ngay lập tức
        setFamilyMembers(prevMembers => [...prevMembers, newMember]);
        alert('Thêm thành viên mới thành công!');
    } catch (error) {
        console.error("Failed to add family member:", error);
        alert('Thêm thành viên thất bại. Vui lòng thử lại.');
        // Ném lỗi để modal biết và không tự đóng
        throw error;
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return (
        <div className="text-center py-10 bg-red-50 rounded-lg shadow-sm border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }
    if (filteredMembers.length > 0) {
      return (
        <div className="space-y-4">
          {filteredMembers.map(member => <FamilyMemberCard key={member.id} member={member} onViewDetails={handleViewDetails} />)}
        </div>
      );
    }
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500">Chưa có thành viên nào. Hãy thêm một thành viên mới.</p>
      </div>
    );
  };

  return (
    <>
      <div className="p-6 md:p-8">
        <div className="mb-6 bg-[#FFFFFF] p-4 rounded-lg shadow-sm border border-[#EEEEEE]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                  </div>
                  <input
                      type="text"
                      placeholder="Tìm kiếm theo tên chủ hộ hoặc bệnh nhân..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#D1D5DB] rounded-md focus:ring-[#3B82F6] focus:border-[#3B82F6] transition"
                  />
              </div>
              <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-[#3B82F6] text-[#FFFFFF] rounded-md hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] transition-colors">
                  + Thêm thành viên
              </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => <FamilyMemberCard key={member.id} member={member} onViewDetails={handleViewDetails} />)
          ) : (
            <div className="text-center py-10 bg-[#FFFFFF] rounded-lg shadow-sm border border-[#EEEEEE]">
              <p className="text-[#6B7280]">Không tìm thấy thành viên nào.</p>
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
      <AddMemberModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMember}
      />
    </>
  );
};

export default FamilyList;
