import { SheetInfo } from '../types';
import { SearchInput } from './SearchInput';
import { SheetList } from './SheetList';

interface SheetNavigatorDialogProps {
  isOpen: boolean;
  sheets: SheetInfo[];
  allSheets: SheetInfo[];
  isScanning: boolean;
  selectedIndex: number;
  searchKeyword: string;
  onClose: () => void;
  onRescan: () => void;
  onSheetClick: (sheet: SheetInfo) => void;
  onSearchChange: (value: string) => void;
  onBackgroundClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

export const SheetNavigatorDialog = ({
  isOpen,
  sheets,
  allSheets,
  isScanning,
  selectedIndex,
  searchKeyword,
  onClose,
  onRescan,
  onSheetClick,
  onSearchChange,
  onBackgroundClick,
  onMouseDown,
  onMouseMove,
  onMouseUp
}: SheetNavigatorDialogProps) => {
  const handleSheetClick = (sheet: SheetInfo) => {
    onSheetClick(sheet);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/25 flex items-center justify-center z-1000"
      onClick={onBackgroundClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[80vh] overflow-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <div className="flex justify-between items-center">
          <button
            onClick={onRescan}
            disabled={isScanning}
            className={`px-3 py-2 rounded text-sm transition-colors duration-200 flex items-center justify-center space-x-2 ${
              isScanning
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            }`}
          >
            {isScanning ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Rescan</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <SearchInput
          value={searchKeyword}
          onChange={onSearchChange}
        />

        <div>
          {sheets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">
                {allSheets.length === 0 ? 'No sheets found' : 'No matching sheets'}
              </div>
            </div>
          ) : (
            <SheetList
              sheets={sheets}
              selectedIndex={selectedIndex}
              onSheetClick={handleSheetClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};