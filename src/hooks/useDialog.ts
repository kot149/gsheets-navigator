import { useState, useRef, useEffect } from 'react';

export const useDialog = (onOpenDialog?: () => void) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isDraggingRef = useRef(false);
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

  const openDialog = () => {
    setIsDialogOpen(true);
    onOpenDialog?.();
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleDialogBackgroundClick = () => {
    if (!isDraggingRef.current) {
      closeDialog();
    }
    isDraggingRef.current = false;
    mouseDownPosRef.current = null;
  };

  const handleDialogMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = false;
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleDialogMouseMove = (e: React.MouseEvent) => {
    if (mouseDownPosRef.current) {
      const deltaX = Math.abs(e.clientX - mouseDownPosRef.current.x);
      const deltaY = Math.abs(e.clientY - mouseDownPosRef.current.y);
      if (deltaX > 5 || deltaY > 5) {
        isDraggingRef.current = true;
      }
    }
  };

  const handleDialogMouseUp = () => {
    mouseDownPosRef.current = null;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault();
        openDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    isDialogOpen,
    openDialog,
    closeDialog,
    handleDialogBackgroundClick,
    handleDialogMouseDown,
    handleDialogMouseMove,
    handleDialogMouseUp
  };
};