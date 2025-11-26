import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Stack, Grid } from '@mui/material';

import { 
  FamilyCardSkeleton, 
  FamilyResultsCount, 
  FamilySearchAndFilter,
  FamilyEmptyState,
  FamilyErrorState,
  FamilyCard
} from '../../components/Doctor/Family/List/';

import useDebounce from '../../hooks/useDebounce';
import { GET_ASSIGNED_FAMILIES } from '../../graphql/doctorQueries';

const DoctorFamiliesPage = () => {
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, loading, error } = useQuery(
    GET_ASSIGNED_FAMILIES,
    {
      variables: { search: debouncedSearch },
      fetchPolicy: 'cache-and-network', 
    }
  );
  const [statusFilter, setStatusFilter] = useState('');
  const families = data?.getDoctorAssignedFamilies || []
  console.log(families);

  const filteredFamilies = families.filter(family => {
    const matchesSearch = !searchTerm || 
      family.familyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.headOfFamily?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.familyAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter - matches exact status value
    const matchesStatus = !statusFilter || family.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = statusFilter || searchTerm;

  if (error) {
    return <FamilyErrorState error={error} />;
  }

  return (
    <Box>
      {/* Search & Filter Section */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack spacing={2}>          
          <FamilySearchAndFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          {!loading && (
            <FamilyResultsCount
              filteredCount={filteredFamilies.length}
              totalCount={families.length}
              hasFilters={hasActiveFilters}
            />
          )}
        </Stack>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{
            mx: { xs: -1, sm: 0 },
          }}
        >
          {[...Array(6)].map((_, index) => (
            <Grid 
              key={index} 
              size={{ xs: 12, sm: 6, md: 4 }}
            >
              <FamilyCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && filteredFamilies.length === 0 && (
        <FamilyEmptyState hasFilters={hasActiveFilters} />
      )}

      {/* Family Grid */}
      {!loading && filteredFamilies.length > 0 && (
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{
            // Ensure proper spacing on mobile
            mx: { xs: -1, sm: 0 },
          }}
        >
          {filteredFamilies.map((family) => (
            <Grid 
              key={family.familyID} 
              size={{ xs: 12, sm: 6, md: 4 }}
            >
              <FamilyCard
                family={family}
                onSelect={(family) => navigate(`/doctor/families/${family.familyID}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default DoctorFamiliesPage;