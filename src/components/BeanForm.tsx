import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { addBean, updateBean, Bean } from '../db';
import { getCountries } from '../utils/countries';
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";

export function BeanForm({ initialData }: { initialData?: Bean }) {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    getCountries().then(setCountries);
  }, []);
  
  const form = useForm({
    defaultValues: {
      type: (initialData?.type || 'single_origin') as 'single_origin' | 'blend',
      name: initialData?.name || '',
      countryOfOrigin: initialData?.countryOfOrigin || '',
      processingMethod: initialData?.processingMethod || '',
      roastery: initialData?.roastery || '',
      roastDate: initialData?.roastDate || '',
      tastingNotes: initialData?.tastingNotes || '',
      roastProfile: initialData?.roastProfile || '',
      growingElevation: initialData?.growingElevation || '',
      remarks: initialData?.remarks || ''
    },
    onSubmit: async ({ value }) => {
      if (initialData?.id) {
        await updateBean({ ...value, id: initialData.id });
      } else {
        await addBean(value);
      }
      navigate({ to: '/beans' });
    },
  });

  return (
    <Card className="max-w-[600px] mx-auto">
      <CardHeader>
        <h3 className="text-xl font-bold">{initialData ? 'Edit Bean' : 'Add New Bean'}</h3>
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
            name="name"
            children={(field) => (
              <Input
                label="Name"
                isRequired
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <form.Field
            name="type"
            children={(field) => (
              <Select
                label="Type"
                isRequired
                selectedKeys={[field.state.value]}
                onSelectionChange={(keys) => field.handleChange(Array.from(keys)[0] as 'single_origin' | 'blend')}
              >
                <SelectItem key="single_origin">Single Origin</SelectItem>
                <SelectItem key="blend">Blend</SelectItem>
              </Select>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.values.type]}
            children={([type]) => (
              <form.Field
                name="countryOfOrigin"
                children={(field) => {
                  const currentValue = field.state.value;
                  const showLegacyOption = currentValue && !countries.includes(currentValue);
                  
                  const items = countries.map(c => ({ key: c, label: c }));
                  if (showLegacyOption) {
                    items.unshift({ key: currentValue, label: currentValue });
                  }

                  return (
                    <Autocomplete
                      label="Country of Origin"
                      isDisabled={type === 'blend'}
                      selectedKey={field.state.value}
                      onSelectionChange={(key) => field.handleChange(key as string)}
                      defaultItems={items}
                      isRequired
                    >
                      {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
                    </Autocomplete>
                  );
                }}
              />
            )}
          />
          <form.Field
            name="processingMethod"
            children={(field) => (
              <Input
                label="Processing Method"
                isRequired
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <form.Field
            name="roastery"
            children={(field) => (
              <Input
                label="Roastery"
                isRequired
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <form.Field
            name="roastDate"
            children={(field) => (
              <Input
                type="date"
                label="Roast Date"
                isRequired
                name={field.name}
                value={field.state.value}
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
                isRequired
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <form.Field
            name="roastProfile"
            children={(field) => (
              <Input
                label="Roast Profile"
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <form.Field
            name="growingElevation"
            children={(field) => (
              <Input
                label="Growing Elevation"
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onValueChange={(val) => field.handleChange(val)}
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
            {initialData ? 'Update Bean' : 'Add Bean'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
