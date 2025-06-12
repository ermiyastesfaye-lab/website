import { useState } from 'react';
import { Paper, Title, Button, Table, Group, Modal, TextInput, Stack, Tabs, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCar } from '@tabler/icons-react';

interface Vehicle {
  id: string;
  licensePlate: string;
  phoneNumber: string;
  lotId?: string;
  zoneId?: string;
  model?: string;
  color?: string;
  make?: string;
}

export function Vehicles() {
  const [entryOpened, { open: openEntry, close: closeEntry }] = useDisclosure(false);
  const [exitOpened, { open: openExit, close: closeExit }] = useDisclosure(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const handleVehicleEntry = (values: any) => {
    // Add API call here
    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      licensePlate: values.licensePlate,
      phoneNumber: values.phoneNumber,
      lotId: values.lotId,
    };
    setVehicles([...vehicles, newVehicle]);
    closeEntry();
  };

  const handleVehicleExit = (values: any) => {
    // Add API call here
    const vehicle = vehicles.find(v => v.phoneNumber === values.phoneNumber);
    if (vehicle) {
      setVehicles(vehicles.filter(v => v.id !== vehicle.id));
    }
    closeExit();
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Vehicle Management</Title>
        <Group>
          <Button 
            leftSection={<IconCar size={16} />}
            onClick={openEntry}
            className="bg-primary hover:bg-primary/90"
          >
            Vehicle Entry
          </Button>
          <Button 
            leftSection={<IconCar size={16} />}
            onClick={openExit}
            variant="light"
            color="red"
          >
            Vehicle Exit
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md">
        <Tabs defaultValue="all">
          <Tabs.List>
            <Tabs.Tab value="all">All Vehicles</Tabs.Tab>
            <Tabs.Tab value="parked">Currently Parked</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>License Plate</Table.Th>
                  <Table.Th>Phone Number</Table.Th>
                  <Table.Th>Lot</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {vehicles.map((vehicle) => (
                  <Table.Tr key={vehicle.id}>
                    <Table.Td>{vehicle.licensePlate}</Table.Td>
                    <Table.Td>{vehicle.phoneNumber}</Table.Td>
                    <Table.Td>{vehicle.lotId}</Table.Td>
                    <Table.Td>Parked</Table.Td>
                    <Table.Td>
                      <Button variant="light" size="xs">Details</Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Modal opened={entryOpened} onClose={closeEntry} title="Vehicle Entry">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleVehicleEntry({
            licensePlate: formData.get('licensePlate'),
            phoneNumber: formData.get('phoneNumber'),
            lotId: formData.get('lotId'),
          });
        }}>
          <Stack>
            <TextInput
              label="License Plate"
              name="licensePlate"
              placeholder="Enter license plate"
              required
            />
            <TextInput
              label="Phone Number"
              name="phoneNumber"
              placeholder="Enter phone number"
              required
            />
            <Select
              label="Select Lot"
              name="lotId"
              placeholder="Choose a lot"
              data={[
                { value: 'lot1', label: 'Lot 1' },
                { value: 'lot2', label: 'Lot 2' },
              ]}
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Record Entry
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={exitOpened} onClose={closeExit} title="Vehicle Exit">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleVehicleExit({
            phoneNumber: formData.get('phoneNumber'),
          });
        }}>
          <Stack>
            <TextInput
              label="Phone Number"
              name="phoneNumber"
              placeholder="Enter phone number"
              required
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Record Exit
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
} 