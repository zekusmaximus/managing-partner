import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';
import { Box, Typography } from '@mui/material';

export default function Inbox() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNav />
        <Box sx={{ p: 3, flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Inbox
          </Typography>
          <Typography>
            Message inbox coming soon.
          </Typography>
        </Box>
      </div>
    </div>
  );
}
