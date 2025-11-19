import { useState } from 'react';
import { Box, Paper, Stack, Grid, CircularProgress } from '@mui/material';
import FamilySearchAndFilter from './FamilySearchAndFilter';
import FamilyResultsCount from './FamilyResultsCount';
import FamilyErrorState from './FamilyErrorState';
import FamilyEmptyState from './FamilyEmptyState';
import FamilyCard from './FamilyCard';
import FamilyCardSkeleton from './FamilyCardSkeleton';

const FamilyList = ({ families, loading, error, searchTerm, onSearchChange, onFamilySelect }) => {
  const [statusFilter, setStatusFilter] = useState('');

  // Filter families based on search and filters
  const filteredFamilies = families.filter(family => {
    // Search filter - matches family name, household head name, or address
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
            onSearchChange={onSearchChange}
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
                onSelect={onFamilySelect}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FamilyList; 