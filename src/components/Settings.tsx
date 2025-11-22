import { useState, useRef, useEffect } from 'react';
import { getBeans, getBrews, clearDatabase, importData } from '../db';
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { useTheme } from '../theme/ThemeProvider';
import type { ThemePreference } from '../theme/ThemeProvider';
import { Alert } from '@heroui/alert';

export function Settings() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure();
  const { isOpen: isImportOpen, onOpen: onImportOpen, onOpenChange: onImportOpenChange } = useDisclosure();
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [errorMessage, setErrorMessage] = useState('');
  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);
  const [pendingImport, setPendingImport] = useState<{ beans: any[], brews: any[], exportDate?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(setIsPersisted);
    } else {
      setIsPersisted(false);
    }
  }, []);

  const handlePersist = async () => {
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist();
      const isPersisted = await navigator.storage.persisted();
      setIsPersisted(isPersisted);
    }
  };

  const handleExport = async () => {
    try {
      const [beans, brews] = await Promise.all([getBeans(), getBrews()]);
      const data = {
        beans,
        brews,
        exportDate: new Date().toISOString(),
        version: 1
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leblanc-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setErrorMessage('Failed to export data');
      onErrorOpen();
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);
        
        if (!data.beans || !data.brews) {
          throw new Error('Invalid backup file format');
        }

        setPendingImport(data);
        onImportOpen();
      } catch (error) {
        console.error('Import failed:', error);
        setErrorMessage('Failed to import data: Invalid file format');
        onErrorOpen();
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImport = async () => {
    if (!pendingImport) return;
    await importData(pendingImport);
    window.location.reload();
  };

  const handleDelete = async () => {
    try {
      await clearDatabase();
      window.location.reload();
    } catch (error) {
      console.error('Delete failed:', error);
      setErrorMessage('Failed to delete data');
      onErrorOpen();
    }
  };

  return (
    <div className="mx-auto">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Settings</h2>
        </CardHeader>
        <CardBody className="space-y-10">
          <div>
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            <p className="text-small text-default-500 mb-4">
              Leblanc matches your system theme by default. Override it anytime.
            </p>
            <div className="flex flex-col gap-3 max-w-[260px]">
              <Select
                label="Theme"
                selectedKeys={[preference]}
                onChange={(event) => setPreference(event.target.value as ThemePreference)}
              >
                <SelectItem key="system" description="Follow your OS preference">
                  System default
                </SelectItem>
                <SelectItem key="light" description="Always use a bright UI">
                  Light
                </SelectItem>
                <SelectItem key="dark" description="Always use a dimmed UI">
                  Dark
                </SelectItem>
              </Select>
              <div className="flex items-center gap-2 text-small text-default-500">
                Active theme:
                <Chip
                  color={resolvedTheme === 'dark' ? 'primary' : 'default'}
                  size="sm"
                  variant="flat"
                >
                  {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                </Chip>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Storage Persistence</h3>
            <Alert className='mb-4' description="While this option works in the majority of modern browsers, it cannot guarantee absolute data safety in all scenarios. For example, Safari on iOS may still clear data under its own storage management policies. Make sure to occasionally back up your data using the options below." title="Note" variant="bordered" />
            <p className="text-small text-default-500 mb-4">
              Request the browser to keep your data even when storage space is low.
            </p>
            <div className="flex items-center gap-4">
              <Button 
                color={isPersisted ? "success" : "primary"}
                variant={isPersisted ? "flat" : "solid"}
                onPress={handlePersist}
                isDisabled={isPersisted === true}
                isLoading={isPersisted === null}
              >
                {isPersisted ? "Persistence Enabled" : "Enable Persistence"}
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="flex flex-col gap-4 w-full md:flex-row">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
              <Button 
                className='grow'
                color="primary"
                onPress={handleExport}
              >
                Export Data (JSON)
              </Button>

              <Button 
                className='grow'
                color="secondary"
                onPress={() => fileInputRef.current?.click()}
              >
                Import Data (JSON)
              </Button>
              
              <Button 
                className='grow'
                color="danger"
                onPress={onOpen}
              >
                Delete All Data
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete All Data</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete ALL data? This action cannot be undone.
                  All your beans and brews will be lost forever.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={() => {
                  handleDelete();
                  onClose();
                }}>
                  Delete Everything
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={isErrorOpen} onOpenChange={onErrorOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Error</ModalHeader>
              <ModalBody>
                <p>{errorMessage}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isImportOpen} onOpenChange={onImportOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Import Data</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-default-100 rounded-lg">
                      <p className="text-tiny text-default-500">Beans</p>
                      <p className="text-xl font-bold">{pendingImport?.beans?.length || 0}</p>
                    </div>
                    <div className="p-3 bg-default-100 rounded-lg">
                      <p className="text-tiny text-default-500">Brews</p>
                      <p className="text-xl font-bold">{pendingImport?.brews?.length || 0}</p>
                    </div>
                    <div className="col-span-2 p-3 bg-default-100 rounded-lg">
                      <p className="text-tiny text-default-500">Export Date</p>
                      <p className="font-medium">
                        {pendingImport?.exportDate ? new Date(pendingImport.exportDate).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <Alert 
                    color="warning" 
                    title="Warning"
                    description="This action will overwrite all current data. This cannot be undone."
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={() => {
                  confirmImport();
                  onClose();
                }}>
                  Import Data
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
