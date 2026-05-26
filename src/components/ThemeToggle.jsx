import React from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * ThemeToggle Component
 * Toggle between dark and light themes
 * Dark theme (default): Porsche-inspired with gold accents
 */
const ThemeToggle = ({ isDarkTheme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg transition-colors hover:bg-[#1a1a1a] text-[#D4AF37]"
      title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkTheme ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

export default ThemeToggle;
