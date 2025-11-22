import React, { useState, useEffect } from 'react';
// import { FAMILY_MEMBERS } from '../../constants.js';
import MedicalRecordModal from './MedicalRecordModal.jsx';
import AddMemberModal from './AddMemberModal.jsx';
import MemberAPI from '../../api/MemberAPI.js'


const FamilyMemberCard = ({ member, onViewDetails }) => {

    const formatName = (name) => {
        if (!name) return '';
        return name
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formattedName = formatName(member.fullName);
    const initials = (formattedName || '').split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="bg-[#FFFFFF] p-4 rounded-lg shadow-sm border border-[#EEEEEE] flex items-center justify-between transition-shadow hover:shadow-md">
            <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full ${member.avatarColor} flex items-center justify-center text-[#FFFFFF] font-bold text-xl mr-4`}>
                    {initials}
                </div>
                <div>
                    <p className="font-semibold text-[#111827]">{formattedName}</p>
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
  const token = localStorage.getItem('userToken');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const[loading, setLoading] = useState(null);
  const[members,setMembers] = useState([]);
  const [reload, setReload] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(()=>{
    if(user==null || user.userID==null){
      console.log("không tìm thấy user");
      setLoading(false);
      return;
    }

    const fetchMembers =  async()=>{
      try{
        setLoading(true);
        const response = await MemberAPI.getFamilyByHeadOfFamilyID(user.userID, token);
        const memberData = await MemberAPI.getMemberByFamilyID(response.familyID);
        setMembers(memberData);
        console.log("FamilyID data:",memberData);
      }catch(err){
        setError(err);
        console.log("Failed to fetch family members:", err);
      }finally{
        setLoading(false);
      }
    };
    fetchMembers();
  },[user?.userID,reload]);



  const handleViewDetails = (member) => {
    setSelectedMember(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  const handleAddMember = async (memberData) => {
    try {
      // console.log("memberData",memberData);
        const responseData = await MemberAPI.createMember(memberData, token);
        setFamilyMembers(prevMembers => [...prevMembers, responseData]);
        setReload(prev => !prev);
    } catch (error) {
        console.error("Failed to add family member:", error);
        // alert('Thêm thành viên thất bại. Vui lòng thử lại.');
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
    if (members.length > 0) {
      return (
        <div className="space-y-4">
          {members.map(member => <FamilyMemberCard key={member.memberID} member={member} onViewDetails={handleViewDetails} />)}
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
          {members.length > 0 ? (
            members.map(member => <FamilyMemberCard key={member.membersID} member={member} onViewDetails={handleViewDetails} />)
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
