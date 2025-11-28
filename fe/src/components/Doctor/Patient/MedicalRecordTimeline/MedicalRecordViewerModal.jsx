import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

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
  
  return typeMap[fileType] || fileType || 'Hồ sơ khác';
};

/**
 * MedicalRecordViewerModal Component
 * Modal dialog để xem file hồ sơ bệnh án trong iframe
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.fileLink - URL to the file
 * @param {string} props.fileName - Name of the file
 * @param {string} props.fileType - Type of the file
 */
export default function MedicalRecordViewerModal({
  open,
  onClose,
  fileLink,
  fileName = 'Hồ sơ bệnh án',
  fileType,
}) {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Reset loading state when fileLink changes
  useEffect(() => {
    if (open && fileLink) {
      setLoading(true);
      setError(null);
      setIframeKey((prev) => prev + 1); // Force iframe reload
    }
  }, [open, fileLink]);

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Không thể tải file. Vui lòng thử tải xuống để xem.');
  };

  const handleDownload = async () => {
    if (!fileLink || downloading) return;

    setDownloading(true);
    try {
      // Fetch blob để buộc trình duyệt tải xuống thay vì mở tab mới
      const response = await fetch(fileLink, {
        method: 'GET',
        headers: {
          // Thêm headers nếu API yêu cầu authentication
        }
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || fileLink.split('/').pop() || 'downloaded-file';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed, falling back to open new tab", error);
      // Fallback: Mở tab mới nếu fetch thất bại (ví dụ do CORS)
      window.open(fileLink, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (fileLink) {
      window.open(fileLink, '_blank');
    }
  };

  // Check if file is viewable in iframe (PDF, images, etc.)
  const isViewable = fileLink && (
    fileLink.toLowerCase().endsWith('.pdf') ||
    fileLink.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
    fileLink.toLowerCase().includes('pdf') ||
    fileType === 'X_RAY' ||
    fileType === 'ULTRASOUND' ||
    fileType === 'CT_SCAN' ||
    fileType === 'MRI_SCAN' ||
    fileType === 'MAMMOGRAPHY'
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: 900,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
          <Typography variant="h6" noWrap>
            {fileName}
          </Typography>
          {fileType && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Loại hồ sơ: {getFileTypeLabel(fileType)}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          {fileLink && (
            <>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={downloading}
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                {downloading ? 'Đang tải...' : 'Tải xuống'}
              </Button>
              <Button
                size="small"
                startIcon={<OpenInNewIcon />}
                onClick={handleOpenInNewTab}
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Mở tab mới
              </Button>
            </>
          )}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {error ? (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="error">{error}</Alert>
            {fileLink && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={downloading}
                sx={{ alignSelf: 'flex-start' }}
              >
                {downloading ? 'Đang tải...' : 'Tải xuống để xem'}
              </Button>
            )}
          </Box>
        ) : isViewable ? (
          <Box
            component="iframe"
            src={fileLink}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            key={iframeKey}
            sx={{
              flex: 1,
              width: '100%',
              border: 'none',
              minHeight: 400,
            }}
            title={fileName}
          />
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Loại file này không thể xem trực tiếp trong trình duyệt.
            </Alert>
            {fileLink && (
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  {downloading ? 'Đang tải...' : 'Tải xuống'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  onClick={handleOpenInNewTab}
                >
                  Mở trong tab mới
                </Button>
              </Stack>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

