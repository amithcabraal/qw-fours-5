import { useEffect, useState } from 'react';

export function useBeforeUnload(shouldWarn: boolean) {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldWarn) {
        setShowDialog(true);
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldWarn]);

  return {
    showDialog,
    handleStay: () => setShowDialog(false),
    handleLeave: () => {
      setShowDialog(false);
      window.location.reload();
    }
  };
}