import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';

/**
 * Get health status color and label
 * @param {'normal'|'monitoring'|'active'} status
 * @returns {{color: string, label: string}}
 */
const getHealthStatusConfig = (status) => {
  const configs = {
    normal: { color: 'success', label: 'Bình thường' },
    monitoring: { color: 'warning', label: 'Theo dõi' },
    active: { color: 'error', label: 'Đang điều trị' },
  };
  return configs[status] || configs.normal;
};

/**
 * Calculate age from date of birth
 * @param {string} dateOfBirth - ISO date string
 * @returns {number} Age in years
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
 * Get avatar color based on gender
 * @param {'Nam'|'Nữ'} gender
 * @returns {string}
 */
const getAvatarColor = (gender) => {
  return gender === 'Nam' ? '#1976d2' : '#d81b60';
};

/**
 * MemberCard component - Display individual family member information
 * Shows avatar, name, age, gender, relationship, and health status badge
 * @param {Object} props
 * @param {import('../../../../../types/doctorTypes').Member} props.member - Member data
 * @param {Function} props.onClick - Callback when card is clicked
 */
export default function MemberCard({ member, onClick }) {
  const age = calculateAge(member.dateOfBirth);
  const healthStatusConfig = getHealthStatusConfig(member.healthStatus);
  const avatarColor = getAvatarColor(member.gender);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[parts.length - 2][0] + parts[parts.length - 1][0];
    }
    return name[0];
  };

  const handleClick = () => {
    if (onClick) {
      onClick(member.memberID);
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        {/* Avatar and Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: avatarColor,
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            {member.photoURL ? (
              <img src={member.photoURL} alt={member.fullName} />
            ) : (
              getInitials(member.fullName)
            )}
          </Avatar>
          <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {member.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {age} tuổi • {member.gender}
            </Typography>
          </Box>
        </Box>

        {/* Relationship */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <PersonIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {member.relationship}
          </Typography>
        </Box>

        {/* Health Status Badge */}
        <Box sx={{ mb: 1.5 }}>
          <Chip
            label={healthStatusConfig.label}
            color={healthStatusConfig.color}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        {/* Recent Visit Count */}
        {member.recentVisitCount !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarMonthIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {member.recentVisitCount} lượt khám gần đây
            </Typography>
          </Box>
        )}

        {/* Last Visit Date */}
        {member.lastVisitDate && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Khám gần nhất: {new Date(member.lastVisitDate).toLocaleDateString('vi-VN')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
