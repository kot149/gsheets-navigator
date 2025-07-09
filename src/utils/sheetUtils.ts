import { SheetInfo } from '../types';

export const extractSheetsFromCurrentPage = (): SheetInfo[] => {
  try {
    const extractedSheets: SheetInfo[] = [];

    const scripts = document.querySelectorAll('script');

    for (const script of scripts) {
      const text = script.textContent || '';

      const pattern1 = /\[21350203,\s*"\[(\d+),0,\\"(\d+)\\",\[{[^}]*\[\[0,0,\\"([^"\\]+)\\"/g;
      let match1;
      while ((match1 = pattern1.exec(text)) !== null) {
        const gid = match1[2];
        const name = match1[3];
        if (gid && name && gid !== '0') {
          extractedSheets.push({ id: gid, name });
        }
      }

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

      const gridIdMatch = text.match(/"gridId"\s*:\s*(\d+)/);
      if (gridIdMatch) {
        const currentGid = gridIdMatch[1];
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

    if (extractedSheets.length === 0) {
      const sheetTabs = document.querySelectorAll('.docs-sheet-tab');
      const currentGidMatch = window.location.hash.match(/gid=(\d+)/);
      const currentGid = currentGidMatch ? currentGidMatch[1] : null;

      sheetTabs.forEach((tab, index) => {
        const nameElement = tab.querySelector('.docs-sheet-tab-name');
        const name = nameElement?.textContent?.trim();

        if (name) {
          const isActive = tab.classList.contains('docs-sheet-active-tab');
          let gid: string;

          if (isActive && currentGid) {
            gid = currentGid;
          } else {
            gid = `sheet_${index}_${name.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
          }

          extractedSheets.push({ id: gid, name });
        }
      });
    }

    return extractedSheets.filter((sheet, index, self) =>
      index === self.findIndex(s => s.id === sheet.id)
    );
  } catch (error) {
    console.error('Page parsing failed:', error);
    return [];
  }
};

export const navigateToSheet = (sheet: SheetInfo): void => {
  try {
    if (/^\d+$/.test(sheet.id)) {
      const currentUrl = new URL(window.location.href);

      currentUrl.searchParams.set('gid', sheet.id);
      currentUrl.hash = `gid=${sheet.id}`;

      window.history.pushState({}, '', currentUrl.toString());

      window.dispatchEvent(new HashChangeEvent('hashchange', {
        oldURL: window.location.href,
        newURL: currentUrl.toString()
      }));

      setTimeout(() => {
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      }, 100);
    } else {
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
      } else {
        navigator.clipboard.writeText(`Sheet name: ${sheet.name}, ID: ${sheet.id}`);
        alert(`Sheet information copied to clipboard:\n${sheet.name}\n\nPlease click sheet tab manually.`);
      }
    }
  } catch (error) {
    console.error('Sheet switching failed:', error);
    navigator.clipboard.writeText(`Sheet name: ${sheet.name}, ID: ${sheet.id}`);
    alert(`Sheet information copied to clipboard:\n${sheet.name} (ID: ${sheet.id})`);
  }
};