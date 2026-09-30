"use client";

import { useEffect, useState } from 'react';
import {
  Alert, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Snackbar, Typography,
} from '@mui/material';
import { Dashboard, AttachMoney, Groups, BusinessCenter, Inbox, RestartAlt } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSimulation } from '@/context/SimulationContext';
import { useSession } from '@/context/SessionContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <Dashboard />, tutorialTarget: 'sidenav-dashboard' },
  { path: '/finances', label: 'Finances', icon: <AttachMoney />, tutorialTarget: 'sidenav-finances' },
  { path: '/hr', label: 'HR/Roster', icon: <Groups />, tutorialTarget: 'sidenav-hr' },
  { path: '/clients', label: 'Clients', icon: <BusinessCenter />, tutorialTarget: 'sidenav-clients' },
  { path: '/inbox', label: 'Inbox', icon: <Inbox />, showBadge: true, tutorialTarget: 'sidenav-inbox' },
];

export function SideNav({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSimulation();
  const { newGame, setTutorial, notice, dismissNotice } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const unreadCount = state.inbox.filter(message => !message.read).length;

  useEffect(() => {
    const openNewGame = () => setConfirmOpen(true);
    window.addEventListener('mp:open-new-game', openNewGame);
    return () => window.removeEventListener('mp:open-new-game', openNewGame);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const frame = window.requestAnimationFrame(() =>
      document.querySelector<HTMLAnchorElement>('nav[aria-label="Mobile navigation"] a')?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [mobileOpen]);

  const startNewGame = (mode: 'free' | 'case') => {
    newGame(mode);
    if (mode === 'free') {
      setTutorial(previous => ({ ...previous, status: 'skipped', showWelcomeModal: false }));
    }
    setConfirmOpen(false);
    onClose();
    router.push('/');
  };

  const handleNavigate = (path: string) => {
    if (path === pathname) onClose();
  };

  const navigation = (mobile: boolean) => (
    <Box component="nav" aria-label={mobile ? 'Mobile navigation' : 'Primary navigation'} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {mobile && (
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="h6" fontWeight={700}>Menu</Typography>
        </Box>
      )}
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map(item => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ py: 0.25 }} data-tutorial-target={item.tutorialTarget}>
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={() => handleNavigate(item.path)}
                selected={isActive}
                aria-current={isActive ? 'page' : undefined}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main', color: 'common.white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'common.white' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.showBadge && unreadCount > 0 ? (
                    <Badge badgeContent={unreadCount} color="error">{item.icon}</Badge>
                  ) : item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 400, fontSize: '0.9rem' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Button fullWidth variant="outlined" color="warning" startIcon={<RestartAlt />} onClick={(event) => {
          event.currentTarget.blur();
          if (mobile) {
            document.querySelector<HTMLButtonElement>('button[aria-label="Open navigation menu"]')?.focus();
            onClose();
            window.setTimeout(() => {
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
              setConfirmOpen(true);
            }, 250);
          } else {
            setConfirmOpen(true);
          }
        }}>
          New Game
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Managing Partner prototype
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' }, width: 240, flexShrink: 0,
          '& .MuiDrawer-paper': {
            position: 'relative', width: 240, height: '100%', boxSizing: 'border-box',
            bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider',
          },
        }}
      >
        {navigation(false)}
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true, disableAutoFocus: true, disableEnforceFocus: true, disableRestoreFocus: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 'min(280px, 88vw)', boxSizing: 'border-box', bgcolor: 'grey.50',
          },
        }}
      >
        {navigation(true)}
      </Drawer>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="new-game-title">
        <DialogTitle id="new-game-title">Start a new game?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This replaces your current firm on this device. Choose the guided January–March
            case or start free play with the usual opening conditions.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1, px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="outlined"
            onClick={() => startNewGame('free')}
          >
            Explore freely
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={() => startNewGame('case')}
          >
            Start guided case
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={6000} onClose={dismissNotice} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" onClose={dismissNotice} sx={{ width: '100%' }}>{notice}</Alert>
      </Snackbar>
    </>
  );
}
