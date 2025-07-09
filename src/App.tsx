import { useState, useEffect } from 'react';

interface SheetInfo {
  id: string;
  name: string;
}

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const extractSheetsFromCurrentPage = (): SheetInfo[] => {
    try {
      const extractedSheets: SheetInfo[] = [];

      // First, try to extract sheet information from the current page's script
      const scripts = document.querySelectorAll('script');

      for (const script of scripts) {
        const text = script.textContent || '';

        // Extract from Google Sheets internal data structure
        // Pattern 1: [21350203, "[sheet number,0,\"gid\",[{\"1\":[[0,0,\"sheet name\"]
        const pattern1 = /\[21350203,\s*"\[(\d+),0,\\"(\d+)\\",\[{[^}]*\[\[0,0,\\"([^"\\]+)\\"/g;
        let match1;
        while ((match1 = pattern1.exec(text)) !== null) {
          const gid = match1[2];
          const name = match1[3];
          if (gid && name && gid !== '0') {
            extractedSheets.push({ id: gid, name });
          }
        }

        // Pattern 2: A simpler JSON pattern
        const pattern2 = /"(\d{6,})"\s*,\s*\[{[^}]*\[\[0,0,\s*"([^"]+)"/g;
        let match2;
        while ((match2 = pattern2.exec(text)) !== null) {
          const gid = match2[1];
          const name = match2[2];
          if (gid && name && gid !== '0' && name.length > 0) {
            const existing = extractedSheets.find(s => s.id === gid);
            if (!existing) {
              extractedSheets.push({ id: gid, name });
            }
          }
        }

        // Pattern 3: Get the gid of the currently active sheet from the gridId field
        const gridIdMatch = text.match(/"gridId"\s*:\s*(\d+)/);
        if (gridIdMatch) {
          const currentGid = gridIdMatch[1];
          // Get the name of the currently active sheet from the DOM
          const activeTab = document.querySelector('.docs-sheet-active-tab .docs-sheet-tab-name');
          if (activeTab && currentGid !== '0') {
            const activeName = activeTab.textContent?.trim();
            if (activeName) {
              const existing = extractedSheets.find(s => s.id === currentGid);
              if (!existing) {
                extractedSheets.push({ id: currentGid, name: activeName });
              }
            }
          }
        }
      }

      // Fallback: Get sheet name from DOM elements
      if (extractedSheets.length === 0) {
        const sheetTabs = document.querySelectorAll('.docs-sheet-tab');
        const currentGidMatch = window.location.hash.match(/gid=(\d+)/);
        const currentGid = currentGidMatch ? currentGidMatch[1] : null;

        sheetTabs.forEach((tab, index) => {
          const nameElement = tab.querySelector('.docs-sheet-tab-name');
          const name = nameElement?.textContent?.trim();

          if (name) {
            // If it's the active tab, use the current gid
            const isActive = tab.classList.contains('docs-sheet-active-tab');
            let gid: string;

            if (isActive && currentGid) {
              gid = currentGid;
            } else {
              // For other sheets, infer a gid (not the actual value, but unique)
              gid = `sheet_${index}_${name.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
            }

            extractedSheets.push({ id: gid, name });
          }
        });
      }

      // Remove duplicates
      return extractedSheets.filter((sheet, index, self) =>
        index === self.findIndex(s => s.id === sheet.id)
      );
    } catch (error) {
      console.error('Page parsing failed:', error);
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
    try {
      // If the sheet's gid is only numbers (actual gid), change URL without reloading
      if (/^\d+$/.test(sheet.id)) {
        const currentUrl = new URL(window.location.href);

        // Set gid in query parameters
        currentUrl.searchParams.set('gid', sheet.id);

        // Set gid in hash
        currentUrl.hash = `gid=${sheet.id}`;

        // Change URL without reloading using history.pushState
        window.history.pushState({}, '', currentUrl.toString());

        // Manually trigger hash change event
        window.dispatchEvent(new HashChangeEvent('hashchange', {
          oldURL: window.location.href,
          newURL: currentUrl.toString()
        }));

        // To trigger Google Sheets internal processing,
        // wait a little and also fire popstate event
        setTimeout(() => {
          window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
        }, 100);

        setIsDialogOpen(false);
      } else {
        // If gid is a guessed value, try to click on the DOM element
        const sheetTabs = document.querySelectorAll('.docs-sheet-tab');
        let targetTab: Element | null = null;

        sheetTabs.forEach((tab) => {
          const nameElement = tab.querySelector('.docs-sheet-tab-name');
          const name = nameElement?.textContent?.trim();
          if (name === sheet.name) {
            targetTab = tab;
          }
        });

        if (targetTab) {
          (targetTab as HTMLElement).click();
          setIsDialogOpen(false);
        } else {
          // Fallback: Copy to clipboard
          navigator.clipboard.writeText(`Sheet name: ${sheet.name}, ID: ${sheet.id}`);
          alert(`Sheet information copied to clipboard:\n${sheet.name}\n\nPlease click sheet tab manually.`);
        }
      }
    } catch (error) {
      console.error('Sheet switching failed:', error);
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`Sheet name: ${sheet.name}, ID: ${sheet.id}`);
      alert(`Sheet information copied to clipboard:\n${sheet.name} (ID: ${sheet.id})`);
    }
  };

  const filteredSheets = sheets.filter(sheet =>
    sheet.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    setSelectedIndex(0);
  };

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
        handleSheetClick(filteredSheets[selectedIndex]);
      }
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
        setSearchKeyword('');
        setSelectedIndex(0);
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
    window.addEventListener('keydown', handleKeyNavigation);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleKeyDownEscape);
      window.removeEventListener('keydown', handleKeyNavigation);
    };
  }, [isDialogOpen, filteredSheets, selectedIndex]);

  useEffect(() => {
    if (selectedIndex >= filteredSheets.length && filteredSheets.length > 0) {
      setSelectedIndex(filteredSheets.length - 1);
    }
  }, [filteredSheets.length, selectedIndex]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Press Ctrl + Space to show sheet list
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Use this on Google Sheets page
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
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-auto"
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
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search sheets..."
                value={searchKeyword}
                onChange={handleKeywordChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="mb-4">
              {filteredSheets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400 mb-2">
                    {sheets.length === 0 ? 'No sheets found' : 'No matching sheets'}
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    {sheets.length === 0 ? 'Please run on Google Sheets page' : 'Try different keywords'}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredSheets.map((sheet, index) => (
                    <div
                      key={sheet.id}
                      onClick={() => handleSheetClick(sheet)}
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
