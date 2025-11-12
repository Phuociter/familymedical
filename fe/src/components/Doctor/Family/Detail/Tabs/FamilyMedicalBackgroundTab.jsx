import { Box, Typography, Paper } from '@mui/material';

/**
 * FamilyMedicalBackgroundTab component - Family-wide medical background information
 * This is a placeholder that will be fully implemented in task 7
 * @param {Object} props
 * @param {string} props.familyId - Family ID
 * @param {Object} props.background - Family background object
 */
export default function FamilyMedicalBackgroundTab({ familyId, background }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Tiền sử bệnh gia đình
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Nội dung tab sẽ được triển khai trong task 7
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Bệnh di truyền: {background?.hereditaryDiseases?.length || 0}
        </Typography>
        <Typography variant="body2">
          Yếu tố nguy cơ: {background?.riskFactors?.length || 0}
        </Typography>
      </Box>
    </Paper>
  );
}
