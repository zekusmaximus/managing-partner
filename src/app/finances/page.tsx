import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';
import { Box, Typography } from '@mui/material';

export default function Finances() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNav />
        <Box sx={{ p: 3, flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Finances
          </Typography>
          <Typography>
            Financial management dashboard coming soon.
          </Typography>
        </Box>
      </div>
    </div>
  );
}
