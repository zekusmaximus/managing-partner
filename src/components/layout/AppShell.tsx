"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ open: false, pathname });
  const mobileOpen = menuState.open && menuState.pathname === pathname;

  useEffect(() => {
    const openNavigation = () => setMenuState({ open: true, pathname });
    window.addEventListener('mp:open-navigation', openNavigation);
    return () => window.removeEventListener('mp:open-navigation', openNavigation);
  }, [pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <TopNav onOpenMenu={() => setMenuState({ open: true, pathname })} />
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0 }}>
        <SideNav mobileOpen={mobileOpen} onClose={() => setMenuState({ open: false, pathname })} />
        <Box component="main" id="main-content" sx={{ flex: 1, minWidth: 0, minHeight: 0, overflowX: 'hidden', overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
