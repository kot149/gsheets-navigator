import { useEffect, useState } from 'react';
import { SheetNavigatorDialog } from './components/SheetNavigatorDialog';
import { useSheetExtraction } from './hooks/useSheetExtraction';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useDialog } from './hooks/useDialog';
import { navigateToSheet } from './utils/sheetUtils';
import { SheetInfo } from './types';

function App() {
  const { sheets, isScanning, scanPage } = useSheetExtraction();
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredSheets = sheets.filter(sheet =>
    sheet.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleDialogOpen = () => {
    setSearchKeyword('');
    scanPage();
  };

  const {
    isDialogOpen,
    closeDialog,
    handleDialogBackgroundClick,
    handleDialogMouseDown,
    handleDialogMouseMove,
    handleDialogMouseUp
  } = useDialog(handleDialogOpen);

  const handleSheetClick = (sheet: SheetInfo) => {
    navigateToSheet(sheet);
  };

  const { selectedIndex, resetSelectedIndex } = useKeyboardNavigation({
    isDialogOpen,
    filteredSheets,
    onSelectSheet: handleSheetClick,
    onCloseDialog: closeDialog
  });

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    resetSelectedIndex();
  };

  useEffect(() => {
    scanPage();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Press Ctrl + Space to show sheet list
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Use this on Google Sheets page
        </p>
      </div>

      <SheetNavigatorDialog
        isOpen={isDialogOpen}
        sheets={filteredSheets}
        allSheets={sheets}
        isScanning={isScanning}
        selectedIndex={selectedIndex}
        searchKeyword={searchKeyword}
        onClose={closeDialog}
        onRescan={scanPage}
        onSheetClick={handleSheetClick}
        onSearchChange={handleSearchChange}
        onBackgroundClick={handleDialogBackgroundClick}
        onMouseDown={handleDialogMouseDown}
        onMouseMove={handleDialogMouseMove}
        onMouseUp={handleDialogMouseUp}
      />
    </div>
  );
}

export default App;
