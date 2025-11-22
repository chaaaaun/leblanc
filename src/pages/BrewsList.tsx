import { useEffect, useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { getBeans, getBrews, deleteBrew, Bean, Brew } from '../db';
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Slider } from "@heroui/slider";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";

export function BrewsList() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brews, setBrews] = useState<Brew[]>([]);
  const [filterMethod, setFilterMethod] = useState<string>('');
  const [filterBeanId, setFilterBeanId] = useState<string>('');
  const [filterRating, setFilterRating] = useState<number[]>([1, 5]);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [brewToDelete, setBrewToDelete] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getBeans(), getBrews()]).then(([fetchedBeans, fetchedBrews]) => {
      setBeans(fetchedBeans);
      setBrews(fetchedBrews);
    });
  }, []);

  const uniqueMethods = useMemo(() => {
    return Array.from(new Set(brews.map(b => b.method).filter(Boolean))).sort();
  }, [brews]);

  const filteredBrews = useMemo(() => {
    return brews.filter(brew => {
      if (filterMethod && brew.method !== filterMethod) return false;
      if (filterBeanId && !brew.beanIds.includes(Number(filterBeanId))) return false;
      if (brew.rating && (brew.rating < filterRating[0] || brew.rating > filterRating[1])) return false;
      return true;
    });
  }, [brews, filterMethod, filterBeanId, filterRating]);

  const getBeanNames = (beanIds: number[]) => {
    return beanIds
      .map(id => beans.find(b => b.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const confirmDelete = (brewId: number) => {
    setBrewToDelete(brewId);
    onOpen();
  };

  const handleDeleteBrew = async () => {
    if (brewToDelete === null) return;
    await deleteBrew(brewToDelete);
    const fetchedBrews = await getBrews();
    setBrews(fetchedBrews);
    setBrewToDelete(null);
    onOpenChange(); // Close modal
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Brews</h2>
        <Link to="/add-brew" search={{ fromId: undefined }}>
          <Button as="div" color="success" variant="solid" className="text-white">
            Add New Brew
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 flex-wrap items-center p-4 bg-content1 rounded-medium shadow-small">
        <Select 
            label="Method" 
            placeholder="Select a method"
            selectedKeys={filterMethod ? [filterMethod] : []}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="max-w-xs"
            size="sm"
        >
            {uniqueMethods.map(m => <SelectItem key={m}>{m}</SelectItem>)}
        </Select>
        <Select 
            label="Bean" 
            placeholder="Select a bean"
            selectedKeys={filterBeanId ? [filterBeanId] : []}
            onChange={(e) => setFilterBeanId(e.target.value)}
            className="max-w-xs"
            size="sm"
        >
            {beans.map(b => <SelectItem key={String(b.id)}>{b.name}</SelectItem>)}
        </Select>
        <div className="w-full max-w-xs px-2">
          <Slider 
            label="Rating Range"
            step={1} 
            minValue={1} 
            maxValue={5} 
            defaultValue={[1, 5]}
            value={filterRating}
            onChange={(val) => setFilterRating(val as number[])}
            className="max-w-md"
            size="sm"
          />
        </div>
        {(filterMethod || filterBeanId || filterRating[0] !== 1 || filterRating[1] !== 5) && (
            <Button 
                color="danger" 
                variant="light" 
                onPress={() => {
                    setFilterMethod('');
                    setFilterBeanId('');
                    setFilterRating([1, 5]);
                }}
            >
                Clear Filters
            </Button>
        )}
      </div>

      {filteredBrews.length === 0 ? (
        <p className="text-default-500">No brews found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredBrews.map((brew) => (
            <Card key={brew.id} className="w-full">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start pb-0 gap-4 sm:gap-0">
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold">{brew.method}</h3>
                  <p className="text-small text-default-500">{new Date(brew.date).toLocaleDateString()}</p>
                  {brew.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-small font-medium">{brew.rating}/5</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
                  <Link 
                    to="/edit-brew/$brewId" 
                    params={{ brewId: String(brew.id) }}
                  >
                    <Button size="sm" color="primary" variant="flat" as="div">Edit</Button>
                  </Link>
                  <Link 
                    to="/add-brew" 
                    search={{ fromId: brew.id }}
                  >
                    <Button size="sm" color="success" variant="flat" as="div">Duplicate</Button>
                  </Link>
                  <Button
                    onPress={() => confirmDelete(brew.id!)}
                    size="sm"
                    color="danger"
                    variant="flat"
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-small text-default-500 mb-2">
                  <strong>Beans:</strong> {getBeanNames(brew.beanIds)}
                </p>
                <div className="flex gap-2 mb-2">
                  <Chip size="sm" variant="flat">{brew.beanWeight}g beans</Chip>
                  <Chip size="sm" variant="flat">{brew.waterVolume}ml water</Chip>
                  <Chip size="sm" variant="flat">{brew.waterTemp}°C</Chip>
                </div>
                <div className="grid grid-cols-2 gap-2 text-small">
                    <div><strong>Grinder:</strong> {brew.grinder}</div>
                    <div><strong>Setting:</strong> {brew.grindSize}</div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete Brew</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this brew? This action cannot be undone.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteBrew}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
