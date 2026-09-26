"use client";

import React, { ReactNode } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { SimulationProvider } from "@/context/SimulationContext";
import { SessionProvider } from "@/context/SessionContext";
import { TutorialProvider } from "@/context/TutorialContext";
import { AppShell } from "@/components/layout/AppShell";
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
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
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
      <SessionProvider>
        <SimulationProvider>
          <TutorialProvider>
            <AppShell>{children}</AppShell>
            <WelcomeModal />
            <TutorialOverlay />
            <HelpFab />
          </TutorialProvider>
        </SimulationProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

