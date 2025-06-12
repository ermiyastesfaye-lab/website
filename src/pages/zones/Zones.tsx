import { useState } from 'react';
import { Paper, Title, Button, Table, Group, Modal, TextInput, NumberInput, Stack, Select, Tabs } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';

interface Zone {
  id: string;
  name: string;
  capacity: number;
  vehicleType: string;
  lotId: string;
  spots: Spot[];
}

interface Spot {
  id: string;
  name: string;
  number: number;
  floor: number;
  startingNumber: number;
}

export function Zones() {
  const [opened, { open, close }] = useDisclosure(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);

  const handleCreateZone = (values: any) => {
    // Add API call here
    const newZone: Zone = {
      id: Math.random().toString(36).substr(2, 9),
      name: values.name,
      capacity: values.capacity,
      vehicleType: values.vehicleType,
      lotId: selectedLot || '',
      spots: [],
    };
    setZones([...zones, newZone]);
    close();
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Parking Zones</Title>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={open}
          className="bg-primary hover:bg-primary/90"
        >
          Create Zone
        </Button>
      </Group>

      <Paper withBorder radius="md">
        <Tabs defaultValue="all">
          <Tabs.List>
            <Tabs.Tab value="all">All Zones</Tabs.Tab>
            <Tabs.Tab value="active">Active</Tabs.Tab>
            <Tabs.Tab value="inactive">Inactive</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Capacity</Table.Th>
                  <Table.Th>Vehicle Type</Table.Th>
                  <Table.Th>Spots</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {zones.map((zone) => (
                  <Table.Tr key={zone.id}>
                    <Table.Td>{zone.name}</Table.Td>
                    <Table.Td>{zone.capacity}</Table.Td>
                    <Table.Td>{zone.vehicleType}</Table.Td>
                    <Table.Td>{zone.spots.length}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button variant="light" size="xs">Edit</Button>
                        <Button variant="light" color="red" size="xs">Delete</Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Modal opened={opened} onClose={close} title="Create New Zone">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleCreateZone({
            name: formData.get('name'),
            capacity: formData.get('capacity'),
            vehicleType: formData.get('vehicleType'),
          });
        }}>
          <Stack>
            <Select
              label="Select Lot"
              placeholder="Choose a lot"
              data={[
                { value: 'lot1', label: 'Lot 1' },
                { value: 'lot2', label: 'Lot 2' },
              ]}
              value={selectedLot}
              onChange={setSelectedLot}
              required
            />
            <TextInput
              label="Zone Name"
              name="name"
              placeholder="Enter zone name"
              required
            />
            <NumberInput
              label="Capacity"
              name="capacity"
              placeholder="Enter capacity"
              required
            />
            <Select
              label="Vehicle Type"
              name="vehicleType"
              placeholder="Select vehicle type"
              data={[
                { value: 'car', label: 'Car' },
                { value: 'motorcycle', label: 'Motorcycle' },
                { value: 'truck', label: 'Truck' },
              ]}
              required
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Create Zone
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
} 