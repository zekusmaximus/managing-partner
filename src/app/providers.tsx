"use client";

import React, { ReactNode } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { SimulationProvider } from "@/context/SimulationContext";
import { TutorialProvider } from "@/context/TutorialContext";
import WelcomeModal from "@/components/tutorial/WelcomeModal";
import TutorialOverlay from "@/components/tutorial/TutorialOverlay";
import HelpFab from "@/components/help/HelpFab";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "*::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "*::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "*::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "4px",
          },
        },
      },
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SimulationProvider>
        <TutorialProvider>
          {children}
          <WelcomeModal />
          <TutorialOverlay />
          <HelpFab />
        </TutorialProvider>
      </SimulationProvider>
    </ThemeProvider>
  );
}

