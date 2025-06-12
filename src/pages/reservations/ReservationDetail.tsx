import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Title, Group, Badge, Button, Text, Stack, Modal } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Reservation } from "../../api/reservationApi";

export default function ReservationDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const reservation: Reservation | undefined = location.state?.reservation;
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!reservation) {
    return (
      <Stack align="center" justify="center" style={{ minHeight: "60vh" }}>
        <Title order={3} c="red">
          Reservation not found
        </Title>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Stack>
    );
  }

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
    <div style={{ maxWidth: 700, margin: "12px auto 0 80px", padding: 0 }}>
      <Group justify="flex-start" mb="xl">
        <Button
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate(-1)}
          size="md"
          style={{
            background: "#1C5D66",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 8,
            boxShadow: "0 2px 8px 0 rgba(28,93,102,0.08)",
          }}
        >
          Back
        </Button>
      </Group>
      <Title
        order={2}
        mb="lg"
        style={{
          color: "#1C5D66",
          fontWeight: 700,
          letterSpacing: 1,
          textAlign: "left",
        }}
      >
        Reservation Details
      </Title>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px 48px",
          borderRadius: 16,
          padding: "8px 32px",
          border: "none",
          position: "relative",
        }}
      >
        <div>
          <Text size="lg" fw={700} style={{ color: "#334155" }}>
            Status
          </Text>
          <Badge
            color={badgeColor}
            variant="filled"
            radius="md"
            size="md"
            style={{
              fontSize: 12,
              padding: "8px 16px",
            }}
          >
            {reservation.status}
          </Badge>
        </div>
        <div>
          <Text c="#64748b" size="sm">
            License Plate
          </Text>
          <Text fw={600} size="lg">
            {reservation.licensePlate}
          </Text>
        </div>
        <div>
          <Text c="#64748b" size="sm">
            Start Time
          </Text>
          <Text fw={600} size="lg">
            {new Date(reservation.startTime).toLocaleString()}
          </Text>
        </div>
        <div>
          <Text c="#64748b" size="sm">
            End Time
          </Text>
          <Text fw={600} size="lg">
            {new Date(reservation.endTime).toLocaleString()}
          </Text>
        </div>
        <div>
          <Text c="#64748b" size="sm">
            Spot Name
          </Text>
          <Text fw={600} size="lg">
            {reservation.spot?.name || "-"}
          </Text>
        </div>
        <div>
          <Text c="#64748b" size="sm">
            Spot Floor
          </Text>
          <Text fw={600} size="lg">
            {reservation.spot?.floor ?? "-"}
          </Text>
        </div>
        <div>
          <Text c="#64748b" size="sm">
            Spot Status
          </Text>
          <Text fw={600} size="lg">
            {reservation.spot?.status || "-"}
          </Text>
        </div>
        <div>
          <Text c="#64748b" size="sm">
            Zone
          </Text>
          <Text fw={600} size="lg">
            {reservation.spot?.zone?.name || "-"}
          </Text>
        </div>
        <div>
          <Text c="#64748b" size="sm">
            Vehicle
          </Text>
          <Text fw={600} size="lg">
            {reservation.vehicle?.make} {reservation.vehicle?.model} (
            {reservation.vehicle?.color})
          </Text>
        </div>
        <div>
          <Text c="#64748b" size="sm">
            Customer
          </Text>
          <Text fw={600} size="lg">
            {reservation.vehicle?.customer?.username} (
            {reservation.vehicle?.customer?.email})
          </Text>
        </div>
        <div>
          <Text c="#64748b" size="sm">
            Created At
          </Text>
          <Text fw={600} size="lg">
            {new Date(reservation.createdAt).toLocaleString()}
          </Text>
        </div>
        {reservation.cancelledAt && (
          <div style={{ gridColumn: "1 / span 2" }}>
            <Text c="#64748b" size="sm">
              Cancelled At
            </Text>
            <Text fw={600} size="lg">
              {new Date(reservation.cancelledAt).toLocaleString()}
            </Text>
          </div>
        )}
      </div>
      <Button
        color="red"
        size="md"
        style={{
          gridColumn: "2",
          justifySelf: "start",
          marginTop: 32,
          fontWeight: 600,
          marginLeft: "32px",
          padding: "5px 30px",
        }}
        onClick={() => setConfirmDeleteOpen(true)}
        disabled={deleting}
      >
        Delete
      </Button>
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
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleting}
              onClick={async () => {
                setDeleting(true);
                const token = localStorage.getItem("token");
                if (!token) {
                  setDeleting(false);
                  setConfirmDeleteOpen(false);
                  return;
                }
                try {
                  await import("../../api/reservationApi").then(
                    ({ deleteReservation }) =>
                      deleteReservation(reservation.id, token)
                  );
                  setConfirmDeleteOpen(false);
                  navigate("/reservations");
                } catch (err) {
                  alert("Failed to delete reservation.");
                } finally {
                  setDeleting(false);
                }
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
