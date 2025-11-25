import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams, useNavigate } from 'react-router-dom';

import { Box, Alert, Container, Typography, Breadcrumbs, Link,
  Tabs, Tab, CircularProgress, IconButton, 
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import { GET_FAMILY_DETAIL } from '../../graphql/doctorQueries';
import InfoTab from '../../components/Doctor/Family/Detail/InfoTab';
import MembersTab from '../../components/Doctor/Family/Detail/MembersTab';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index) {
    return { id: `family-tab-${index}`, 'aria-controls': `family-tabpanel-${index}` };
}


const DoctorFamiliesDetailPage = () => {
    const { familyId } = useParams();

    const navigate = useNavigate();
    
    const [tabIndex, setTabIndex] = useState(0);
    
    const { data, loading, error } = useQuery(GET_FAMILY_DETAIL, {
        variables: { 
            familyId: parseInt(familyId, 10)
            },
        fetchPolicy: 'cache-and-network'
    });

    const handleBackToFamilies = () => navigate('/doctor/families');

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <IconButton onClick={handleBackToFamilies} sx={{ mb: 2 }}><ArrowBackIcon /></IconButton>
                <Alert severity="error">Không thể tải dữ liệu: {error.message}</Alert>
            </Container>
        );
    }

    const familyDetail = data?.familyDetail || {};
    console.log(familyDetail);
    
    if (!familyDetail.familyID) {
        return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <IconButton onClick={handleBackToFamilies} sx={{ mb: 2 }}><ArrowBackIcon /></IconButton>
            <Alert severity="warning">Không tìm thấy thông tin gia đình này.</Alert>
        </Container>
        );
    }

    return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', pb: 4 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        
        {/* HEADER & BREADCRUMBS */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={handleBackToFamilies}
            sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box>
            <Breadcrumbs aria-label="breadcrumb">
              <Link 
                component="button" 
                variant="body1" 
                onClick={handleBackToFamilies} 
                sx={{ textDecoration: 'none', color: 'primary.main' }}
              >
                Danh sách gia đình
              </Link>
              <Typography color="text.primary">{familyDetail.familyName}</Typography>
            </Breadcrumbs>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
              {familyDetail.familyName}
            </Typography>
          </Box>
        </Box>

        {/* TABS CONTAINER */}
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabIndex} 
              onChange={(e, v) => setTabIndex(v)} 
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Thông tin Gia đình" {...a11yProps(0)} />
              <Tab label={`Thành viên (${familyDetail.members.length})`} {...a11yProps(1)} />
            </Tabs>
          </Box>

          {/* Tab Nội dung */}
          <TabPanel value={tabIndex} index={0}>
            <InfoTab family={familyDetail} />
          </TabPanel>

          <TabPanel value={tabIndex} index={1}>
            <MembersTab 
              members={familyDetail.members} 
              familyId={familyId}
            />
          </TabPanel>
        </Box>

      </Container>
    </Box>
  );
}

export default DoctorFamiliesDetailPage;