import { useState } from 'react';
import { SheetInfo } from '../types';
import { extractSheetsFromCurrentPage } from '../utils/sheetUtils';

export const useSheetExtraction = () => {
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const scanPage = async () => {
    setIsScanning(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const extractedSheets = extractSheetsFromCurrentPage();
      setSheets(extractedSheets);
    } finally {
      setIsScanning(false);
    }
  };

  return {
    sheets,
    isScanning,
    scanPage
  };
};