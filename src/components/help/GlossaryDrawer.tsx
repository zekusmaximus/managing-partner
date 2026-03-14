"use client";

import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  InputAdornment,
  Stack,
  Divider,
} from '@mui/material';
import { Close, Search, ExpandMore } from '@mui/icons-material';
import {
  glossaryTerms,
  glossaryCategories,
  type GlossaryCategory,
  type GlossaryTerm,
} from '@/data/glossaryTerms';

interface GlossaryDrawerProps {
  open: boolean;
  onClose: () => void;
}

const categoryColors: Record<GlossaryCategory, string> = {
  'Industry Basics': '#1976d2',
  'Lobbying & Advocacy': '#7b1fa2',
  'Legislative Process': '#0097a7',
  'Compliance & Regulation': '#d32f2f',
  'Business & Finance': '#388e3c',
  'Firm Management': '#f57c00',
};

export default function GlossaryDrawer({ open, onClose }: GlossaryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | false>(false);

  const filteredTerms = useMemo(() => {
    let results: GlossaryTerm[] = glossaryTerms;

    if (selectedCategory) {
      results = results.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      results = results.filter(
        (t) =>
          t.term.toLowerCase().includes(lower) ||
          t.definition.toLowerCase().includes(lower)
      );
    }

    return results;
  }, [searchQuery, selectedCategory]);

  const handleCategoryToggle = (category: GlossaryCategory) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1500,
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 420 },
          boxSizing: 'border-box',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          GR Glossary
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      {/* Search */}
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search terms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Category Filters */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ gap: 0.5 }}>
          {glossaryCategories.map((category) => (
            <Chip
              key={category}
              label={category}
              size="small"
              onClick={() => handleCategoryToggle(category)}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              sx={{
                fontSize: '0.72rem',
                borderColor: categoryColors[category],
                color: selectedCategory === category ? 'white' : categoryColors[category],
                bgcolor: selectedCategory === category ? categoryColors[category] : 'transparent',
                '&:hover': {
                  bgcolor:
                    selectedCategory === category
                      ? categoryColors[category]
                      : `${categoryColors[category]}15`,
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* Results count */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''}
          {selectedCategory && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </Typography>
      </Box>

      {/* Terms List */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        {filteredTerms.map((term) => (
          <Accordion
            key={term.id}
            expanded={expandedTerm === term.id}
            onChange={(_, isExpanded) => setExpandedTerm(isExpanded ? term.id : false)}
            disableGutters
            elevation={0}
            sx={{
              '&:before': { display: 'none' },
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{ minHeight: 44, '& .MuiAccordionSummary-content': { my: 0.75 } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                  {term.term}
                </Typography>
                <Chip
                  label={term.category}
                  size="small"
                  sx={{
                    fontSize: '0.65rem',
                    height: 20,
                    bgcolor: `${categoryColors[term.category]}15`,
                    color: categoryColors[term.category],
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 2 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                {term.definition}
              </Typography>
              {term.relatedTerms && term.relatedTerms.length > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="text.disabled" sx={{ mr: 0.5 }}>
                    See also:
                  </Typography>
                  {term.relatedTerms.map((relatedId) => {
                    const related = glossaryTerms.find((t) => t.id === relatedId);
                    return related ? (
                      <Chip
                        key={relatedId}
                        label={related.term}
                        size="small"
                        variant="outlined"
                        onClick={() => setExpandedTerm(relatedId)}
                        sx={{
                          fontSize: '0.68rem',
                          height: 22,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      />
                    ) : null;
                  })}
                </Stack>
              )}
            </AccordionDetails>
          </Accordion>
        ))}

        {filteredTerms.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No terms found matching your search.
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
