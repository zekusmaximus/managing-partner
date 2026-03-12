"use client";

import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar, Typography, ListItemButton, Badge, Box } from '@mui/material';
import { Dashboard, AttachMoney, Groups, BusinessCenter, Inbox } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSimulation } from '@/context/SimulationContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <Dashboard /> },
  { path: '/finances', label: 'Finances', icon: <AttachMoney /> },
  { path: '/hr', label: 'HR/Roster', icon: <Groups /> },
  { path: '/clients', label: 'Clients', icon: <BusinessCenter /> },
  { path: '/inbox', label: 'Inbox', icon: <Inbox />, showBadge: true },
];

export const SideNav = () => {
  const pathname = usePathname();
  const { state } = useSimulation();
  
  const unreadCount = state.inbox.filter(m => !m.read).length;

  return (
    <Drawer 
      variant="permanent" 
      sx={{ 
        width: 240, 
        flexShrink: 0, 
        bgcolor: '#f8f9fa',
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: '#f8f9fa',
          borderRight: '1px solid rgba(0,0,0,0.08)',
        },
      }}
    >
      <Toolbar sx={{ bgcolor: '#1976d2', color: 'white' }}>
        <Typography variant="h6" color="inherit" sx={{ fontWeight: 600 }}>
          Menu
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ py: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1, py: 0.5 }}>
              <ListItemButton 
                component={Link} 
                href={item.path}
                selected={isActive}
                sx={{ 
                  borderRadius: 1,
                  textAlign: 'left',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.showBadge && unreadCount > 0 ? (
                    <Badge badgeContent={unreadCount} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary">
          Managing Partner v1.0
        </Typography>
      </Box>
    </Drawer>
  );
};

