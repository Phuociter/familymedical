import { Divider, Typography } from '@mui/material';

const FamilyResultsCount = ({ filteredCount, totalCount, hasFilters }) => {
  return (
    <>
      <Divider />
      <Typography variant="body2" color="text.secondary">
        Hiển thị{' '}
        <Typography component="span" variant="body2" fontWeight="medium" color="text.primary">
          {filteredCount}
        </Typography>{' '}
        gia đình
        {hasFilters ? ` (đã lọc từ ${totalCount} gia đình)` : ''}
      </Typography>
    </>
  );
};

export default FamilyResultsCount;
