import { useState, useEffect, useCallback } from 'react';
import { SheetInfo } from '../types';

export const useSheetExtraction = () => {
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const extractSheetsFromDOM = useCallback((): SheetInfo[] => {
    const tabs = document.querySelectorAll(".docs-sheet-tab");
    const extractedSheets: SheetInfo[] = [];

    tabs.forEach((tab, index) => {
      const tabNameElem = tab.querySelector(".docs-sheet-tab-name");

      if (tabNameElem) {
        const name = tabNameElem.textContent?.trim() || '';

        extractedSheets.push({
          index: index,
          name
        });
      }
    });

    return extractedSheets;
  }, []);

  const navigateToSheet = useCallback(async (sheetName: string) => {
    const tabNameElem = [...document.querySelectorAll(".docs-sheet-tab-name")]
      .find(elem => elem.textContent?.trim() === sheetName);

    if (tabNameElem) {
      const tabElem = tabNameElem.closest(".docs-sheet-tab");
      if (tabElem) {
        console.log(`✅ Navigating to sheet: ${sheetName}`);

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        tabElem.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        await delay(50);

        tabElem.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        await delay(100);

        tabElem.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        await delay(20);

        tabElem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        await delay(150);

        tabElem.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

        return true;
      }
    }
    return false;
  }, []);

  const scanPage = useCallback(async () => {
    setIsScanning(true);

    try {
      const tryExtract = (): boolean => {
        const extractedSheets = extractSheetsFromDOM();

        if (extractedSheets.length === 0) return false;

        setSheets(extractedSheets);
        console.log('extractedSheets', extractedSheets);
        return true;
      };

      let success = tryExtract();

      if (!success) {
        const maxAttempts = 10;
        let attempts = 0;

        const interval = setInterval(() => {
          attempts++;
          success = tryExtract();

          if (success || attempts >= maxAttempts) {
            clearInterval(interval);
          }
        }, 300);
      }

    } finally {
      setIsScanning(false);
    }
  }, [extractSheetsFromDOM]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const tabs = document.querySelectorAll(".docs-sheet-tab");
      if (tabs.length > 0) {
        scanPage();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [scanPage]);

  return {
    sheets,
    isScanning,
    scanPage,
    navigateToSheet
  };
};