import { SheetInfo } from '../types';
import { SearchInput } from './SearchInput';
import { SheetList } from './SheetList';

interface SheetNavigatorDialogProps {
  isOpen: boolean;
  sheets: SheetInfo[];
  allSheets: SheetInfo[];
  selectedIndex: number;
  searchKeyword: string;
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
  selectedIndex,
  searchKeyword,
  onSheetClick,
  onSearchChange,
  onBackgroundClick,
  onMouseDown,
  onMouseMove,
  onMouseUp
}: SheetNavigatorDialogProps) => {
  const handleSheetClick = (sheet: SheetInfo) => {
    onSheetClick(sheet);
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