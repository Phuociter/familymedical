import { Box, Typography, Paper } from '@mui/material';

/**
 * FamilyMedicalHistoryTab component - Timeline of all family medical events
 * This is a placeholder that will be fully implemented in task 6
 * @param {Object} props
 * @param {string} props.familyId - Family ID
 * @param {Array} props.records - Array of family medical records
 */
export default function FamilyMedicalHistoryTab({ familyId, records }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Lịch sử khám bệnh gia đình
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Nội dung tab sẽ được triển khai trong task 6
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Số bản ghi: {records?.length || 0}
        </Typography>
      </Box>
    </Paper>
  );
}
