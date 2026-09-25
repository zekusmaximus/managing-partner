"use client";

import React, { useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { MenuBook } from '@mui/icons-material';
import GlossaryDrawer from '@/components/help/GlossaryDrawer';

export default function HelpFab() {
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  return (
    <>
      <Tooltip title="GR Glossary & Help" placement="left">
        <Fab
          color="primary"
          aria-label="Open government relations glossary and help"
          onClick={() => setGlossaryOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1200,
          }}
        >
          <MenuBook />
        </Fab>
      </Tooltip>
      <GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </>
  );
}
