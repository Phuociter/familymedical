import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Chip, Avatar, IconButton } from '@mui/material';
import { Visibility as VisibilityIcon, Person as PersonIcon } from '@mui/icons-material';

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const MemberCard = ({ member, onViewDetails }) => {
  const age = calculateAge(member.dateOfBirth);

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #e0e0e0',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
      }}
      onClick={() => onViewDetails(member.memberID)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
            <PersonIcon sx={{ fontSize: 32 }} />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h7" lineHeight="2" sx={{ mb: 0.5, fontWeight: 600 }}>
              {member.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {member.relationship}
              {age && ` • ${age} tuổi`}
              {member.gender && ` • ${member.gender}`}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

function MembersTab({ familyId, members }) {
  const navigate = useNavigate();

  const handleViewDetails = (memberId) => {
    navigate(`/doctor/families/${familyId}/members/${memberId}`);
  };

  if (!members || members.length === 0) {
    return (
      <Box sx={{ px: 2, textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Chưa có thành viên nào trong gia đình này
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Danh sách thành viên ({members.length})
      </Typography>

      <Grid container spacing={3}>
        {members.map((member) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={member.memberID}>
            <MemberCard member={member} onViewDetails={handleViewDetails} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

MembersTab.propTypes = {
  familyId: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(
    PropTypes.shape({
      memberID: PropTypes.string.isRequired,
      fullName: PropTypes.string.isRequired,
      relationship: PropTypes.string,
      dateOfBirth: PropTypes.string,
      gender: PropTypes.string,
      phoneNumber: PropTypes.string,
      email: PropTypes.string,
      healthStatus: PropTypes.string,
      recentVisitCount: PropTypes.number,
      lastVisitDate: PropTypes.string,
    })
  ).isRequired,
};

export default MembersTab;
