import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar, Typography } from '@mui/material';
import { DashboardOutlined, AttachMoneyOutlined, GroupOutlined, BusinessCenterOutlined, InboxOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const SideNav = () => {
  return (
    <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0, bgcolor: '#f5f5f5' }}>
      <Toolbar>
        <Typography variant="h6" color="inherit" sx={{ fontWeight: 600 }}>
          Managing Partner
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button component={Link} to="/" sx={{ textAlign: 'left' }}>
          <ListItemIcon>
            <DashboardOutlined />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/finances" sx={{ textAlign: 'left' }}>
          <ListItemIcon>
            <AttachMoneyOutlined />
          </ListItemIcon>
          <ListItemText primary="Finances" />
        </ListItem>
        <ListItem button component={Link} to="/hr" sx={{ textAlign: 'left' }}>
          <ListItemIcon>
            <GroupOutlined />
          </ListItemIcon>
          <ListItemText primary="HR/Roster" />
        </ListItem>
        <ListItem button component={Link} to="/clients" sx={{ textAlign: 'left' }}>
          <ListItemIcon>
            <BusinessCenterOutlined />
          </ListItemIcon>
          <ListItemText primary="Clients" />
        </ListItem>
        <ListItem button component={Link} to="/inbox" sx={{ textAlign: 'left' }}>
          <ListItemIcon>
            <InboxOutlined />
          </ListItemIcon>
          <ListItemText primary="Inbox" />
        </ListItem>
      </List>
    </Drawer>
  );
};