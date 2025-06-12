import React, { useState } from "react";
import {
  Paper,
  Title,
  TextInput,
  Select,
  Table,
  Group,
  Button,
  Stack,
  Pagination,
  Loader,
} from "@mantine/core";
import { useAlertsPolling } from "../../api/alerts";
import { fetchLots, type Lot } from "../../api/lots";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "expired", label: "Expired" },
  { value: "active", label: "Active" },
];

export default function AlertsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<string>("all");

  const token = localStorage.getItem("token") || undefined;

  // Fetch lots for dropdown
  React.useEffect(() => {
    const fetchAllLots = async () => {
      if (!token) return;
      try {
        const lotsData = await fetchLots(token);
        setLots(Array.isArray(lotsData) ? lotsData : []);
      } catch {
        setLots([]);
      }
    };
    fetchAllLots();
  }, [token]);

  // Custom polling for alerts with lotId as query
  const { alerts: safeAlerts, loading } = useAlertsPolling(
    token || "",
    60000,
    selectedLot === "all" ? undefined : selectedLot
  );

  // Debug: print filter state and received alerts
  console.log("AlertsPage filter state:", {
    search,
    status,
    page,
    perPage,
    selectedLot,
    receivedAlerts: safeAlerts,
  });

  // Defensive: ensure alerts is always an array
  const filtered = Array.isArray(safeAlerts)
    ? safeAlerts.filter((a) => {
        const matchesSearch =
          search === "" ||
          a.value?.reservationNumber?.toString().includes(search) ||
          a.value?.customerName?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          status === "all" || a.type.toLowerCase() === status.toLowerCase();
        return matchesSearch && matchesStatus;
      })
    : [];
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={2}>Alerts</Title>
      </Group>
      <Paper withBorder p="md" radius="md">
        <Group mb="md">
          <TextInput
            placeholder="Search by reservation or customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            data={[
              { value: "all", label: "All" },
              ...lots.map((lot) => ({ value: lot.id, label: lot.name })),
            ]}
            value={selectedLot}
            onChange={(val) => setSelectedLot(val || "all")}
            style={{ width: 180 }}
            placeholder="Filter by lot"
            clearable={false}
          />
        </Group>
        {loading ? (
          <Loader />
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Reservation</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginated.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4} style={{ textAlign: "center" }}>
                    No alerts found.
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginated.map((alert) => (
                  <Table.Tr key={alert.id}>
                    <Table.Td>
                      {alert.value?.reservationNumber || alert.reservationId}
                    </Table.Td>
                    <Table.Td>
                      {alert.value?.customerName || alert.customerId}
                    </Table.Td>
                    <Table.Td
                      style={{
                        color: alert.type === "expired" ? "#b91c1c" : "#1C5D66",
                        fontWeight: 600,
                      }}
                    >
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                    </Table.Td>
                    <Table.Td>
                      {new Date(alert.createdAt).toLocaleString()}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        )}
        <Group justify="end" mt="md">
          <Pagination
            total={Math.ceil(filtered.length / perPage)}
            value={page}
            onChange={setPage}
          />
        </Group>
      </Paper>
    </Stack>
  );
}
