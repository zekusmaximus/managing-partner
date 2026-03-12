import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';
import { Box, Typography } from '@mui/material';

export default function Clients() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNav />
        <Box sx={{ p: 3, flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Clients
          </Typography>
          <Typography>
            Client management portal coming soon.
          </Typography>
        </Box>
      </div>
    </div>
  );
}
