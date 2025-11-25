import {
  Box,
  Card,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CalendarMonth as CalendarIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

/**
 * Format date to Vietnamese format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Extract file name from URL or path
 * @param {string} fileLink - File URL or path
 * @returns {string} File name
 */
const getFileName = (fileLink) => {
  if (!fileLink) return 'Không có tên file';
  const parts = fileLink.split('/');
  return parts[parts.length - 1] || 'File bệnh án';
};

/**
 * Get file type label from FileType enum
 * @param {string} fileType - FileType enum value
 * @returns {string} Vietnamese label
 */
const getFileTypeLabel = (fileType) => {
  const typeMap = {
    X_RAY: 'X-Quang',
    ULTRASOUND: 'Siêu âm',
    CT_SCAN: 'CT Scan',
    MRI_SCAN: 'MRI',
    MAMMOGRAPHY: 'Chụp nhũ ảnh',
    PET_CT: 'PET-CT',
    BLOOD_TEST: 'Xét nghiệm máu',
    URINE_TEST: 'Xét nghiệm nước tiểu',
    BLOOD_CHEMISTRY: 'Sinh hóa máu',
    IMMUNOHEMATOLOGY: 'Huyết học miễn dịch',
    MICROBIOLOGY_TEST: 'Xét nghiệm vi sinh',
    GENETIC_TEST: 'Xét nghiệm gen',
    COVID19_PCR_ANTIGEN: 'Xét nghiệm COVID-19',
    PATHOLOGY: 'Giải phẫu bệnh',
    ECG: 'Điện tâm đồ',
    EEG: 'Điện não đồ',
    EMG: 'Điện cơ đồ',
    SPIROMETRY: 'Đo chức năng hô hấp',
    HOLTER_ECG: 'Holter điện tâm đồ',
    HOLTER_BP: 'Holter huyết áp',
    MEDICAL_EXAMINATION: 'Khám bệnh',
    PRESCRIPTION: 'Đơn thuốc',
    ADMISSION_FORM: 'Giấy nhập viện',
    DISCHARGE_FORM: 'Giấy xuất viện',
    REFERRAL_FORM: 'Giấy chuyển viện',
    VACCINATION_RECORD: 'Phiếu tiêm chủng',
    SURGERY_REPORT: 'Báo cáo phẫu thuật',
    TREATMENT_PLAN: 'Kế hoạch điều trị',
    DENTAL_RECORD: 'Hồ sơ nha khoa',
    OBSTETRIC_ULTRASOUND: 'Siêu âm sản khoa',
    VISION_TEST: 'Khám mắt',
    HEARING_TEST: 'Khám tai',
    ALLERGY_TEST: 'Test dị ứng',
  };
  
  return typeMap[fileType] || 'Hồ sơ khác';
};

/**
 * TimelineEntry Component
 * Simplified display showing only file name and type
 * 
 * Requirements: 5.1, 5.4
 * 
 * @component
 * @param {Object} props
 * @param {import('../../../../types/doctorTypes').MedicalRecord} props.record - Medical record data
 * @param {boolean} props.isLast - Whether this is the last entry
 */
export default function TimelineEntry({ record, isLast = false }) {
  const fileName = getFileName(record.fileLink);
  const fileTypeLabel = getFileTypeLabel(record.fileType);

  return (
    <Box sx={{ display: 'flex', position: 'relative', pb: isLast ? 0 : { xs: 2, sm: 2.5, md: 3 } }}>
      {/* Timeline Line and Dot - Responsive */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mr: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Dot - Responsive Size */}
        <Box
          sx={{
            width: { xs: 10, sm: 12 },
            height: { xs: 10, sm: 12 },
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            border: '2px solid',
            borderColor: 'primary.light',
            zIndex: 1,
            flexShrink: 0,
          }}
        />
        {/* Vertical Line */}
        {!isLast && (
          <Box
            sx={{
              width: 2,
              flex: 1,
              backgroundColor: 'grey.300',
              mt: 1,
            }}
          />
        )}
      </Box>

      {/* Content Card - Simplified - Responsive */}
      <Card
        sx={{
          flex: 1,
          p: { xs: 1.5, sm: 2 },
          boxShadow: 1,
          '&:hover': {
            boxShadow: 2,
          },
          transition: 'box-shadow 0.2s',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {/* Left: File Info */}
          <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
            {/* Date - Responsive */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5, 
                mb: 0.5,
                fontSize: { xs: '0.75rem', sm: '0.813rem' },
              }}
            >
              <CalendarIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
              {formatDate(record.recordDate)}
            </Typography>
            
            {/* File Type Chip - Responsive */}
            <Chip
              icon={<ImageIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
              label={fileTypeLabel}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ 
                mb: 0.5,
                fontSize: { xs: '0.688rem', sm: '0.75rem' },
                height: { xs: 20, sm: 24 },
              }}
            />

            {/* Description - Responsive */}
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                mb: 0.5,
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
              }}
            >
              {record.description || 'Không có mô tả'}
            </Typography>

            {/* Doctor Name - Responsive */}
            {record.Doctor && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  fontSize: { xs: '0.75rem', sm: '0.813rem' },
                }}
              >
                Bác sĩ: {record.Doctor.fullName}
              </Typography>
            )}
          </Box>

          {/* Right: View Button - Touch-Friendly */}
          {record.fileLink && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DescriptionIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
              href={record.fileLink}
              target="_blank"
              sx={{ 
                textTransform: 'none', 
                flexShrink: 0,
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                minHeight: { xs: 36, sm: 32 },
                px: { xs: 2, sm: 1.5 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Xem
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
}
