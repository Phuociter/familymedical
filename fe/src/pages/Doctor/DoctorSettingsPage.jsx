import { useState } from 'react';
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useSelector } from 'react-redux';
import ProfileSettings from '../../components/Doctor/Settings/ProfileSettings';
import PasswordSettings from '../../components/Doctor/Settings/PasswordSettings';

export default function DoctorSettingsPage() {
  const [selectedTab, setSelectedTab] = useState('profile');
  const user = useSelector((state) => state.user.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box>
      {/* Mobile: Tabs at top */}
      {isMobile && (
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
              },
            }}
          >
            <Tab label="Hồ sơ" value="profile" />
            <Tab label="Đổi mật khẩu" value="password" />
          </Tabs>
        </Paper>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
        }}
      >
        {/* Desktop: Sidebar */}
        {!isMobile && (
          <Paper sx={{ width: 320, p: 3, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
              Thông tin tài khoản
            </Typography>

            {/* Menu */}
            <List sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 0 }}>
              <ListItemButton
                selected={selectedTab === 'profile'}
                onClick={() => setSelectedTab('profile')}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: '#1976d2',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#1565c0',
                    },
                  },
                }}
              >
                <ListItemText primary="HỒ SƠ" />
              </ListItemButton>

              <ListItemButton
                selected={selectedTab === 'password'}
                onClick={() => setSelectedTab('password')}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: '#1976d2',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#1565c0',
                    },
                  },
                }}
              >
                <ListItemText primary="ĐỔI MẬT KHẨU" />
              </ListItemButton>
            </List>
          </Paper>
        )}

        {/* Main Content */}
        <Paper
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {selectedTab === 'profile' && <ProfileSettings user={user} />}
          {selectedTab === 'password' && <PasswordSettings userId={user?.userID} />}
        </Paper>
      </Box>
    </Box>
  );
}
