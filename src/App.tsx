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
    closeDialog();
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
    <div>
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
