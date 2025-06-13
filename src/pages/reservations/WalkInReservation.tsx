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
  Switch,
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
import { fetchZones } from "../../api/Zone";
import {
  walkInEntry,
  reservationEntry,
  walkInExit,
  reservationExit,
} from "../../api/walkInReservation";
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
  const [errors, setErrors] = useState<{ lot?: string }>({});
  const [recentReservations, setRecentReservations] = useState<Reservation[]>(
    []
  );
  const [lots, setLots] = useState<Lot[]>([]);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [vehicle, setVehicle] = useState({ make: "", model: "", color: "" });
  const [zoneId, setZoneId] = useState("");
  const [zones, setZones] = useState<{ id: string; name: string }[]>([]);
  const [exitIsWalkIn, setExitIsWalkIn] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchLots(token)
      .then((data) => setLots(data))
      .catch(() => setLots([]));
  }, []);

  useEffect(() => {
    if (selectedLot) {
      const token = localStorage.getItem("token");
      if (!token) return;
      fetchZones(selectedLot, token)
        .then((data) => setZones(data))
        .catch(() => setZones([]));
    } else {
      setZones([]);
      setZoneId("");
    }
  }, [selectedLot]);

  const validateForm = () => {
    const newErrors: { lot?: string } = {};
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
    setErrors({});
    try {
      let response;
      if (reservationType === "entry") {
        if (showVehicleDetails) {
          response = await walkInEntry({
            zoneId,
            lotId: selectedLot,
            licensePlate,
            vehicle,
          });
          console.log("walkInEntry response:", response);
          // Check for a success indicator in the response
          if (!response || response.error || response.success === false) {
            throw new Error(response?.message || "Walk-in entry failed.");
          }
        } else {
          response = await reservationEntry({
            licensePlate,
            lotId: selectedLot,
          });
          console.log("reservationEntry response:", response);
          if (!response || response.error || response.success === false) {
            throw new Error(response?.message || "Reservation entry failed.");
          }
        }
      } else {
        // EXIT logic
        if (exitIsWalkIn) {
          response = await walkInExit({
            licensePlate,
            lotId: selectedLot,
          });
          console.log("walkInExit response:", response);
          if (!response || response.error || response.success === false) {
            throw new Error(response?.message || "Walk-in exit failed.");
          }
        } else {
          response = await reservationExit({
            licensePlate,
            lotId: selectedLot,
          });
          console.log("reservationExit response:", response);
          if (!response || response.error || response.success === false) {
            throw new Error(response?.message || "Reservation exit failed.");
          }
        }
      }
      // Optionally, you can use response data for more info
      const selectedLotData = lots.find((lot) => lot.id === selectedLot);
      const newReservation: Reservation = {
        id: `RES${Date.now()}`,
        licensePlate,
        lotId: selectedLot,
        lotName: selectedLotData?.name || "",
        type: reservationType,
        timestamp: new Date(),
        ...(showVehicleDetails && reservationType === "entry"
          ? { vehicle, zoneId }
          : {}),
      };
      setRecentReservations((prev) => [newReservation, ...prev.slice(0, 4)]);
      setShowSuccess(true);
      setLicensePlate("");
      setSelectedLot("");
      setVehicle({ make: "", model: "", color: "" });
      setZoneId("");
      setShowVehicleDetails(false);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err: any) {
      setErrors({
        lot:
          err?.message ||
          err?.response?.data?.message ||
          "Submission failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          Walk-in & Reservation
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
            {reservationType === "exit" && (
              <Group>
                <Switch
                  label="Is Walk-in Exit?"
                  checked={exitIsWalkIn}
                  onChange={(event) =>
                    setExitIsWalkIn(event.currentTarget.checked)
                  }
                  mb={8}
                />
              </Group>
            )}
            <TextInput
              label="License Plate Number"
              placeholder="ABC-123"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              leftSection={<IconCar size={18} />}
              maxLength={9}
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
            {reservationType === "entry" && (
              <Switch
                label="Add vehicle details (optional)"
                checked={showVehicleDetails}
                onChange={(event) =>
                  setShowVehicleDetails(event.currentTarget.checked)
                }
                mb={showVehicleDetails ? 0 : 8}
              />
            )}
            {reservationType === "entry" && showVehicleDetails && (
              <Stack
                gap="sm"
                style={{
                  background: "#f3f4f6",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Select
                  label="Zone"
                  placeholder="Select a zone"
                  data={zones.map((zone) => ({
                    value: zone.id,
                    label: zone.name,
                  }))}
                  value={zoneId}
                  onChange={(val) => setZoneId(val || "")}
                  disabled={zones.length === 0}
                  required={false}
                  searchable
                />
                <TextInput
                  label="Vehicle Make"
                  placeholder="e.g. Toyota"
                  value={vehicle.make}
                  onChange={(e) =>
                    setVehicle((v) => ({ ...v, make: e.target.value }))
                  }
                />
                <TextInput
                  label="Vehicle Model"
                  placeholder="e.g. Corolla"
                  value={vehicle.model}
                  onChange={(e) =>
                    setVehicle((v) => ({ ...v, model: e.target.value }))
                  }
                />
                <TextInput
                  label="Vehicle Color"
                  placeholder="e.g. Red"
                  value={vehicle.color}
                  onChange={(e) =>
                    setVehicle((v) => ({ ...v, color: e.target.value }))
                  }
                />
              </Stack>
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
