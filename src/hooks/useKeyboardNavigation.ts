import { useState, useEffect } from 'react';
import { SheetInfo } from '../types';

interface UseKeyboardNavigationProps {
  isDialogOpen: boolean;
  filteredSheets: SheetInfo[];
  onSelectSheet: (sheet: SheetInfo) => void;
  onCloseDialog: () => void;
}

export const useKeyboardNavigation = ({
  isDialogOpen,
  filteredSheets,
  onSelectSheet,
  onCloseDialog
}: UseKeyboardNavigationProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyNavigation = (event: KeyboardEvent) => {
    if (!isDialogOpen) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredSheets.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredSheets[selectedIndex]) {
        onSelectSheet(filteredSheets[selectedIndex]);
      }
    }
  };

  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCloseDialog();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    window.addEventListener('keydown', handleEscapeKey);

    return () => {
      window.removeEventListener('keydown', handleKeyNavigation);
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isDialogOpen, filteredSheets, selectedIndex]);

  useEffect(() => {
    if (selectedIndex >= filteredSheets.length && filteredSheets.length > 0) {
      setSelectedIndex(filteredSheets.length - 1);
    }
  }, [filteredSheets.length, selectedIndex]);

  const resetSelectedIndex = () => setSelectedIndex(0);

  return {
    selectedIndex,
    resetSelectedIndex
  };
};