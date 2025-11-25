import { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';

/**
 * TimelineFilters Component
 * Provides filtering options for medical record timeline
 * 
 * Requirements: 5.2, 5.3
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Object} props.filters - Current filter values
 */
export default function TimelineFilters({ onFilterChange, filters }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fileTypes = [
    { value: 'all', label: 'Tất cả' },
    { value: 'X_RAY', label: 'X-Quang' },
    { value: 'ULTRASOUND', label: 'Siêu âm' },
    { value: 'CT_SCAN', label: 'CT Scan' },
    { value: 'MRI_SCAN', label: 'MRI' },
    { value: 'BLOOD_TEST', label: 'Xét nghiệm máu' },
    { value: 'URINE_TEST', label: 'Xét nghiệm nước tiểu' },
    { value: 'ECG', label: 'Điện tâm đồ' },
    { value: 'MEDICAL_EXAMINATION', label: 'Khám bệnh' },
    { value: 'PRESCRIPTION', label: 'Đơn thuốc' },
    { value: 'VACCINATION_RECORD', label: 'Phiếu tiêm chủng' },
  ];

  const handleDateFromChange = (e) => {
    onFilterChange({ ...filters, dateFrom: e.target.value });
  };

  const handleDateToChange = (e) => {
    onFilterChange({ ...filters, dateTo: e.target.value });
  };

  const handleFileTypeChange = (e) => {
    onFilterChange({ ...filters, fileType: e.target.value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      dateFrom: '',
      dateTo: '',
      fileType: 'all',
    });
  };

  const hasActiveFilters =
    filters.dateFrom || filters.dateTo || filters.fileType !== 'all';

  return (
    <Box
      sx={{
        p: 2,
        mb: 3,
        backgroundColor: 'grey.50',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Filter Icon */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <FilterIcon />
          </Box>
        )}

        {/* Date From */}
        <TextField
          label="Từ ngày"
          type="date"
          size="small"
          value={filters.dateFrom || ''}
          onChange={handleDateFromChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            minWidth: { sm: 180 },
            backgroundColor: 'white',
          }}
        />

        {/* Date To */}
        <TextField
          label="Đến ngày"
          type="date"
          size="small"
          value={filters.dateTo || ''}
          onChange={handleDateToChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            minWidth: { sm: 180 },
            backgroundColor: 'white',
          }}
        />

        {/* File Type */}
        <TextField
          select
          label="Loại hồ sơ"
          size="small"
          value={filters.fileType || 'all'}
          onChange={handleFileTypeChange}
          sx={{
            minWidth: { sm: 200 },
            backgroundColor: 'white',
          }}
        >
          {fileTypes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            sx={{
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </Stack>
    </Box>
  );
}
