import { Box, Typography, Avatar, Card, CardContent, Link, Grid } from '@mui/material';

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Get health status text and color
 */
const getHealthStatusDisplay = (status) => {
  const configs = {
    normal: { text: 'Stable', color: '#4caf50' },
    monitoring: { text: 'Stable, requires monitoring of arc reactor.', color: '#4caf50' },
    active: { text: 'Under treatment', color: '#f44336' },
  };
  return configs[status] || configs.normal;
};

/**
 * Get initials for avatar
 */
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return parts[parts.length - 2][0] + parts[parts.length - 1][0];
  }
  return name[0];
};

/**
 * FamilyMembersTab component - Simple member list display
 * Displays family members in a list layout
 * @param {Object} props
 * @param {import('../../../../../types/doctorTypes').Member[]} props.members - Array of family members
 * @param {Function} props.onMemberSelect - Callback when member is selected
 */
export default function FamilyMembersTab({ members = [], onMemberSelect }) {
  const handleMemberClick = (memberId) => {
    if (onMemberSelect) {
      onMemberSelect(memberId);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          color: '#2c3e50',
          mb: 4,
        }}
      >
        Family Members ({members.length})
      </Typography>

      {/* Member Cards */}
      {members.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Typography variant="body1">
            Chưa có thành viên nào trong gia đình
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {members.map((member) => {
            const age = calculateAge(member.dateOfBirth);
            const healthStatus = getHealthStatusDisplay(member.healthStatus);

            return (
              <Grid item xs={12} md={6} lg={4} key={member.memberID}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      {/* Avatar */}
                      <Avatar
                        src={member.photoURL}
                        alt={member.fullName}
                        sx={{
                          width: 100,
                          height: 100,
                          fontSize: '2rem',
                          fontWeight: 600,
                          bgcolor: '#e0e0e0',
                          mb: 2,
                        }}
                      >
                        {!member.photoURL && getInitials(member.fullName)}
                      </Avatar>

                      {/* Name */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: '#2c3e50',
                          mb: 0.5,
                        }}
                      >
                        {member.fullName}
                      </Typography>

                      {/* Relationship and Age */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#7f8c8d',
                          mb: 1.5,
                        }}
                      >
                        {member.relationship} - {age} years
                      </Typography>

                      {/* Health Status */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: healthStatus.color,
                          mb: 2,
                          minHeight: 40,
                        }}
                      >
                        {healthStatus.text}
                      </Typography>

                      {/* View Profile Link */}
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => handleMemberClick(member.memberID)}
                        sx={{
                          color: '#2196f3',
                          fontWeight: 500,
                          textDecoration: 'none',
                          cursor: 'pointer',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        View Profile
                      </Link>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
