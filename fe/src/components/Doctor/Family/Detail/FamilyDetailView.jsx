import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Typography,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  MedicalServices as MedicalServicesIcon,
} from '@mui/icons-material';
import TabPanel from './Tabs/TabPanel';
import FamilyInfoTab from './Tabs/FamilyInfoTab';
import FamilyMembersTab from './Tabs/FamilyMembersTab';
import FamilyMedicalHistoryTab from './Tabs/FamilyMedicalHistoryTab';
import FamilyMedicalBackgroundTab from './Tabs/FamilyMedicalBackgroundTab';

/**
 * FamilyDetailView component - Tabbed interface for family information
 * Displays four tabs: Family Information, Members, Family Medical History, and Family Medical Background
 * @param {Object} props
 * @param {string} props.familyId - Family ID
 * @param {Object} props.family - Family detail object
 * @param {Array} props.members - Array of family members
 * @param {Array} props.familyMedicalHistory - Array of family medical records
 * @param {Object} props.familyBackground - Family background object
 * @param {Function} props.onBack - Callback to return to family list
 * @param {Function} props.onMemberSelect - Callback when member is selected
 * @param {boolean} props.loading - Loading state
 */
export default function FamilyDetailView({
  familyId,
  family,
  members = [],
  familyMedicalHistory = [],
  familyBackground = null,
  onBack,
  onMemberSelect,
  loading = false,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get tab from URL parameter, default to 0
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam ? parseInt(tabParam, 10) : 0;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== initialTab) {
      setSearchParams({ tab: activeTab.toString() });
    }
  }, [activeTab, initialTab, setSearchParams]);

  // Sync state with URL parameter changes
  useEffect(() => {
    const newTab = tabParam ? parseInt(tabParam, 10) : 0;
    if (newTab !== activeTab && newTab >= 0 && newTab <= 3) {
      setActiveTab(newTab);
    }
  }, [tabParam]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddMember = () => {
    // Placeholder for add member functionality (will be implemented in task 5)
    console.log('Add member clicked');
  };

  // Accessibility props for tabs
  const a11yProps = (index) => ({
    id: `family-tab-${index}`,
    'aria-controls': `family-tabpanel-${index}`,
  });

  return (
    <Box>
      {/* Header with breadcrumb and back button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={onBack}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Box sx={{ flex: 1 }}>
          <Breadcrumbs>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Danh sách gia đình
            </Link>
            <Typography color="text.primary" variant="body1">
              {family?.familyName || 'Chi tiết gia đình'}
            </Typography>
          </Breadcrumbs>
          
          {family && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Chủ hộ: {family.headOfFamily?.fullName} • {members.length} thành viên
            </Typography>
          )}
        </Box>
      </Box>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<InfoIcon />}
            iconPosition="start"
            label="Thông tin gia đình"
            {...a11yProps(0)}
          />
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label="Thành viên"
            {...a11yProps(1)}
          />
          {/* <Tab
            icon={<TimelineIcon />}
            iconPosition="start"
            label="Lịch sử khám bệnh"
            {...a11yProps(2)}
          />
          <Tab
            icon={<MedicalServicesIcon />}
            iconPosition="start"
            label="Tiền sử bệnh"
            {...a11yProps(3)}
          /> */}
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ px: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <FamilyInfoTab family={family} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <FamilyMembersTab
              familyId={familyId}
              members={members}
              onMemberSelect={onMemberSelect}
              onAddMember={handleAddMember}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <FamilyMedicalHistoryTab
              familyId={familyId}
              records={familyMedicalHistory}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <FamilyMedicalBackgroundTab
              familyId={familyId}
              background={familyBackground}
            />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}
