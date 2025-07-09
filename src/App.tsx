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
      const extractedSheets: SheetInfo[] = [];

      // まず、現在のページのスクリプトからシート情報を抽出を試行
      const scripts = document.querySelectorAll('script');

      for (const script of scripts) {
        const text = script.textContent || '';

        // Googleスプレッドシートの内部データ構造から抽出
        // パターン1: [21350203, "[シート番号,0,\"gid\",[{\"1\":[[0,0,\"シート名\"]
        const pattern1 = /\[21350203,\s*"\[(\d+),0,\\"(\d+)\\",\[{[^}]*\[\[0,0,\\"([^"\\]+)\\"/g;
        let match1;
        while ((match1 = pattern1.exec(text)) !== null) {
          const gid = match1[2];
          const name = match1[3];
          if (gid && name && gid !== '0') {
            extractedSheets.push({ id: gid, name });
          }
        }

        // パターン2: より簡単なJSONパターン
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

        // パターン3: gridIdフィールドから現在のアクティブなシートのgidを取得
        const gridIdMatch = text.match(/"gridId"\s*:\s*(\d+)/);
        if (gridIdMatch) {
          const currentGid = gridIdMatch[1];
          // 現在のアクティブなシートの名前をDOMから取得
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

      // フォールバック: DOM要素からシート名を取得
      if (extractedSheets.length === 0) {
        const sheetTabs = document.querySelectorAll('.docs-sheet-tab');
        const currentGidMatch = window.location.hash.match(/gid=(\d+)/);
        const currentGid = currentGidMatch ? currentGidMatch[1] : null;

        sheetTabs.forEach((tab, index) => {
          const nameElement = tab.querySelector('.docs-sheet-tab-name');
          const name = nameElement?.textContent?.trim();

          if (name) {
            // アクティブなタブの場合は現在のgidを使用
            const isActive = tab.classList.contains('docs-sheet-active-tab');
            let gid: string;

            if (isActive && currentGid) {
              gid = currentGid;
            } else {
              // 他のシートの場合、推測されるgid（実際の値ではないが一意）
              gid = `sheet_${index}_${name.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
            }

            extractedSheets.push({ id: gid, name });
          }
        });
      }

      // 重複を除去
      return extractedSheets.filter((sheet, index, self) =>
        index === self.findIndex(s => s.id === sheet.id)
      );
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
    try {
      // シートのgidが数値のみの場合（実際のgid）、リロードせずにURL変更
      if (/^\d+$/.test(sheet.id)) {
        const currentUrl = new URL(window.location.href);

        // クエリパラメータにgidを設定
        currentUrl.searchParams.set('gid', sheet.id);

        // ハッシュにもgidを設定
        currentUrl.hash = `gid=${sheet.id}`;

        // history.pushStateを使ってリロードせずにURL変更
        window.history.pushState({}, '', currentUrl.toString());

        // ハッシュ変更イベントを手動でトリガー
        window.dispatchEvent(new HashChangeEvent('hashchange', {
          oldURL: window.location.href,
          newURL: currentUrl.toString()
        }));

        // Googleスプレッドシートの内部処理をトリガーするために、
        // 少し待ってからpopstateイベントも発火
        setTimeout(() => {
          window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
        }, 100);

        setIsDialogOpen(false);
      } else {
        // gidが推測値の場合、DOM要素をクリックを試行
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
          // フォールバック: クリップボードにコピー
          navigator.clipboard.writeText(`シート名: ${sheet.name}, ID: ${sheet.id}`);
          alert(`シート情報をクリップボードにコピーしました:\n${sheet.name}\n\n手動でシートタブをクリックしてください。`);
        }
      }
    } catch (error) {
      console.error('シートの切り替えに失敗しました:', error);
      // フォールバック: クリップボードにコピー
      navigator.clipboard.writeText(`シート名: ${sheet.name}, ID: ${sheet.id}`);
      alert(`シート情報をクリップボードにコピーしました:\n${sheet.name} (ID: ${sheet.id})`);
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
