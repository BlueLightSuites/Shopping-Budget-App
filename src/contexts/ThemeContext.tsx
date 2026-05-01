import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@theme_dark_mode';

export interface ThemeColors {
  // Page backgrounds
  background: string;
  // Card surfaces
  card: string;
  cardBorder: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Inputs
  inputBackground: string;
  inputBorder: string;
  // Dividers
  divider: string;
  sectionDivider: string;
  // Quick-budget / chip buttons
  chipBackground: string;
  chipBorder: string;
  // Tab bar
  tabBar: string;
  tabBarBorder: string;
  // Settings rows
  settingItemBorder: string;
}

export const lightColors: ThemeColors = {
  background:        '#F1F5F9',
  card:              '#FFFFFF',
  cardBorder:        '#E2E8F0',
  textPrimary:       '#1E293B',
  textSecondary:     '#64748B',
  textMuted:         '#94A3B8',
  inputBackground:   '#F8FAFC',
  inputBorder:       '#E2E8F0',
  divider:           '#F1F5F9',
  sectionDivider:    '#E2E8F0',
  chipBackground:    '#F1F5F9',
  chipBorder:        '#E2E8F0',
  tabBar:            '#FFFFFF',
  tabBarBorder:      '#E5E5EA',
  settingItemBorder: '#F0F0F0',
};

export const darkColors: ThemeColors = {
  background:        '#0D1B2E',
  card:              '#1E293B',
  cardBorder:        '#334155',
  textPrimary:       '#F1F5F9',
  textSecondary:     '#94A3B8',
  textMuted:         '#64748B',
  inputBackground:   '#0F172A',
  inputBorder:       '#334155',
  divider:           '#1A2E45',
  sectionDivider:    '#334155',
  chipBackground:    '#0F172A',
  chipBorder:        '#334155',
  tabBar:            '#1E293B',
  tabBarBorder:      '#334155',
  settingItemBorder: '#334155',
};

interface ThemeContextType {
  isDarkMode: boolean;
  colors: ThemeColors;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Restore persisted preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val !== null) setIsDarkMode(val === 'true');
    });
  }, []);

  const toggleDarkMode = async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    await AsyncStorage.setItem(THEME_KEY, String(next));
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
