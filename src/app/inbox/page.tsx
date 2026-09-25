"use client";

import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardHeader, Button, List, ListItem, ListItemText, ListItemIcon, ListItemButton, Chip, Divider } from '@mui/material';
import { Email, CheckCircle, CircleOutlined, PriorityHigh } from '@mui/icons-material';
import { useSimulation } from '@/context/SimulationContext';
import type { InboxMessage } from '@/context/SimulationContext';
import HelpTooltip from '@/components/help/HelpTooltip';

export default function Inbox() {
  const { state, markInboxMessageRead, handleInboxChoice } = useSimulation();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const selectedMessage = state.inbox.find(message => message.id === selectedMessageId) ?? null;

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

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleMessageClick = (message: InboxMessage) => {
    setSelectedMessageId(message.id);
    if (!message.read) {
      markInboxMessageRead(message.id);
    }
  };

  const handleChoiceClick = (choiceId: string) => {
    if (selectedMessageId) {
      handleInboxChoice(selectedMessageId, choiceId);
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
        <Box sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
            <Typography variant="h4" component="h1">
              Inbox
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Chip
                label={`${unreadCount} unread`}
                color={unreadCount > 0 ? 'primary' : 'default'}
              />
              <Chip
                label={<>{actionRequired} requires action <HelpTooltip helpId="inbox-action-required" /></>}
                color={actionRequired > 0 ? 'warning' : 'default'}
              />
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ minWidth: 0 }}>
            {/* Message List */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: 0, height: { md: 'calc(100dvh - 210px)' } }} data-tutorial-target="inbox-message-list">
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 280 }}>
                <CardHeader 
                  title="Messages" 
                  subheader={`${state.inbox.length} total message(s)`}
                />
                <Divider />
                <Box sx={{ flex: 1, minHeight: 0, maxHeight: { xs: 320, md: 'none' }, overflowY: 'auto' }}>
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
                              selected={selectedMessageId === message.id}
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
            <Grid size={{ xs: 12, md: 7 }} sx={{ minWidth: 0, height: { md: 'calc(100dvh - 210px)' } }} data-tutorial-target="inbox-detail">
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 320 }}>
                {selectedMessage ? (
                  <>
                    <CardHeader 
                      title={selectedMessage.title}
                      subheader={
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
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
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
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
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  sx={{ display: 'block', textAlign: 'left', textTransform: 'none', p: 2, borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
                                  onClick={() => handleChoiceClick(choice.id)}
                                >
                                  <Typography variant="body1" fontWeight="bold">{choice.label}</Typography>
                                  <Typography variant="body2" color="text.secondary">{choice.effect}</Typography>
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {!selectedMessage.requiresAction && (
                        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <CheckCircle />
                          <Typography variant="body2">
                            {selectedMessage.choices.length > 0
                              ? 'This message has been addressed.'
                              : 'No action is needed for this message.'}
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
                        Choose a message from the list to view its contents
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
        </Box>
  );
}

