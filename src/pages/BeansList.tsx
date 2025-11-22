import { useEffect, useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { getBeans, deleteBean, deleteBrew, getBrewsByBeanId, Bean } from '../db';
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";

export function BeansList() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterProcess, setFilterProcess] = useState<string>('');
  const [filterRoastery, setFilterRoastery] = useState<string>('');

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [beanToDelete, setBeanToDelete] = useState<number | null>(null);
  const [associatedBrewsCount, setAssociatedBrewsCount] = useState<number>(0);

  useEffect(() => {
    getBeans().then(setBeans);
  }, []);

  const uniqueRoasteries = useMemo(() => {
    return Array.from(new Set(beans.map(b => b.roastery).filter(Boolean))).sort();
  }, [beans]);

  const uniqueProcesses = useMemo(() => {
    return Array.from(new Set(beans.map(b => b.processingMethod).filter(Boolean))).sort();
  }, [beans]);

  const filteredBeans = useMemo(() => {
    return beans.filter(bean => {
      if (filterType && bean.type !== filterType) return false;
      if (filterCountry && !bean.countryOfOrigin?.toLowerCase().includes(filterCountry.toLowerCase())) return false;
      if (filterProcess && bean.processingMethod !== filterProcess) return false;
      if (filterRoastery && bean.roastery !== filterRoastery) return false;
      return true;
    });
  }, [beans, filterType, filterCountry, filterProcess, filterRoastery]);

  const confirmDelete = async (beanId: number) => {
    const associatedBrews = await getBrewsByBeanId(beanId);
    setAssociatedBrewsCount(associatedBrews.length);
    setBeanToDelete(beanId);
    onOpen();
  };

  const handleDeleteBean = async () => {
    if (beanToDelete === null) return;

    if (associatedBrewsCount > 0) {
      const associatedBrews = await getBrewsByBeanId(beanToDelete);
      await Promise.all(associatedBrews.map(brew => deleteBrew(brew.id!)));
    }

    await deleteBean(beanToDelete);
    const fetchedBeans = await getBeans();
    setBeans(fetchedBeans);
    setBeanToDelete(null);
    onOpenChange(); // Close modal
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Beans</h2>
        <Link to="/add">
          <Button as="div" color="primary" variant="solid">
            Add New Bean
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 flex-wrap items-center p-4 bg-content1 rounded-medium shadow-small">
        <Select 
            label="Type" 
            placeholder="All Types"
            selectedKeys={filterType ? [filterType] : []}
            onChange={(e) => setFilterType(e.target.value)}
            className="max-w-xs"
            size="sm"
        >
            <SelectItem key="single_origin">Single Origin</SelectItem>
            <SelectItem key="blend">Blend</SelectItem>
        </Select>
        <Input 
            placeholder="Filter Country..." 
            value={filterCountry} 
            onValueChange={setFilterCountry}
            className="max-w-xs"
            size="sm"
        />
        <Select 
            label="Roastery" 
            placeholder="All Roasteries"
            selectedKeys={filterRoastery ? [filterRoastery] : []}
            onChange={(e) => setFilterRoastery(e.target.value)}
            className="max-w-xs"
            size="sm"
        >
            {uniqueRoasteries.map(r => <SelectItem key={r}>{r}</SelectItem>)}
        </Select>
        <Select 
            label="Process" 
            placeholder="All Processes"
            selectedKeys={filterProcess ? [filterProcess] : []}
            onChange={(e) => setFilterProcess(e.target.value)}
            className="max-w-xs"
            size="sm"
        >
            {uniqueProcesses.map(p => <SelectItem key={p}>{p}</SelectItem>)}
        </Select>
        {(filterType || filterCountry || filterRoastery || filterProcess) && (
            <Button 
                color="danger" 
                variant="light" 
                onPress={() => {
                    setFilterType('');
                    setFilterCountry('');
                    setFilterRoastery('');
                    setFilterProcess('');
                }}
            >
                Clear Filters
            </Button>
        )}
      </div>
      
      {filteredBeans.length === 0 ? (
        <p className="text-default-500">No beans found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBeans.map((bean) => (
            <Card key={bean.id} className="w-full">
              <CardHeader className="flex justify-between items-start pb-0">
                <h3 className="text-lg font-bold">{bean.name}</h3>
                <div className="flex gap-2">
                  <Link 
                    to="/edit/$beanId" 
                    params={{ beanId: String(bean.id) }}
                  >
                    <Button size="sm" color="primary" variant="flat" as="div">Edit</Button>
                  </Link>
                  <Button
                    onPress={() => confirmDelete(bean.id!)}
                    size="sm"
                    color="danger"
                    variant="flat"
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-small text-default-500 mb-2">{bean.roastery}</p>
                <div className="flex gap-2 mb-2 flex-wrap">
                    <Chip size="sm" variant="flat" color="default">
                        {bean.type === 'single_origin' ? 'Single Origin' : 'Blend'}
                    </Chip>
                    {bean.countryOfOrigin && (
                        <Chip size="sm" variant="flat" color="primary">
                            {bean.countryOfOrigin}
                        </Chip>
                    )}
                </div>
                <p className="text-small mt-2"><strong>Notes:</strong> {bean.tastingNotes}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete Bean</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this bean?</p>
                {associatedBrewsCount > 0 && (
                  <p className="text-danger">
                    Warning: This bean is used in {associatedBrewsCount} brew(s). 
                    Deleting it will also delete these brews.
                  </p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteBean}>
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
