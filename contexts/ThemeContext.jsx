import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on app startup
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Default to system preference if no saved preference
        const systemTheme = Appearance.getColorScheme();
        setIsDarkMode(systemTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fallback to system theme
      const systemTheme = Appearance.getColorScheme();
      setIsDarkMode(systemTheme === 'dark');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    isLoading,
    colors: {
      // Background colors
      background: isDarkMode ? '#021F2B' : '#F4F9F9', // bgDark : bgLight
      cardBackground: isDarkMode ? '#005F73' : '#FFFFFF', // secondary : white
      
      // Text colors
      text: isDarkMode ? '#E3FDFD' : '#0A2E36', // textDark : textLight
      textSecondary: isDarkMode ? 'rgba(227, 253, 253, 0.7)' : 'rgba(10, 46, 54, 0.7)',
      
      // Icon colors
      icon: isDarkMode ? '#7FDBDA' : '#4B778D', // iconDark : iconLight
      
      // Tab colors
      tabDefault: isDarkMode ? '#44626A' : '#A1B5C1', // tabDark : tabDefault
      tabActive: '#00BFA6', // primary (same for both themes)
      
      // Brand colors
      primary: '#00BFA6',
      secondary: '#005F73',
      
      // Status bar
      statusBarStyle: isDarkMode ? 'light-content' : 'dark-content',
      statusBarBackground: isDarkMode ? '#021F2B' : '#F4F9F9',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};