"use client";

import React, { useState } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';
import { Box, Typography, Grid, Card, CardContent, CardHeader, Button, List, ListItem, ListItemText, ListItemIcon, ListItemButton, Chip, Divider, Paper, Badge } from '@mui/material';
import { Email, Warning, Info, Work, CheckCircle, CircleOutlined, PriorityHigh, Send } from '@mui/icons-material';
import { useSimulation } from '@/context/SimulationContext';
import type { InboxMessage } from '@/context/SimulationContext';

export default function Inbox() {
  const { state, markInboxMessageRead, handleInboxChoice, advanceMonth } = useSimulation();
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);

  const unreadCount = state.inbox.filter(m => !m.read).length;
  const actionRequired = state.inbox.filter(m => m.requiresAction).length;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'request': return <RequestIcon />;
      case 'alert': return <Warning color="warning" />;
      case 'opportunity': return <Work color="primary" />;
      default: return <Info />;
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleMessageClick = (message: InboxMessage) => {
    setSelectedMessage(message);
    if (!message.read) {
      markInboxMessageRead(message.id);
    }
  };

  const handleChoiceClick = (choiceId: string) => {
    if (selectedMessage) {
      handleInboxChoice(selectedMessage.id, choiceId);
      // Update selected message after handling
      const updatedMessage = state.inbox.find(m => m.id === selectedMessage.id);
      if (updatedMessage) {
        setSelectedMessage({ ...updatedMessage, read: true, requiresAction: false });
      }
    }
  };

  // Sort messages: unread first, then by urgency, then by date
  const sortedMessages = [...state.inbox].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNav />
        <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Inbox
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip 
                label={`${unreadCount} unread`} 
                color={unreadCount > 0 ? 'primary' : 'default'} 
              />
              <Chip 
                label={`${actionRequired} requires action`} 
                color={actionRequired > 0 ? 'warning' : 'default'} 
              />
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={advanceMonth}
              >
                Advance Month →
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ flex: 1, overflow: 'hidden' }}>
            {/* Message List */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ overflow: 'hidden' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader 
                  title="Messages" 
                  subheader={`${state.inbox.length} total message(s)`}
                />
                <Divider />
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  {sortedMessages.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Email sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography color="text.secondary">
                        No messages yet. Advance the month to receive new messages.
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {sortedMessages.map((message) => (
                        <React.Fragment key={message.id}>
                          <ListItem 
                            disablePadding
                          >
                            <ListItemButton 
                              selected={selectedMessage?.id === message.id}
                              onClick={() => handleMessageClick(message)}
                              sx={{ 
                                bgcolor: !message.read ? 'action.hover' : 'transparent',
                                borderLeft: !message.read ? '3px solid' : '3px solid transparent',
                                borderLeftColor: !message.read ? 'primary.main' : 'transparent',
                              }}
                            >
                              <ListItemIcon>
                                {!message.read ? 
                                  <CircleOutlined color="primary" /> : 
                                  <CircleOutlined color="disabled" />
                                }
                              </ListItemIcon>
                              <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    fontWeight={!message.read ? 'bold' : 'normal'}
                                    sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                  >
                                    {message.title}
                                  </Typography>
                                  <Chip 
                                    label={message.urgency} 
                                    size="small"
                                    color={getUrgencyColor(message.urgency) as any}
                                  />
                                </Box>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(message.timestamp)}
                                  {message.requiresAction && (
                                    <Chip 
                                      label="Action Required" 
                                      size="small" 
                                      color="warning" 
                                      sx={{ ml: 1, height: 16 }}
                                    />
                                  )}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Message Detail */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ overflow: 'hidden' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {selectedMessage ? (
                  <>
                    <CardHeader 
                      title={selectedMessage.title}
                      subheader={
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip 
                            label={selectedMessage.type} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`Urgency: ${selectedMessage.urgency}`} 
                            size="small" 
                            color={getUrgencyColor(selectedMessage.urgency) as any}
                          />
                          <Chip 
                            label={formatDate(selectedMessage.timestamp)} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                    <Divider />
                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                      <Typography variant="body1" paragraph>
                        {selectedMessage.description}
                      </Typography>

                      {selectedMessage.requiresAction && selectedMessage.choices.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            <PriorityHigh color="warning" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Action Required
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Choose one of the following actions:
                          </Typography>
                          <Grid container spacing={2}>
                            {selectedMessage.choices.map((choice) => (
                              <Grid size={{ xs: 12 }} key={choice.id}>
                                <Card 
                                  variant="outlined" 
                                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                  onClick={() => handleChoiceClick(choice.id)}
                                >
                                  <CardContent>
                                    <Typography variant="body1" fontWeight="bold">
                                      {choice.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {choice.effect}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {!selectedMessage.requiresAction && (
                        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <CheckCircle />
                          <Typography variant="body2">
                            This message has been addressed.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      <Email sx={{ fontSize: 64, mb: 2 }} />
                      <Typography variant="h6">
                        Select a message to read
                      </Typography>
                      <Typography variant="body2">
                        Click on a message from the list to view its contents
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
        </Box>
      </div>
    </div>
  );
}

// Helper component for request icon
function RequestIcon() {
  return (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
      <Send color="action" />
    </Box>
  );
}

