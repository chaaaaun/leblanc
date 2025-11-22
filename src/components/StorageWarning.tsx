import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Alert } from "@heroui/alert";

const STORAGE_WARNING_KEY = 'leblanc.storageWarningDismissed';

export function StorageWarning() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_WARNING_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_WARNING_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="w-full p-4">
      <div className="container mx-auto max-w-4xl">
        <Alert
          color="warning"
          variant="flat"
          onClose={dismiss}
          title="Local Storage Only"
          description={
            <span>
              Leblanc stores all your data locally in this browser. 
              <Link to="/settings" className="underline ml-1 font-medium hover:text-warning-900 dark:hover:text-warning-200">
                Manage your data settings
              </Link>
            </span>
          }
          classNames={{
            base: "bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-900/50",
            title: "text-warning-800 dark:text-warning-300 font-bold",
            description: "text-warning-800 dark:text-warning-300",
          }}
        />
      </div>
    </div>
  );
}