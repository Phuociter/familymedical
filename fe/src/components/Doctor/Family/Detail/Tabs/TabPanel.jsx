import { Box } from '@mui/material';

/**
 * TabPanel component - Reusable tab content container
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display in the tab
 * @param {number} props.value - Current active tab index
 * @param {number} props.index - This panel's tab index
 * @param {Object} props.sx - Additional MUI sx styles
 */
export default function TabPanel({ children, value, index, sx = {}, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3, ...sx }}>
          {children}
        </Box>
      )}
    </div>
  );
}
