import { useEffect, useState, useRef } from "react";
import {
  Paper,
  Title,
  Table,
  Group,
  Stack,
  Button,
  Badge,
  Modal,
  Text,
} from "@mantine/core";
import type {
  Reservation,
  ReservationsResponse,
} from "../../api/reservationApi";
import { fetchReservations, deleteReservation } from "../../api/reservationApi";
import { fetchSpotById } from "../../api/spot";
import { IconEye, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [spotNames, setSpotNames] = useState<Record<string, string>>({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] =
    useState<Reservation | null>(null);
  const navigate = useNavigate();

  // Ref to allow fetchData to be called outside useEffect
  const fetchDataRef = useRef<() => Promise<void> | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }
      try {
        const data: ReservationsResponse = await fetchReservations(token);
        setReservations(data.reservations || []);
        // Fetch spot names for all unique spotIds (from spot[0]?.id or spotId)
        const uniqueSpotIds = Array.from(
          new Set(
            (data.reservations || []).map((r) =>
              r.spot && Array.isArray(r.spot) && r.spot.length > 0
                ? r.spot[0]?.id
                : r.spotId
            )
          )
        ).filter(Boolean);
        const spotNameMap: Record<string, string> = {};
        await Promise.all(
          uniqueSpotIds.map(async (spotId) => {
            if (!spotId) return;
            try {
              // Always use fetchSpotById from spot.ts
              const spot = await fetchSpotById(spotId, token);
              spotNameMap[spotId] = spot.name || "-";
            } catch {
              spotNameMap[spotId] = "-";
            }
          })
        );
        setSpotNames(spotNameMap);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch reservations."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDataRef.current = fetchData;
    fetchData();
  }, []);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Reservations</Title>
      </Group>
      <Paper withBorder radius="md">
        {loading && (
          <div className="text-blue-700 text-center py-4">
            Loading reservations...
          </div>
        )}
        {error && <div className="text-red-700 text-center py-4">{error}</div>}
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>License Plate</Table.Th>
              <Table.Th>Start Time</Table.Th>
              <Table.Th>End Time</Table.Th>
              <Table.Th>Spot Name</Table.Th>
              <Table.Th>Zone Id</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reservations.map((reservation) => {
              // Use reservation.spot for spot name and zone
              const spotName = reservation.spot?.name || "-";
              const zoneId = reservation.spot?.zone?.id || "-";
              const zoneName = reservation.spot?.zone?.name || "-";
              // Badge color logic
              let badgeColor: string = "gray";
              switch (reservation.status) {
                case "ACTIVE":
                  badgeColor = "blue";
                  break;
                case "COMPLETED":
                  badgeColor = "green";
                  break;
                case "CANCELLED":
                  badgeColor = "red";
                  break;
                case "PENDING":
                  badgeColor = "yellow";
                  break;
                default:
                  badgeColor = "gray";
              }
              return (
                <Table.Tr key={reservation.id}>
                  <Table.Td>{reservation.licensePlate}</Table.Td>
                  <Table.Td>
                    {new Date(reservation.startTime).toLocaleString()}
                  </Table.Td>
                  <Table.Td>
                    {new Date(reservation.endTime).toLocaleString()}
                  </Table.Td>
                  <Table.Td>{spotName}</Table.Td>
                  <Table.Td>{zoneName}</Table.Td>
                  <Table.Td>
                    <Badge color={badgeColor} variant="light" radius="sm">
                      {reservation.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        variant="subtle"
                        color="blue"
                        size="xs"
                        onClick={() => {
                          setSelectedReservation(reservation);
                          navigate("/reservations/detail", {
                            state: { reservation },
                          });
                        }}
                      >
                        <IconEye size={16} />
                      </Button>
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => {
                          setReservationToDelete(reservation);
                          setConfirmDeleteOpen(true);
                        }}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Paper>
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Reservation Details"
        centered
        size="lg"
      >
        {selectedReservation && (
          <Stack gap="xs">
            <Text>
              <b>Status:</b> {selectedReservation.status}
            </Text>
            <Text>
              <b>License Plate:</b> {selectedReservation.licensePlate}
            </Text>
            <Text>
              <b>Start Time:</b>{" "}
              {new Date(selectedReservation.startTime).toLocaleString()}
            </Text>
            <Text>
              <b>End Time:</b>{" "}
              {new Date(selectedReservation.endTime).toLocaleString()}
            </Text>
            <Text>
              <b>Spot Name:</b> {selectedReservation.spot?.name || "-"}
            </Text>
            <Text>
              <b>Spot Floor:</b> {selectedReservation.spot?.floor ?? "-"}
            </Text>
            <Text>
              <b>Spot Status:</b> {selectedReservation.spot?.status || "-"}
            </Text>
            <Text>
              <b>Zone:</b> {selectedReservation.spot?.zone?.name || "-"}
            </Text>
            <Text>
              <b>Vehicle:</b> {selectedReservation.vehicle?.make}{" "}
              {selectedReservation.vehicle?.model} (
              {selectedReservation.vehicle?.color})
            </Text>
            <Text>
              <b>Customer:</b> {selectedReservation.vehicle?.customer?.username}{" "}
              ({selectedReservation.vehicle?.customer?.email})
            </Text>
            <Text>
              <b>Created At:</b>{" "}
              {new Date(selectedReservation.createdAt).toLocaleString()}
            </Text>
            <Text>
              <b>Updated At:</b>{" "}
              {new Date(selectedReservation.updatedAt).toLocaleString()}
            </Text>
            {selectedReservation.cancelledAt && (
              <Text>
                <b>Cancelled At:</b>{" "}
                {new Date(selectedReservation.cancelledAt).toLocaleString()}
              </Text>
            )}
          </Stack>
        )}
      </Modal>
      <Modal
        opened={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete Reservation"
        centered
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete this reservation?</Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={async () => {
                if (!reservationToDelete) return;
                const token = localStorage.getItem("token");
                if (!token) {
                  setError("Not authenticated. Please log in again.");
                  setConfirmDeleteOpen(false);
                  return;
                }
                try {
                  await deleteReservation(reservationToDelete.id, token);
                  if (fetchDataRef.current) await fetchDataRef.current();
                } catch (err: any) {
                  if (err?.response?.status === 404) {
                    // Treat as success: already deleted/cancelled
                    if (fetchDataRef.current) await fetchDataRef.current();
                    setError(
                      "Reservation was already cancelled or not found. It has been removed from the list."
                    );
                  } else {
                    setError(
                      err?.response?.data?.message ||
                        err?.message ||
                        "Failed to delete reservation."
                    );
                  }
                } finally {
                  setConfirmDeleteOpen(false);
                  setReservationToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
