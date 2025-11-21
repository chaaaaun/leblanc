import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { addBrew, updateBrew, getBeans, Bean, Brew } from '../db';
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Slider } from "@heroui/slider";

export function BrewForm({ initialData }: { initialData?: Brew }) {
  const navigate = useNavigate();
  const [beans, setBeans] = useState<Bean[]>([]);

  useEffect(() => {
    getBeans().then(setBeans);
  }, []);

  const form = useForm({
    defaultValues: {
      beanIds: initialData?.beanIds || [0],
      date: initialData?.date || new Date().toISOString().split('T')[0],
      method: initialData?.method || 'Pour Over',
      brewer: initialData?.brewer || '',
      grinder: initialData?.grinder || '',
      beanWeight: initialData?.beanWeight || 0,
      grindSize: initialData?.grindSize || '',
      waterTemp: initialData?.waterTemp || 0,
      waterVolume: initialData?.waterVolume || 0,
      recipe: initialData?.recipe || '',
      tastingNotes: initialData?.tastingNotes || '',
      rating: initialData?.rating || 0,
      remarks: initialData?.remarks || ''
    },
    onSubmit: async ({ value }) => {
      // Filter out 0s (unselected)
      const validBeanIds = value.beanIds.filter(id => id !== 0).map(Number);
      
      if (validBeanIds.length === 0) {
        alert('Please select at least one bean');
        return;
      }

      const brewData = {
        ...value,
        beanIds: validBeanIds,
        beanWeight: Number(value.beanWeight),
        waterTemp: Number(value.waterTemp),
        waterVolume: Number(value.waterVolume)
      };

      if (initialData?.id) {
        await updateBrew({ ...brewData, id: initialData.id });
      } else {
        await addBrew(brewData);
      }
      navigate({ to: '/' });
    },
  });

  return (
    <Card className="max-w-[600px] mx-auto">
      <CardHeader>
        <h3 className="text-xl font-bold">{initialData?.id ? 'Edit Brew' : 'Add New Brew'}</h3>
      </CardHeader>
      <CardBody>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="beanIds"
            mode="array"
            children={(field) => (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Beans *</label>
                {field.state.value.map((_, i) => (
                  <form.Field
                    key={i}
                    name={`beanIds[${i}]`}
                    children={(subField) => (
                      <div className="flex gap-2 items-center">
                        <Select
                          aria-label="Select Bean"
                          placeholder="Select a bean"
                          selectedKeys={subField.state.value ? [String(subField.state.value)] : []}
                          onSelectionChange={(keys) => subField.handleChange(Number(Array.from(keys)[0]))}
                          className="flex-1"
                        >
                          {beans.map((bean) => {
                            const isSelected = field.state.value.some((val, idx) => idx !== i && val === bean.id);
                            return (
                              <SelectItem 
                                key={String(bean.id)} 
                                textValue={`${bean.name} (${bean.roastery})`}
                                isDisabled={isSelected}
                              >
                                {bean.name} ({bean.roastery}) {isSelected ? '(Selected)' : ''}
                              </SelectItem>
                            );
                          })}
                        </Select>
                        {field.state.value.length > 1 && (
                          <Button 
                            isIconOnly
                            color="danger"
                            variant="flat"
                            onPress={() => field.removeValue(i)}
                            size="sm"
                          >
                            X
                          </Button>
                        )}
                      </div>
                    )}
                  />
                ))}
                <Button 
                  variant="flat" 
                  onPress={() => field.pushValue(0)}
                  size="sm"
                  className="self-start"
                >
                  + Add another bean
                </Button>
              </div>
            )}
          />

          <form.Field
            name="date"
            children={(field) => (
              <Input
                type="date"
                label="Date"
                isRequired
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <form.Field
            name="method"
            children={(field) => (
              <Select
                label="Brew Method"
                isRequired
                selectedKeys={[field.state.value]}
                onSelectionChange={(keys) => field.handleChange(Array.from(keys)[0] as string)}
              >
                <SelectItem key="Pour Over">Pour Over</SelectItem>
                <SelectItem key="Espresso">Espresso</SelectItem>
                <SelectItem key="French Press">French Press</SelectItem>
                <SelectItem key="Aeropress">Aeropress</SelectItem>
                <SelectItem key="Moka Pot">Moka Pot</SelectItem>
                <SelectItem key="Cold Brew">Cold Brew</SelectItem>
                <SelectItem key="Drip">Drip</SelectItem>
              </Select>
            )}
          />

      <form.Field
            name="brewer"
            children={(field) => (
              <Input
                label="Brewer"
                isRequired
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <form.Field
            name="grinder"
            children={(field) => (
              <Input
                label="Grinder"
                isRequired
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <div className="flex gap-4">
            <form.Field
              name="beanWeight"
              children={(field) => (
                <Input
                  type="number"
                  label="Bean Weight (g)"
                  isRequired
                  name={field.name}
                  value={String(field.state.value)}
                  onBlur={field.handleBlur}
                  onValueChange={(val) => field.handleChange(Number(val))}
                  className="flex-1"
                />
              )}
            />

            <form.Field
              name="grindSize"
              children={(field) => (
                <Input
                  label="Grind Size"
                  isRequired
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onValueChange={(val) => field.handleChange(val)}
                  className="flex-1"
                />
              )}
            />
          </div>

          <div className="flex gap-4">
            <form.Field
              name="waterTemp"
              children={(field) => (
                <Input
                  type="number"
                  label="Water Temp (°C)"
                  isRequired
                  name={field.name}
                  value={String(field.state.value)}
                  onBlur={field.handleBlur}
                  onValueChange={(val) => field.handleChange(Number(val))}
                  className="flex-1"
                />
              )}
            />

            <form.Field
              name="waterVolume"
              children={(field) => (
                <Input
                  type="number"
                  label="Water Volume (ml)"
                  isRequired
                  name={field.name}
                  value={String(field.state.value)}
                  onBlur={field.handleBlur}
                  onValueChange={(val) => field.handleChange(Number(val))}
                  className="flex-1"
                />
              )}
            />
          </div>

          <form.Field
            name="recipe"
            children={(field) => (
              <Textarea
                label="Recipe"
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <form.Field
            name="tastingNotes"
            children={(field) => (
              <Textarea
                label="Tasting Notes"
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <form.Field
            name="rating"
            children={(field) => (
              <Slider
                label="Rating"
                step={1}
                maxValue={5}
                minValue={1}
                defaultValue={3}
                value={field.state.value || 3}
                onChange={(val) => field.handleChange(val as number)}
                className="max-w-md"
                showSteps={true}
                marks={[
                  { value: 1, label: "1" },
                  { value: 2, label: "2" },
                  { value: 3, label: "3" },
                  { value: 4, label: "4" },
                  { value: 5, label: "5" },
                ]}
              />
            )}
          />

          <form.Field
            name="remarks"
            children={(field) => (
              <Textarea
                label="Remarks"
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <Button type="submit" color="primary" className="mt-4">
            {initialData?.id ? 'Update Brew' : 'Add Brew'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

