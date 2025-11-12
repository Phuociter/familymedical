import React, { useState } from 'react';
import { useQuery } from "@apollo/client/react";
import { GET_ASSIGNED_FAMILIES, GET_FAMILY_MEMBERS, GET_MEMBER_MEDICAL_RECORDS } from '../graphql/doctorQueries';
import FamilyList from './FamilyList';
import MemberList from './MemberList';
import MedicalRecordList from './MedicalRecordList';

const DoctorManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Query danh sách gia đình được phân công
  const { data: familiesData, loading: familiesLoading, error: familiesError } = useQuery(
    GET_ASSIGNED_FAMILIES,
    {
      variables: { search: searchTerm },
      fetchPolicy: 'cache-and-network'
    }
  );

  // Query danh sách thành viên của gia đình được chọn
  const { data: membersData, loading: membersLoading } = useQuery(
    GET_FAMILY_MEMBERS,
    {
      variables: { familyId: selectedFamily?.familyID },
      skip: !selectedFamily,
      fetchPolicy: 'cache-and-network'
    }
  );

  // Query hồ sơ bệnh án của thành viên được chọn
  const { data: recordsData, loading: recordsLoading } = useQuery(
    GET_MEMBER_MEDICAL_RECORDS,
    {
      variables: { memberId: selectedMember?.memberID },
      skip: !selectedMember,
      fetchPolicy: 'cache-and-network'
    }
  );

  const handleFamilySelect = (family) => {
    setSelectedFamily(family);
    setSelectedMember(null);
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
  };

  const handleBack = () => {
    if (selectedMember) {
      setSelectedMember(null);
    } else if (selectedFamily) {
      setSelectedFamily(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Gia đình</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin gia đình và hồ sơ bệnh án</p>
        </div>

        {/* Navigation Breadcrumb */}
        {(selectedFamily || selectedMember) && (
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <span>←</span>
              <span>Quay lại</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {!selectedFamily && (
            <FamilyList
              families={familiesData?.doctorAssignedFamilies || []}
              loading={familiesLoading}
              error={familiesError}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onFamilySelect={handleFamilySelect}
            />
          )}

          {selectedFamily && !selectedMember && (
            <MemberList
              family={selectedFamily}
              members={membersData?.familyMembers || []}
              loading={membersLoading}
              onMemberSelect={handleMemberSelect}
            />
          )}

          {selectedMember && (
            <MedicalRecordList
              member={selectedMember}
              records={recordsData?.memberMedicalRecords || []}
              loading={recordsLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorManagementPage;