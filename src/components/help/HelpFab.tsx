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
          onClick={() => setGlossaryOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
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
