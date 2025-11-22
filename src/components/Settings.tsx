import { useState } from 'react';
import { getBeans, getBrews, clearDatabase } from '../db';
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { useTheme } from '../theme/ThemeProvider';
import type { ThemePreference } from '../theme/ThemeProvider';

export function Settings() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure();
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [errorMessage, setErrorMessage] = useState('');

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
    <div className="max-w-[600px] mx-auto">
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
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="flex flex-col gap-4 max-w-[300px]">
              <Button 
                color="primary"
                onPress={handleExport}
              >
                Export Data (JSON)
              </Button>
              
              <Button 
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
    </div>
  );
}
