// import { useState } from 'react';
// import { Paper, Title, Button, Table, Group, Modal, TextInput, NumberInput, Stack, Select } from '@mantine/core';
// import { useDisclosure } from '@mantine/hooks';
// import { IconPlus } from '@tabler/icons-react';

// interface Spot {
//   id: string;
//   name: string;
//   number: number;
//   floor: number;
//   startingNumber: number;
//   zoneId: string;
// }

// export function Spots() {
//   const [opened, { open, close }] = useDisclosure(false);
//   const [spots, setSpots] = useState<Spot[]>([]);
//   const [selectedZone, setSelectedZone] = useState<string | null>(null);

//   const handleCreateSpot = (values: any) => {
//     // Add API call here
//     const newSpot: Spot = {
//       id: Math.random().toString(36).substr(2, 9),
//       name: values.name,
//       number: values.number,
//       floor: values.floor,
//       startingNumber: values.startingNumber,
//       zoneId: selectedZone || '',
//     };
//     setSpots([...spots, newSpot]);
//     close();
//   };

//   return (
//     <Stack gap="lg">
//       <Group justify="space-between">
//         <Title order={2}>Parking Spots</Title>
//         <Button
//           leftSection={<IconPlus size={16} />}
//           onClick={open}
//           className="bg-primary hover:bg-primary/90"
//         >
//           Create Spot
//         </Button>
//       </Group>

//       <Paper withBorder radius="md">
//         <Table>
//           <Table.Thead>
//             <Table.Tr>
//               <Table.Th>Name</Table.Th>
//               <Table.Th>Number</Table.Th>
//               <Table.Th>Floor</Table.Th>
//               <Table.Th>Starting Number</Table.Th>
//               <Table.Th>Zone</Table.Th>
//               <Table.Th>Actions</Table.Th>
//             </Table.Tr>
//           </Table.Thead>
//           <Table.Tbody>
//             {spots.map((spot) => (
//               <Table.Tr key={spot.id}>
//                 <Table.Td>{spot.name}</Table.Td>
//                 <Table.Td>{spot.number}</Table.Td>
//                 <Table.Td>{spot.floor}</Table.Td>
//                 <Table.Td>{spot.startingNumber}</Table.Td>
//                 <Table.Td>{spot.zoneId}</Table.Td>
//                 <Table.Td>
//                   <Group gap="xs">
//                     <Button variant="light" size="xs">Edit</Button>
//                     <Button variant="light" color="red" size="xs">Delete</Button>
//                   </Group>
//                 </Table.Td>
//               </Table.Tr>
//             ))}
//           </Table.Tbody>
//         </Table>
//       </Paper>

//       <Modal opened={opened} onClose={close} title="Create New Spot">
//         <form onSubmit={(e) => {
//           e.preventDefault();
//           const formData = new FormData(e.currentTarget);
//           handleCreateSpot({
//             name: formData.get('name'),
//             number: formData.get('number'),
//             floor: formData.get('floor'),
//             startingNumber: formData.get('startingNumber'),
//           });
//         }}>
//           <Stack>
//             <Select
//               label="Select Zone"
//               placeholder="Choose a zone"
//               data={[
//                 { value: 'zone1', label: 'Zone 1' },
//                 { value: 'zone2', label: 'Zone 2' },
//               ]}
//               value={selectedZone}
//               onChange={setSelectedZone}
//               required
//             />
//             <TextInput
//               label="Spot Name"
//               name="name"
//               placeholder="Enter spot name"
//               required
//             />
//             <NumberInput
//               label="Number"
//               name="number"
//               placeholder="Enter spot number"
//               required
//             />
//             <NumberInput
//               label="Floor"
//               name="floor"
//               placeholder="Enter floor number"
//               required
//             />
//             <NumberInput
//               label="Starting Number"
//               name="startingNumber"
//               placeholder="Enter starting number"
//               required
//             />
//             <Button type="submit" className="bg-primary hover:bg-primary/90">
//               Create Spot
//             </Button>
//           </Stack>
//         </form>
//       </Modal>
//     </Stack>
//   );
// }
