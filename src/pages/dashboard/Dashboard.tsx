import {
  Grid,
  Paper,
  Text,
  Title,
  Group,
  RingProgress,
  Stack,
} from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IconCheck, IconX, IconAlertCircle } from "@tabler/icons-react";
import { reservationRows } from "./reservationData";
import { ReservationRow } from "./ReservationRow";

export function Dashboard() {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Dashboard</Title>
      </Group>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Group>
              <RingProgress
                size={80}
                roundCaps
                thickness={8}
                sections={[{ value: 65, color: "#1C5D66" }]}
                label={
                  <Text ta="center" size="xs" fw={700}>
                    65%
                  </Text>
                }
              />
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Parking Occupancy
                </Text>
                <Text fw={700} size="xl" className="text-primary">
                  65%
                </Text>
                <Text size="xs" c="dimmed">
                  This Month
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              Reservations
            </Text>
            <Text fw={700} size="xl" className="text-primary">
              20 Spots
            </Text>
            <Text size="xs" c="dimmed">
              50 Spots Available
            </Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              Free Spots
            </Text>
            <Text fw={700} size="xl" className="text-primary">
              53 Free
            </Text>
            <Text size="xs" c="dimmed">
              From 200 Spots
            </Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              Assigned Valets
            </Text>
            <Text fw={700} size="xl" className="text-primary">
              2 Valets
            </Text>
            <Text size="xs" c="dimmed">
              From 6 Valets
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="md" radius="md" h={300}>
            <Text fw={700} mb="xs">
              Revenue Generated
            </Text>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { name: "W1", revenue: 4000 },
                  { name: "W2", revenue: 9000 },
                  { name: "W3", revenue: 7000 },
                  { name: "W4", revenue: 10000 },
                  { name: "W5", revenue: 8000 },
                  { name: "W6", revenue: 9500 },
                  { name: "W7", revenue: 8500 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#1C5D66" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="md" radius="md" h={300}>
            <Group justify="space-between" mb="xs">
              <Text fw={700} className="text-primary">
                RESERVATIONS
              </Text>
              <Text
                size="sm"
                className="text-primary"
                style={{ cursor: "pointer" }}
              >
                VIEW ALL →
              </Text>
            </Group>
            <Group gap={0} mb="xs" align="center" style={{ minHeight: 32 }}>
              <Text
                w={120}
                fw={600}
                style={{ fontSize: 13 }}
                className="text-primary"
              >
                License Plate
              </Text>
              <Text
                w={140}
                fw={600}
                style={{ fontSize: 13 }}
                className="text-primary"
              >
                Phone Number
              </Text>
              <Text
                w={100}
                fw={600}
                style={{ fontSize: 13 }}
                className="text-primary"
              >
                Status
              </Text>
            </Group>
            <Stack gap={0} style={{ maxHeight: 160, overflowY: "auto" }}>
              {reservationRows.map((row, idx) => (
                <ReservationRow
                  key={row.licensePlate + row.phoneNumber + idx}
                  licensePlate={row.licensePlate}
                  phoneNumber={row.phoneNumber}
                  status={row.status as "Completed" | "Cancelled" | "Active"}
                />
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
