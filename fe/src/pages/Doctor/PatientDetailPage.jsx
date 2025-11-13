import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { GET_PATIENT_DETAIL } from '../../graphql/doctorQueries';
import {
  MOCK_PATIENT_DETAILS,
  MOCK_FAMILY_DETAILS,
  MOCK_MEDICAL_RECORDS_ENHANCED,
} from '../../mocks/familyMockData';
import PatientHeader from '../../components/Doctor/Patient/PatientHeader';
import MedicalRecordTimeline from '../../components/Doctor/Patient/MedicalRecordTimeline';

/**
 * PatientDetailPage - Comprehensive patient information with tabbed interface
 * Displays patient details with six tabs: Overview, Medical Records, Prescriptions, Tests, Images, Background
 * 
 * Requirements: 4.1, 4.2, 14.2, 14.3
 * 
 * @component
 */
export default function PatientDetailPage() {
  const { familyId, memberId } = useParams();
  const navigate = useNavigate();
  
  const [useMockData, setUseMockData] = useState(false);

  // Query patient details
  const { data: patientData, loading, error } = useQuery(GET_PATIENT_DETAIL, {
    variables: { memberId },
    skip: useMockData || !memberId,
    fetchPolicy: 'cache-and-network',
  });

  // Auto-switch to mock data if backend returns error
  useEffect(() => {
    if (error) {
      setUseMockData(true);
    }
  }, [error]);

  // Get patient data from backend or mock
  const patient = useMockData
    ? MOCK_PATIENT_DETAILS[memberId]
    : patientData?.patientDetail;

  // Get family data for breadcrumb
  const family = useMockData
    ? MOCK_FAMILY_DETAILS[familyId]
    : null;

  // Get medical records for patient
  const medicalRecords = useMockData
    ? MOCK_MEDICAL_RECORDS_ENHANCED[memberId] || []
    : [];



  if (loading && !useMockData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">
          Không tìm thấy thông tin bệnh nhân
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Mock Data Indicator */}
      {useMockData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Đang sử dụng dữ liệu demo (Backend chưa kết nối)
        </Alert>
      )}

      {/* Header with breadcrumb and back button */}
      <Box sx={{ mb: 3, px: { xs: 2, md: 3 }, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate(`/doctor/families/${familyId}`)}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Box sx={{ flex: 1 }}>
          <Breadcrumbs>
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate('/doctor/families')}
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
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
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {family?.familyName || 'Gia đình'}
            </Link>
            <Typography color="text.primary" variant="body1">
              {patient.fullName}
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {patient.relationship} • {patient.gender} • {patient.dateOfBirth ? new Date(patient.dateOfBirth).getFullYear() : ''}
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area - 2 Column Layout */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column: Patient Info + Doctor Notes */}
          <Box
            sx={{
              width: { xs: '100%', md: '350px' },
              flexShrink: 0,
            }}
          >
            {/* Patient Info Card */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: 1,
                overflow: 'hidden',
                mb: 3,
              }}
            >
              <Box sx={{ p: 3 }}>
                <PatientHeader patient={patient} />
              </Box>
            </Box>

            {/* Doctor Notes Card */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: 1,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Ghi chú của bác sĩ
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    minHeight: 120,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {patient.notes || 'Chưa có ghi chú nào'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Column: Medical Records */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: 1,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Hồ sơ bệnh án
                </Typography>
                <MedicalRecordTimeline
                  memberId={memberId}
                  records={medicalRecords}
                  loading={false}
                  error={null}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
