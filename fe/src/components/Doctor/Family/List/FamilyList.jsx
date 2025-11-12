import { useState } from 'react';
import { Box, Paper, Stack } from '@mui/material';
import FamilySearchBar from './FamilySearchBar';
import FamilySearchAndFilter from './FamilySearchAndFilter';
import FamilyResultsCount from './FamilyResultsCount';
import FamilyErrorState from './FamilyErrorState';
import FamilyEmptyState from './FamilyEmptyState';
import FamilyGrid from './FamilyGrid';
import FamilyListSkeleton from './FamilyListSkeleton';

const FamilyList = ({ families, loading, error, searchTerm, onSearchChange, onFamilySelect }) => {
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Extract unique areas from families (extract district/city from address)
  const areas = [...new Set(
    families
      .map(f => {
        if (!f.familyAddress) return null;
        // Extract the last part of address (typically district or city)
        const parts = f.familyAddress.split(',');
        return parts[parts.length - 1]?.trim();
      })
      .filter(Boolean)
  )].sort();

  // Filter families based on search and filters
  const filteredFamilies = families.filter(family => {
    // Search filter - matches family name, household head name, or address
    const matchesSearch = !searchTerm || 
      family.familyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.headOfFamily?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.familyAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Area filter - matches the extracted area from address
    const matchesArea = !areaFilter || family.familyAddress?.includes(areaFilter);
    
    // Status filter - matches exact status value
    const matchesStatus = !statusFilter || family.status === statusFilter;

    return matchesSearch && matchesArea && matchesStatus;
  });

  const hasActiveFilters = areaFilter || statusFilter || searchTerm;

  const handleClearFilters = () => {
    setAreaFilter('');
    setStatusFilter('');
    // Also clear search term when clearing all filters
    if (searchTerm) {
      onSearchChange('');
    }
  };

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
      {loading && <FamilyListSkeleton count={6} />}

      {/* Empty State */}
      {!loading && filteredFamilies.length === 0 && (
        <FamilyEmptyState hasFilters={hasActiveFilters} />
      )}

      {/* Family Grid */}
      {!loading && filteredFamilies.length > 0 && (
        <FamilyGrid families={filteredFamilies} onFamilySelect={onFamilySelect} />
      )}
    </Box>
  );
};

export default FamilyList; 