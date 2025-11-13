import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Pagination,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import TimelineEntry from './TimelineEntry';
import TimelineFilters from './TimelineFilters';

/**
 * Filter records by date range
 * @param {Array} records - Medical records
 * @param {string} dateFrom - Start date
 * @param {string} dateTo - End date
 * @returns {Array} Filtered records
 */
const filterByDateRange = (records, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return records;

  return records.filter((record) => {
    const recordDate = new Date(record.recordDate);
    
    if (dateFrom && dateTo) {
      return recordDate >= new Date(dateFrom) && recordDate <= new Date(dateTo);
    } else if (dateFrom) {
      return recordDate >= new Date(dateFrom);
    } else if (dateTo) {
      return recordDate <= new Date(dateTo);
    }
    
    return true;
  });
};

/**
 * Filter records by disease type (simplified matching)
 * @param {Array} records - Medical records
 * @param {string} diseaseType - Disease type filter
 * @returns {Array} Filtered records
 */
const filterByDiseaseType = (records, diseaseType) => {
  if (!diseaseType || diseaseType === 'all') return records;

  const diseaseKeywords = {
    cardiovascular: ['tim', 'mạch', 'huyết áp', 'cao huyết áp', 'tăng huyết áp'],
    respiratory: ['phổi', 'hô hấp', 'ho', 'viêm phế quản', 'hen', 'suyễn'],
    digestive: ['dạ dày', 'ruột', 'tiêu hóa', 'gan', 'đại tràng'],
    musculoskeletal: ['xương', 'khớp', 'cơ', 'thoái hóa', 'viêm khớp', 'gãy'],
    endocrine: ['đái tháo đường', 'tuyến giáp', 'nội tiết', 'hormone'],
    infectious: ['nhiễm trùng', 'viêm', 'cảm', 'sốt', 'vi khuẩn', 'virus'],
  };

  const keywords = diseaseKeywords[diseaseType] || [];
  
  return records.filter((record) => {
    const diagnosis = record.diagnosis.toLowerCase();
    const symptoms = record.symptoms.toLowerCase();
    
    return keywords.some(keyword => 
      diagnosis.includes(keyword) || symptoms.includes(keyword)
    );
  });
};

/**
 * MedicalRecordTimeline Component
 * Displays patient medical history in chronological timeline
 * 
 * Requirements: 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * @component
 * @param {Object} props
 * @param {string} props.memberId - Patient member ID
 * @param {Array<import('../../../../types/doctorTypes').MedicalRecord>} props.records - Medical records
 * @param {boolean} props.loading - Loading state
 * @param {Error} props.error - Error object
 * @param {Function} props.onRecordClick - Callback when record is clicked (optional)
 */
export default function MedicalRecordTimeline({
  memberId,
  records = [],
  loading = false,
  error = null,
  onRecordClick,
}) {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    diseaseType: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Apply filters
  const filteredRecords = useMemo(() => {
    let filtered = [...records];
    
    // Filter by date range
    filtered = filterByDateRange(filtered, filters.dateFrom, filters.dateTo);
    
    // Filter by disease type
    filtered = filterByDiseaseType(filtered, filters.diseaseType);
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
    
    return filtered;
  }, [records, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (_event, page) => {
    setCurrentPage(page);
    // Scroll to top of timeline
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Không thể tải hồ sơ bệnh án. Vui lòng thử lại sau.
      </Alert>
    );
  }

  // Empty state
  if (!records || records.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
        }}
      >
        <EventNoteIcon
          sx={{
            fontSize: 64,
            color: 'text.secondary',
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Chưa có hồ sơ bệnh án
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bệnh nhân chưa có lịch sử khám bệnh
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <TimelineFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Hiển thị {filteredRecords.length} hồ sơ bệnh án
          {filteredRecords.length !== records.length && ` (từ tổng số ${records.length})`}
        </Typography>
      </Box>

      {/* Timeline */}
      {filteredRecords.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Không tìm thấy hồ sơ bệnh án phù hợp với bộ lọc
        </Alert>
      ) : (
        <>
          <Box sx={{ position: 'relative' }}>
            {paginatedRecords.map((record, index) => (
              <TimelineEntry
                key={record.recordID}
                record={record}
                isLast={index === paginatedRecords.length - 1}
                onClick={onRecordClick ? () => onRecordClick(record.recordID) : undefined}
              />
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
