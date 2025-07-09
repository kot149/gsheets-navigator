import { useState, useEffect } from 'react';

interface SheetInfo {
  id: string;
  name: string;
}

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const extractSheetsFromCurrentPage = (): SheetInfo[] => {
    try {
      const sheetTabs = document.querySelectorAll('.docs-sheet-tab');
      const extractedSheets: SheetInfo[] = [];

      sheetTabs.forEach((tab) => {
        const id = tab.getAttribute('id');
        const nameElement = tab.querySelector('.docs-sheet-tab-name');
        const name = nameElement?.textContent?.trim();

        if (id && name) {
          extractedSheets.push({ id, name });
        }
      });

      return extractedSheets;
    } catch (error) {
      console.error('ページの解析に失敗しました:', error);
      return [];
    }
  };

  const handleScanPage = async () => {
    setIsScanning(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const extractedSheets = extractSheetsFromCurrentPage();
      setSheets(extractedSheets);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSheetClick = (sheet: SheetInfo) => {
    const sheetElement = document.getElementById(sheet.id);
    if (sheetElement) {
      sheetElement.click();
      setIsDialogOpen(false);
    } else {
      navigator.clipboard.writeText(`シート名: ${sheet.name}, ID: ${sheet.id}`);
      alert(`シート情報をクリップボードにコピーしました:\n${sheet.name} (${sheet.id})`);
    }
  };

  useEffect(() => {
    handleScanPage();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault();
        setIsDialogOpen(true);
        handleScanPage();
      }
    };

    const handleKeyDownEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDialogOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyDownEscape);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleKeyDownEscape);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Ctrl + Space を押してシート一覧を表示
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Googleスプレッドシートのページで使用してください
        </p>
      </div>

      {isDialogOpen && (
        <div
          className="fixed inset-0 bg-black/25 flex items-center justify-center z-50"
          onClick={() => setIsDialogOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Googleスプレッドシート ナビゲーター
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <button
                onClick={handleScanPage}
                disabled={isScanning}
                className={`w-full px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  isScanning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>スキャン中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>ページを再スキャン</span>
                  </>
                )}
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                シート一覧 ({sheets.length}件)
              </h3>
              {sheets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400 mb-2">
                    シートが見つかりませんでした
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    Googleスプレッドシートのページで実行してください
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sheets.map((sheet, index) => (
                    <div
                      key={sheet.id}
                      onClick={() => handleSheetClick(sheet)}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {sheet.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {sheet.id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
