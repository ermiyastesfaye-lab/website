import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Button,
  TextInput,
  Select,
  Group,
  Stack,
  Notification,
  Divider,
  Badge,
} from "@mantine/core";
import {
  IconCar,
  IconMapPin,
  IconClock,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
} from "@tabler/icons-react";
import { fetchLots } from "../../api/lots";
import type { Lot } from "../../api/lots";

interface Reservation {
  id: string;
  licensePlate: string;
  lotId: string;
  lotName: string;
  type: "entry" | "exit";
  timestamp: Date;
}

export default function WalkInReservation() {
  const [reservationType, setReservationType] = useState<"entry" | "exit">(
    "entry"
  );
  const [licensePlate, setLicensePlate] = useState("");
  const [selectedLot, setSelectedLot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{ licensePlate?: string; lot?: string }>(
    {}
  );
  const [recentReservations, setRecentReservations] = useState<Reservation[]>(
    []
  );
  const [lots, setLots] = useState<Lot[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchLots(token)
      .then((data) => setLots(data))
      .catch(() => setLots([]));
  }, []);

  const validateForm = () => {
    const newErrors: { licensePlate?: string; lot?: string } = {};
    if (!licensePlate.trim()) {
      newErrors.licensePlate = "License plate is required";
    } else if (!/^[A-Z0-9]{2,8}$/i.test(licensePlate.replace(/[-\s]/g, ""))) {
      newErrors.licensePlate = "Please enter a valid license plate";
    }
    if (!selectedLot) {
      newErrors.lot = "Please select a parking lot";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const selectedLotData = lots.find((lot) => lot.id === selectedLot);
    const newReservation: Reservation = {
      id: `RES${Date.now()}`,
      licensePlate,
      lotId: selectedLot,
      lotName: selectedLotData?.name || "",
      type: reservationType,
      timestamp: new Date(),
    };
    setRecentReservations((prev) => [newReservation, ...prev.slice(0, 4)]);
    setIsSubmitting(false);
    setShowSuccess(true);
    setLicensePlate("");
    setSelectedLot("");
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const formatLicensePlate = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}${cleaned.slice(
      6,
      8
    )}`;
  };

  return (
    <Group
      align="flex-start"
      justify="center"
      style={{ minHeight: "100vh", background: "#f8fafc" }}
    >
      <Paper
        withBorder
        radius="md"
        p={32}
        style={{ maxWidth: 520, width: "100%", marginTop: 40 }}
        shadow="md"
      >
        <Title
          order={2}
          ta="center"
          mb={4}
          mt={67}
          style={{ color: "#1C5D66" }}
        >
          Walk-in Reservation
        </Title>
        <div style={{ textAlign: "center", color: "#666", marginBottom: 24 }}>
          Register a new entry or exit for a walk-in customer
        </div>
        {showSuccess && (
          <Notification
            color="green"
            icon={<IconCheck size={18} />}
            mb={16}
            onClose={() => setShowSuccess(false)}
          >
            Reservation confirmed successfully!
          </Notification>
        )}
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {" "}
            <Group grow>
              <Button
                leftSection={<IconArrowRight size={18} />}
                color={reservationType === "entry" ? "#1C5D66" : "#1C5D66"}
                variant={reservationType === "entry" ? "filled" : "light"}
                onClick={(e) => {
                  e.preventDefault();
                  setReservationType("entry");
                }}
                style={{ fontWeight: 600 }}
                type="button"
              >
                Entry
              </Button>
              <Button
                leftSection={<IconArrowLeft size={18} />}
                color={reservationType === "exit" ? "#E0994B" : "gray"}
                variant={reservationType === "exit" ? "filled" : "light"}
                onClick={(e) => {
                  e.preventDefault();
                  setReservationType("exit");
                }}
                style={{ fontWeight: 600 }}
                type="button"
              >
                Exit
              </Button>
            </Group>
            <TextInput
              label="License Plate Number"
              placeholder="ABC-123"
              value={licensePlate}
              onChange={(e) =>
                setLicensePlate(formatLicensePlate(e.target.value))
              }
              leftSection={<IconCar size={18} />}
              error={errors.licensePlate}
              maxLength={8}
              required
            />
            <Select
              label="Parking Lot"
              placeholder="Select a parking lot"
              data={lots.map((lot: Lot) => ({
                value: lot.id,
                label: `${lot.name} - ${
                  typeof lot.location === "string" ? lot.location : ""
                } (${lot.capacity} capacity)`,
              }))}
              value={selectedLot}
              onChange={(val) => setSelectedLot(val || "")}
              leftSection={<IconMapPin size={18} />}
              error={errors.lot}
              required
              searchable
            />
            {selectedLot && (
              <Paper
                withBorder
                radius="md"
                p="sm"
                style={{ background: "#f8fafc" }}
              >
                {(() => {
                  const lot = lots.find((l: Lot) => l.id === selectedLot);
                  if (!lot) return null;
                  return (
                    <Group>
                      <div>
                        <div style={{ fontWeight: 600 }}>{lot.name}</div>
                        <div style={{ fontSize: 13, color: "#666" }}>
                          <IconMapPin
                            size={14}
                            style={{ marginRight: 4, verticalAlign: "middle" }}
                          />
                          {typeof lot.location === "string" ? lot.location : ""}
                        </div>
                      </div>
                      <Badge color="#1C5D66">{lot.capacity} capacity</Badge>
                    </Group>
                  );
                })()}
              </Paper>
            )}
            <Button
              type="submit"
              color={reservationType === "entry" ? "#1C5D66" : "#E0994B"}
              fullWidth
              loading={isSubmitting}
              style={{ fontWeight: 700 }}
            >
              Confirm {reservationType === "entry" ? "Entry" : "Exit"}{" "}
              Reservation
            </Button>
          </Stack>
        </form>
      </Paper>
      <div
        style={{ minWidth: 320, maxWidth: 360, width: "100%", marginTop: 40 }}
      >
        <Paper withBorder radius="md" p={20} shadow="md" mb={24}>
          <Group mb={8}>
            <IconClock size={18} color="#1C5D66" />
            <Title order={4} style={{ color: "#1C5D66" }}>
              Recent Reservations
            </Title>
          </Group>
          <Divider mb={8} />
          {recentReservations.length === 0 ? (
            <div style={{ color: "#888", textAlign: "center", padding: 24 }}>
              No recent reservations
            </div>
          ) : (
            <Stack gap={8}>
              {recentReservations.map((reservation) => (
                <Paper
                  key={reservation.id}
                  radius="md"
                  p="xs"
                  style={{ background: "#f8fafc" }}
                >
                  <Group mb={2}>
                    <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
                      {reservation.licensePlate}
                    </span>
                    <Badge
                      color={reservation.type === "entry" ? "green" : "red"}
                    >
                      {reservation.type}
                    </Badge>
                  </Group>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    {reservation.lotName}
                  </div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>
                    {reservation.timestamp.toLocaleTimeString()}
                  </div>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
        <Paper withBorder radius="md" p={20} shadow="md">
          <Title order={5} mb={8} style={{ color: "#1C5D66" }}>
            Lot Availability
          </Title>
          <Divider mb={8} />
          <Stack gap={8}>
            {lots.slice(0, 4).map((lot: Lot) => (
              <Group key={lot.id}>
                <div>
                  <div style={{ fontWeight: 600 }}>{lot.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{lot.id}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#1C5D66",
                    }}
                  >
                    {lot.capacity}
                  </span>
                  <div style={{ fontSize: 11, color: "#aaa" }}>capacity</div>
                </div>
              </Group>
            ))}
          </Stack>
        </Paper>
      </div>
    </Group>
  );
}
