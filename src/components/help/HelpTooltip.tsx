"use client";

import React, { useState } from 'react';
import { IconButton, Popover, Typography, Box, Chip, Stack } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { getHelpItem } from '@/data/contextualHelp';

interface HelpTooltipProps {
  helpId: string;
  size?: 'small' | 'medium';
}

export default function HelpTooltip({ helpId, size = 'small' }: HelpTooltipProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const helpItem = getHelpItem(helpId);

  if (!helpItem) return null;

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size={size}
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        sx={{
          ml: 0.5,
          verticalAlign: 'middle',
          color: 'action.active',
          opacity: 0.6,
          '&:hover': { opacity: 1 },
          p: size === 'small' ? 0.25 : 0.5,
        }}
      >
        <InfoOutlined sx={{ fontSize: size === 'small' ? 16 : 20 }} />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { maxWidth: 380, p: 2.5 },
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          {helpItem.metricName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {helpItem.shortDescription}
        </Typography>
        <Box
          sx={{
            bgcolor: 'grey.50',
            borderRadius: 1,
            p: 1.5,
            borderLeft: '3px solid',
            borderColor: 'primary.main',
            mb: helpItem.relatedGlossaryTerms?.length ? 1.5 : 0,
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {helpItem.grExplanation}
          </Typography>
        </Box>
        {helpItem.relatedGlossaryTerms && helpItem.relatedGlossaryTerms.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
              Related:
            </Typography>
            {helpItem.relatedGlossaryTerms.map((termId) => (
              <Chip
                key={termId}
                label={termId.replace(/-/g, ' ')}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }}
              />
            ))}
          </Stack>
        )}
      </Popover>
    </>
  );
}
