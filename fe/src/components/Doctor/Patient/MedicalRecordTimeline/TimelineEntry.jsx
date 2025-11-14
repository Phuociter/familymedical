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
 * Determine file type from diagnosis or file link
 * @param {string} diagnosis - Diagnosis text
 * @param {string} fileLink - File URL
 * @returns {string} File type
 */
const getFileType = (diagnosis, fileLink) => {
  const diagnosisLower = (diagnosis || '').toLowerCase();
  const fileLinkLower = (fileLink || '').toLowerCase();
  
  if (diagnosisLower.includes('x-quang') || diagnosisLower.includes('xquang') || fileLinkLower.includes('xray') || fileLinkLower.includes('x-ray')) {
    return 'X-Quang';
  }
  if (diagnosisLower.includes('siêu âm') || diagnosisLower.includes('sieu am') || fileLinkLower.includes('ultrasound')) {
    return 'Siêu âm';
  }
  if (diagnosisLower.includes('ct scan') || diagnosisLower.includes('ct') || fileLinkLower.includes('ct')) {
    return 'CT Scan';
  }
  if (diagnosisLower.includes('mri') || fileLinkLower.includes('mri')) {
    return 'MRI';
  }
  if (diagnosisLower.includes('xét nghiệm') || diagnosisLower.includes('xet nghiem') || fileLinkLower.includes('test')) {
    return 'Xét nghiệm';
  }
  
  return 'Hồ sơ khác';
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
  const fileType = getFileType(record.diagnosis, record.fileLink);

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
            
            {/* File Name - Responsive */}
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: 'text.primary',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              <DescriptionIcon sx={{ fontSize: { xs: 16, sm: 18 }, verticalAlign: 'middle', mr: 0.5 }} />
              {fileName}
            </Typography>

            {/* File Type Chip - Responsive */}
            <Chip
              icon={<ImageIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
              label={fileType}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ 
                mt: 0.5,
                fontSize: { xs: '0.688rem', sm: '0.75rem' },
                height: { xs: 20, sm: 24 },
              }}
            />
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
