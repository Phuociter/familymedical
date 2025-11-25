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
 * Filter records by file type
 * @param {Array} records - Medical records
 * @param {string} fileType - File type filter
 * @returns {Array} Filtered records
 */
const filterByFileType = (records, fileType) => {
  if (!fileType || fileType === 'all') return records;
  
  return records.filter((record) => record.fileType === fileType);
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
    fileType: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Apply filters
  const filteredRecords = useMemo(() => {
    let filtered = [...records];
    
    // Filter by date range
    filtered = filterByDateRange(filtered, filters.dateFrom, filters.dateTo);
    
    // Filter by file type
    filtered = filterByFileType(filtered, filters.fileType);
    
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
      {/* Filters - Responsive */}
      <TimelineFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Results Count - Responsive */}
      <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
        >
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

          {/* Pagination - Responsive */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: { xs: 3, sm: 4 },
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size={{ xs: 'medium', sm: 'large' }}
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                    minWidth: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
