import { Box, Card, Typography, Chip } from '@mui/material';
import {
  Favorite as HeartIcon,
  Bloodtype as BloodIcon,
  FitnessCenter as FitnessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as StableIcon,
} from '@mui/icons-material';

/**
 * Get indicator display information
 * @param {'blood_pressure'|'blood_sugar'|'bmi'|'heart_rate'|'temperature'|'weight'|'height'} indicatorType
 * @returns {{icon: JSX.Element, label: string}}
 */
const getIndicatorInfo = (indicatorType) => {
  const indicatorMap = {
    blood_pressure: { icon: <HeartIcon />, label: 'Huyết áp' },
    blood_sugar: { icon: <BloodIcon />, label: 'Đường huyết' },
    bmi: { icon: <FitnessIcon />, label: 'BMI' },
    heart_rate: { icon: <HeartIcon />, label: 'Nhịp tim' },
    temperature: { icon: <BloodIcon />, label: 'Nhiệt độ' },
    weight: { icon: <FitnessIcon />, label: 'Cân nặng' },
    height: { icon: <FitnessIcon />, label: 'Chiều cao' },
  };
  return indicatorMap[indicatorType] || { icon: <HeartIcon />, label: 'Chỉ số' };
};

/**
 * Get status color and background
 * @param {'normal'|'warning'|'critical'} status
 * @returns {{color: string, bgcolor: string, borderColor: string}}
 */
const getStatusColors = (status) => {
  const colorMap = {
    normal: {
      color: 'success.main',
      bgcolor: 'success.lighter',
      borderColor: 'success.main',
    },
    warning: {
      color: 'warning.main',
      bgcolor: 'warning.lighter',
      borderColor: 'warning.main',
    },
    critical: {
      color: 'error.main',
      bgcolor: 'error.lighter',
      borderColor: 'error.main',
    },
  };
  return colorMap[status] || colorMap.normal;
};

/**
 * Get status label in Vietnamese
 * @param {'normal'|'warning'|'critical'} status
 * @returns {string}
 */
const getStatusLabel = (status) => {
  const labelMap = {
    normal: 'Bình thường',
    warning: 'Cảnh báo',
    critical: 'Nguy hiểm',
  };
  return labelMap[status] || 'Bình thường';
};

/**
 * Format indicator value for display
 * @param {number|string} value
 * @param {string} unit
 * @returns {string}
 */
const formatValue = (value, unit) => {
  if (typeof value === 'string') {
    return `${value} ${unit}`;
  }
  return `${value} ${unit}`;
};

/**
 * HealthIndicatorCard Component
 * Displays a single health indicator with color-coded status
 * 
 * Requirements: 4.3
 * 
 * @component
 * @param {Object} props
 * @param {import('../../../types/doctorTypes').HealthIndicator} props.indicator - Health indicator object
 * @param {boolean} [props.showTrend=false] - Whether to show trend indicator
 * @param {string} [props.trend] - Trend direction: 'up', 'down', 'stable'
 */
export default function HealthIndicatorCard({ indicator, showTrend = false, trend }) {
  const indicatorInfo = getIndicatorInfo(indicator.indicatorType);
  const statusColors = getStatusColors(indicator.status);
  const statusLabel = getStatusLabel(indicator.status);

  // Determine trend icon
  const getTrendIcon = () => {
    if (!showTrend || !trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" sx={{ color: 'error.main' }} />;
      case 'down':
        return <TrendingDownIcon fontSize="small" sx={{ color: 'success.main' }} />;
      case 'stable':
        return <StableIcon fontSize="small" sx={{ color: 'text.secondary' }} />;
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        p: 2,
        borderLeft: 4,
        borderColor: statusColors.borderColor,
        bgcolor: statusColors.bgcolor,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Header with Icon and Label */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              color: statusColors.color,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {indicatorInfo.icon}
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
          >
            {indicatorInfo.label}
          </Typography>
        </Box>
        
        {showTrend && getTrendIcon()}
      </Box>

      {/* Value */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: statusColors.color,
          mb: 1,
        }}
      >
        {formatValue(indicator.value, indicator.unit)}
      </Typography>

      {/* Status and Normal Range */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Chip
          label={statusLabel}
          size="small"
          sx={{
            bgcolor: statusColors.color,
            color: 'white',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
        
        {indicator.normalRange && (
          <Typography variant="caption" color="text.secondary">
            Bình thường: {indicator.normalRange.min}-{indicator.normalRange.max} {indicator.unit}
          </Typography>
        )}
      </Box>

      {/* Measurement Date */}
      {indicator.measurementDate && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1 }}
        >
          Đo ngày: {new Date(indicator.measurementDate).toLocaleDateString('vi-VN')}
        </Typography>
      )}
    </Card>
  );
}
