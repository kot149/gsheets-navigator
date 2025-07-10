import { SheetInfo } from '../types';

interface SheetListProps {
  sheets: SheetInfo[];
  selectedIndex: number;
  onSheetClick: (sheet: SheetInfo) => void;
}

export const SheetList = ({ sheets, selectedIndex, onSheetClick }: SheetListProps) => {
  if (sheets.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          No matching sheets
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto">
      {sheets.map((sheet, index) => (
        <div
          key={sheet.index}
          onClick={() => onSheetClick(sheet)}
          className={`flex items-center justify-between p-2 rounded border-2 cursor-pointer transition-colors duration-200 ${
            index === selectedIndex
              ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500'
              : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className={`font-medium ${
              index === selectedIndex
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-gray-900 dark:text-white'
            }`}>
              {sheet.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};