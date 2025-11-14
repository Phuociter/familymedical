import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  GET_ASSIGNED_FAMILIES,
  GET_FAMILY_MEMBERS,
  GET_MEMBER_MEDICAL_RECORDS,
} from '../../graphql/doctorQueries';
import FamilyList from '../../components/Doctor/Family/List/FamilyList';
import FamilyDetailView from '../../components/Doctor/Family/Detail/FamilyDetailView';
import MedicalRecordList from '../../components/Doctor/MedicalRecordList';
import {
  MOCK_FAMILIES,
  MOCK_MEMBERS,
  MOCK_MEDICAL_RECORDS,
  MOCK_FAMILY_DETAILS,
  MOCK_FAMILY_MEDICAL_HISTORY,
  MOCK_FAMILY_BACKGROUNDS,
} from '../../mocks/familyMockData';

export default function DoctorFamiliesPage() {
  const { familyId, memberId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [useMockData, setUseMockData] = useState(false);

  const { data: familiesData, loading: familiesLoading, error: familiesError } = useQuery(
    GET_ASSIGNED_FAMILIES,
    {
      variables: { search: searchTerm },
      fetchPolicy: 'cache-and-network',
      skip: useMockData,
    }
  );

  const { data: membersData, loading: membersLoading } = useQuery(
    GET_FAMILY_MEMBERS,
    {
      variables: { familyId: familyId },
      skip: !familyId || useMockData,
      fetchPolicy: 'cache-and-network',
    }
  );

  const { data: recordsData, loading: recordsLoading } = useQuery(
    GET_MEMBER_MEDICAL_RECORDS,
    {
      variables: { memberId: memberId },
      skip: !memberId || useMockData,
      fetchPolicy: 'cache-and-network',
    }
  );

  // Auto-switch to mock data if backend returns error
  useEffect(() => {
    if (familiesError) {
      setUseMockData(true);
    }
  }, [familiesError]);

  // Get data from backend or mock
  // Note: Search filtering is handled in FamilyList component for both GraphQL and mock data
  const families = useMockData 
    ? MOCK_FAMILIES
    : (familiesData?.doctorAssignedFamilies || []);

  const members = useMockData && familyId
    ? MOCK_MEMBERS[familyId] || []
    : (membersData?.familyMembers || []);

  const records = useMockData && memberId
    ? MOCK_MEDICAL_RECORDS[memberId] || []
    : (recordsData?.memberMedicalRecords || []);

  // Find selected family and member from data
  const selectedFamily = familyId 
    ? (useMockData ? MOCK_FAMILY_DETAILS[familyId] : families.find(f => f.familyID === familyId))
    : null;

  const selectedMember = memberId
    ? members.find(m => m.memberID === memberId)
    : null;

  // Get family medical history and background for detail view
  const familyMedicalHistory = useMockData && familyId
    ? MOCK_FAMILY_MEDICAL_HISTORY[familyId] || []
    : [];

  const familyBackground = useMockData && familyId
    ? MOCK_FAMILY_BACKGROUNDS[familyId] || null
    : null;

  const handleFamilySelect = (family) => {
    navigate(`/doctor/families/${family.familyID}`);
  };

  const handleMemberSelect = (memberId) => {
    navigate(`/doctor/families/${familyId}/members/${memberId}`);
  };

  return (
    <Box maxWidth={"lg"}>
      {/* Mock Data Indicator */}
      {useMockData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Đang sử dụng dữ liệu demo (Backend chưa kết nối)
        </Alert>
      )}

      {/* Family List View */}
      {!familyId && (
        <FamilyList
          families={families}
          loading={familiesLoading && !useMockData}
          error={!useMockData ? familiesError : null}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFamilySelect={handleFamilySelect}
        />
      )}

      {/* Family Detail View with Tabs */}
      {familyId && !memberId && (
        <FamilyDetailView
          familyId={familyId}
          family={selectedFamily}
          members={members}
          familyMedicalHistory={familyMedicalHistory}
          familyBackground={familyBackground}
          onBack={() => navigate('/doctor/families')}
          onMemberSelect={handleMemberSelect}
          loading={membersLoading && !useMockData}
        />
      )}

      {/* Medical Records View */}
      {memberId && (
        <>
          {/* Breadcrumbs for medical records view */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs>
              <Link
                component="button"
                variant="body1"
                onClick={() => navigate('/doctor/families')}
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  cursor: 'pointer',
                }}
              >
                Danh sách gia đình
              </Link>
              <Link
                component="button"
                variant="body1"
                onClick={() => navigate(`/doctor/families/${familyId}`)}
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  cursor: 'pointer',
                }}
              >
                {selectedFamily?.familyName}
              </Link>
              <Typography color="text.primary">{selectedMember?.fullName}</Typography>
            </Breadcrumbs>
          </Box>
          
          <MedicalRecordList
            member={selectedMember}
            records={records}
            loading={recordsLoading && !useMockData}
            onBack={() => navigate(`/doctor/families/${familyId}`)}
          />
        </>
      )}
    </Box>
  );
}
