import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import InfoTab from './InfoTab';
import MembersTab from './MembersTab';
import { MOCK_FAMILY_DETAILS } from '../../../../mocks/familyMockData';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`family-tabpanel-${index}`}
      aria-labelledby={`family-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `family-tab-${index}`,
    'aria-controls': `family-tabpanel-${index}`,
  };
}

function FamilyDetailView() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(1);
  const [loading, setLoading] = useState(true);
  const [useMockData] = useState(true);

  // Get family data
  const family = useMockData ? MOCK_FAMILY_DETAILS[familyId] : null;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [familyId]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!family) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">Không tìm thấy thông tin gia đình</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', pb: 4 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Header with back button and breadcrumb - Responsive */}
        <Box
          sx={{
            mb: { xs: 2, sm: 3 },
            px: { xs: 2, md: 0 },
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
          }}
        >
          <IconButton
            onClick={() => navigate('/doctor/families')}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'action.hover' },
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              <Link
                component="button"
                variant="body1"
                onClick={() => navigate('/doctor/families')}
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Danh sách gia đình
              </Link>
              <Typography
                color="text.primary"
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {family.familyName}
              </Typography>
            </Breadcrumbs>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                mt: 1,
                fontWeight: 600,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {family.familyName}
            </Typography>
          </Box>
        </Box>

        {/* Tabs - Responsive */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            px: { xs: 0, sm: 0 },
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="family detail tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  minHeight: { xs: 48, sm: 56 },
                },
              }}
            >
              <Tab label="Thông tin Gia đình" {...a11yProps(0)} />
              <Tab label="Thành viên" {...a11yProps(1)} />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <InfoTab family={family} />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <MembersTab familyId={familyId} members={family.members} />
          </TabPanel>
        </Box>
      </Container>
    </Box>
  );
}

export default FamilyDetailView;