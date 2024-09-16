import React from 'react';
import { Box, Button } from 'grommet';
import { Moon, Sun } from 'grommet-icons';

const ThemeSwitcher = ({ toggleTheme, isDarkMode }) => (
  <Box direction="row" gap="small" pad="small" align="center">
    <Button
      icon={isDarkMode ? <Sun /> : <Moon />}
      label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
      onClick={toggleTheme}
      primary
    />
  </Box>
);

export default ThemeSwitcher;