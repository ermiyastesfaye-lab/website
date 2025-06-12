import React, { useState, useEffect, useRef } from "react";
import {
  Paper,
  Title,
  Button,
  Table,
  Group,
  Drawer,
  TextInput,
  NumberInput,
  Stack,
  Tabs,
  Divider,
  Modal,
  Switch,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createLot, editLot, fetchLots } from "../../api/lots";
import { createZone, fetchZones } from "../../api/Zone";
import { createSpot, fetchSpots, updateSpot } from "../../api/spot";
import { notifications } from "@mantine/notifications";

// Update Spot interface to match backend
interface Spot {
  id: string;
  name: string;
  floor: string;
  zoneId: string;
  number: number;
  status: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  OccupationType: string;
}

interface Zone {
  id: string;
  name: string;
  capacity: number;
  vehicleType: string;
  spots: Spot[];
}

export function Lots() {
  const [opened, { open, close }] = useDisclosure(false);
  const [lots, setLots] = useState<
    Array<{
      id: string;
      name: string;
      zones: Zone[];
      capacity: number;
      latitude: number;
      longitude: number;
    }>
  >([]);
  const [selectedLotId, setSelectedLotId] = useState("");
  const [search, setSearch] = useState("");
  const selectedLot = lots.find((lot) => lot.id === selectedLotId);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showAdditional, setShowAdditional] = useState(false);
  const [addSpotModal, setAddSpotModal] = useState(false);
  const [editSpotModal, setEditSpotModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [createLotModal, setCreateLotModal] = useState(false);
  const [editLotModal, setEditLotModal] = useState(false);
  const [zoneLoading, setZoneLoading] = useState(false);
  const [spotLoading, setSpotLoading] = useState(false);
  const [editSpotLoading, setEditSpotLoading] = useState(false);
  const [editLotLoading, setEditLotLoading] = useState(false);

  // Form state
  const [zoneForm, setZoneForm] = useState({
    name: "",
    capacity: 1,
    vehicleType: "",
    spotName: "P",
    numberOfSpots: 1,
    floor: "",
    startingNumber: 1,
  });

  const [spotForm, setSpotForm] = useState({
    name: "",
    number: 1,
    floor: "",
    startingNumber: 1,
    zoneId: "",
  });

  const [lotForm, setLotForm] = useState({
    name: "",
    capacity: 1,
    latitude: 9.005401, // default location
    longitude: 38.763611,
  });

  const [editLotForm, setEditLotForm] = useState({
    name: "",
    capacity: 1,
    latitude: 9.005401, // default location
    longitude: 38.763611,
    images: [], // for new images
  });

  // Add state for images
  const [lotImages, setLotImages] = useState<File[]>([]);
  const lotImageInputRef = useRef<HTMLInputElement | null>(null);

  function LocationPicker({
    onChange,
  }: {
    onChange: (lat: number, lng: number) => void;
  }) {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const handleZoneFormChange = (field: string, value: any) => {
    setZoneForm((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch zones for selected lot from backend
  useEffect(() => {
    const fetchAndSetZones = async () => {
      if (!selectedLotId) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const zones = await fetchZones(selectedLotId, token);
        setLots((prevLots) =>
          prevLots.map((lot) =>
            lot.id === selectedLotId
              ? {
                  ...lot,
                  zones: zones.map((z: any) => ({
                    id: z.id,
                    name: z.name,
                    capacity: z.capacity,
                    vehicleType: z.vehicleType,
                    spots: (z.spots || []).map((s: any) => ({
                      id: s.id,
                      name: s.name,
                      floor: s.floor?.toString() ?? "",
                      zoneId: s.zoneId,
                      number: s.number,
                      status: s.status,
                      price: s.price,
                      createdAt: s.createdAt,
                      updatedAt: s.updatedAt,
                      OccupationType: s.OccupationType,
                    })),
                  })),
                }
              : lot
          )
        );
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchAndSetZones();
  }, [selectedLotId]);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "No auth token found. Please log in again.",
      });
      return;
    }
    setZoneLoading(true);
    try {
      const payload: any = {
        name: zoneForm.name,
        capacity: zoneForm.capacity,
        vehicleType: zoneForm.vehicleType,
      };
      if (showAdditional) {
        payload.spot = {
          name: zoneForm.spotName,
          numberOfSpots: zoneForm.numberOfSpots,
          floor: Number(zoneForm.floor) || 0,
          startingNumber: zoneForm.startingNumber,
        };
      }
      await createZone(selectedLotId, payload, token);
      notifications.show({
        color: "green",
        title: "Success",
        message: "Zone created successfully.",
      });
      setZoneForm({
        name: "",
        capacity: 1,
        vehicleType: "",
        spotName: "P",
        numberOfSpots: 1,
        floor: "",
        startingNumber: 1,
      });
      setShowAdditional(false);
      close();
      // Refresh zones after creation
      const zones = await fetchZones(selectedLotId, token);
      setLots((prevLots) =>
        prevLots.map((lot) =>
          lot.id === selectedLotId
            ? {
                ...lot,
                zones: zones.map((z: any) => ({
                  id: z.id,
                  name: z.name,
                  capacity: z.capacity,
                  vehicleType: z.vehicleType,
                  spots: (z.spots || []).map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    floor: s.floor?.toString() ?? "",
                    zoneId: s.zoneId,
                    number: s.number,
                    status: s.status,
                    price: s.price,
                    createdAt: s.createdAt,
                    updatedAt: s.updatedAt,
                    OccupationType: s.OccupationType,
                  })),
                })),
              }
            : lot
        )
      );
    } catch (err: any) {
      notifications.show({
        color: "red",
        title: "Error",
        message:
          err?.response?.data?.message ||
          "Failed to create zone. Please try again.",
      });
    } finally {
      setZoneLoading(false);
    }
  };

  // Add Spot Handler
  const handleAddSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "No auth token found. Please log in again.",
      });
      return;
    }
    setSpotLoading(true);
    try {
      const payload = {
        name: spotForm.name,
        number: spotForm.number,
        floor: Number(spotForm.floor) || 0,
        startingNumber: spotForm.startingNumber.toString(),
        zoneId: spotForm.zoneId,
      };
      await createSpot(payload, token);
      notifications.show({
        color: "green",
        title: "Success",
        message: "Spot created successfully.",
      });
      setAddSpotModal(false);
      setSpotForm({
        name: "",
        number: 1,
        floor: "",
        startingNumber: 1,
        zoneId: "",
      });
      // Refresh zones to get new spot
      const zones = await fetchZones(selectedLotId, token);
      setLots((prevLots) =>
        prevLots.map((lot) =>
          lot.id === selectedLotId
            ? {
                ...lot,
                zones: zones.map((z: any) => ({
                  id: z.id,
                  name: z.name,
                  capacity: z.capacity,
                  vehicleType: z.vehicleType,
                  spots: (z.spots || []).map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    floor: s.floor?.toString() ?? "",
                    zoneId: s.zoneId,
                    number: s.number,
                    status: s.status,
                    price: s.price,
                    createdAt: s.createdAt,
                    updatedAt: s.updatedAt,
                    OccupationType: s.OccupationType,
                  })),
                })),
              }
            : lot
        )
      );
    } catch (err: any) {
      notifications.show({
        color: "red",
        title: "Error",
        message:
          err?.response?.data?.message ||
          "Failed to create spot. Please try again.",
      });
    } finally {
      setSpotLoading(false);
    }
  };

  // Edit Spot Handler
  const handleEditSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "No auth token found. Please log in again.",
      });
      return;
    }
    setEditSpotLoading(true);
    try {
      if (!selectedSpot) throw new Error("No spot selected");
      await updateSpot(
        selectedSpot.id,
        {
          name: spotForm.name,
          floor: Number(spotForm.floor) || 0,
        },
        token
      );
      notifications.show({
        color: "green",
        title: "Success",
        message: "Spot updated successfully.",
      });
      // After updating, fetch the latest spots for the affected zone only
      const updatedSpotsArr = await fetchSpots(selectedSpot.zoneId, token);
      let updatedSpots: any[] = [];
      if (Array.isArray(updatedSpotsArr)) {
        if (Array.isArray(updatedSpotsArr[0])) {
          updatedSpots = updatedSpotsArr[0];
        } else {
          updatedSpots = updatedSpotsArr;
        }
      }
      setLots((prevLots) =>
        prevLots.map((lot) =>
          lot.id === selectedLotId
            ? {
                ...lot,
                zones: lot.zones.map((zone) =>
                  zone.id === selectedSpot.zoneId
                    ? {
                        ...zone,
                        spots: updatedSpots.map((s: any) => ({
                          id: s.id,
                          name: s.name,
                          floor: s.floor?.toString() ?? "",
                          zoneId: s.zoneId,
                          number: s.number,
                          status: s.status,
                          price: s.price,
                          createdAt: s.createdAt,
                          updatedAt: s.updatedAt,
                          OccupationType: s.OccupationType,
                        })),
                      }
                    : zone
                ),
              }
            : lot
        )
      );
      setEditSpotModal(false);
      setSelectedSpot(null);
      setSpotForm({
        name: "",
        number: 1,
        floor: "",
        startingNumber: 1,
        zoneId: "",
      });
    } catch (err: any) {
      notifications.show({
        color: "red",
        title: "Error",
        message:
          err?.response?.data?.message ||
          "Failed to update spot. Please try again.",
      });
    } finally {
      setEditSpotLoading(false);
    }
  };

  // Delete Spot Handler
  const handleDeleteSpot = (zoneId: string, spotId: string) => {
    setLots((prevLots) =>
      prevLots.map((lot) =>
        lot.id === selectedLotId
          ? {
              ...lot,
              zones: lot.zones.map((zone) =>
                zone.id === zoneId
                  ? {
                      ...zone,
                      spots: zone.spots.filter((spot) => spot.id !== spotId),
                    }
                  : zone
              ),
            }
          : lot
      )
    );
  };

  // Sidebar for lots with search
  const LotSidebar = (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{
        minWidth: 220,
        maxWidth: 260,
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Title order={4} mb="md" className="text-primary">
        Lots
      </Title>
      <TextInput
        placeholder="Search lots..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="sm"
      />
      <Stack gap="xs">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateLotModal(true)}
          className="bg-primary hover:bg-primary/90 text-white border-0"
          style={{ backgroundColor: "#1C5D66", color: "white", border: "none" }}
          fullWidth
        >
          Create Lot
        </Button>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {lots
            .filter(
              (lot) =>
                lot.name &&
                lot.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((lot) => (
              <li
                key={lot.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 6,
                  marginBottom: 4,
                  background: "transparent",
                  color: selectedLotId === lot.id ? "#1C5D66" : "#000000",
                  fontWeight: selectedLotId === lot.id ? 700 : 400,
                  transition: "color 0.2s, border 0.2s",
                }}
                onClick={() => {
                  setSelectedLotId(lot.id);
                  setActiveZone(lot.zones[0]?.id ?? null);
                }}
              >
                <span style={{ flex: 1 }}>{lot.name}</span>
                <Button
                  variant="subtle"
                  size="xs"
                  style={{ marginLeft: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLotId(lot.id);
                    setEditLotModal(true);
                    setEditLotForm({
                      name: lot.name,
                      capacity: lot.capacity,
                      latitude: lot.latitude,
                      longitude: lot.longitude,
                      images: [],
                    });
                  }}
                >
                  <IconEdit size={16} />
                </Button>
              </li>
            ))}
        </ul>
      </Stack>
    </Paper>
  );

  // Create Lot Handler
  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No auth token found. Please log in again.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", lotForm.name);
      formData.append("capacity", String(lotForm.capacity));
      formData.append(
        "location",
        JSON.stringify({
          latitude: lotForm.latitude,
          longitude: lotForm.longitude,
        })
      );
      lotImages.forEach((file) => {
        formData.append("images", file);
      });
      const newLot = await createLot(formData, token);
      // Safely extract latitude and longitude
      let latitude = 0;
      let longitude = 0;
      if (typeof newLot.location === "object" && newLot.location !== null) {
        latitude = newLot.location.latitude;
        longitude = newLot.location.longitude;
      } else if (typeof newLot.location === "string") {
        try {
          const loc = JSON.parse(newLot.location);
          latitude = loc.latitude;
          longitude = loc.longitude;
        } catch {}
      }
      setLots((prev) => [
        ...prev,
        {
          id: newLot.id,
          name: newLot.name,
          zones: [],
          capacity: newLot.capacity,
          latitude,
          longitude,
        },
      ]);
      setCreateLotModal(false);
      setLotForm({
        name: "",
        capacity: 1,
        latitude: 9.005401,
        longitude: 38.763611,
      });
      setLotImages([]);
    } catch (err) {
      alert("Failed to create lot. Please try again.");
    }
  };

  // Edit Lot Handler
  const handleEditLot = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "No auth token found. Please log in again.",
      });
      return;
    }
    setEditLotLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editLotForm.name);
      formData.append("capacity", String(editLotForm.capacity));
      formData.append(
        "location",
        JSON.stringify({
          latitude: editLotForm.latitude,
          longitude: editLotForm.longitude,
        })
      );
      lotImages.forEach((file) => {
        formData.append("images", file);
      });
      await editLot(selectedLotId, formData, token);
      notifications.show({
        color: "green",
        title: "Success",
        message: "Lot updated successfully.",
      });
      setEditLotModal(false);
      setEditLotForm({
        name: "",
        capacity: 1,
        latitude: 9.005401,
        longitude: 38.763611,
        images: [],
      });
      setLotImages([]);
      // Refresh lots after editing
      const updatedLots = await fetchLots(token);
      setLots(
        updatedLots.map((lot: any) => ({
          id: lot.id,
          name: lot.name,
          zones: [],
          capacity: lot.capacity,
          latitude: 0,
          longitude: 0,
        }))
      );
    } catch (err: any) {
      notifications.show({
        color: "red",
        title: "Error",
        message:
          err?.response?.data?.message ||
          "Failed to update lot. Please try again.",
      });
    } finally {
      setEditLotLoading(false);
    }
  };

  // Fetch lots from backend on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchLots(token)
      .then((data) => {
        // If backend returns lots as in your example, map to expected structure
        setLots(
          data.map((lot: any) => ({
            id: lot.id,
            name: lot.name,
            zones: [], // No zones in backend response
            capacity: lot.capacity,
            latitude: 0, // No latitude in backend response
            longitude: 0, // No longitude in backend response
          }))
        );
      })
      .catch(() => {
        // Optionally handle error
      });
  }, []);

  // When lots are loaded, set selectedLotId and activeZone if not set
  useEffect(() => {
    if (lots.length > 0 && !selectedLotId) {
      setSelectedLotId(lots[0].id);
      setActiveZone(lots[0].zones[0]?.id ?? null);
    }
  }, [lots]);

  // Fetch spots for each zone when zones or activeZone change
  useEffect(() => {
    const fetchAllSpots = async () => {
      const token = localStorage.getItem("token");
      if (!token || !selectedLot) return;
      const updatedZones = await Promise.all(
        selectedLot.zones.map(async (zone) => {
          try {
            const spotsArr = await fetchSpots(zone.id, token);
            // Handle both flat and nested array responses
            let spots: any[] = [];
            if (Array.isArray(spotsArr)) {
              if (Array.isArray(spotsArr[0])) {
                spots = spotsArr[0];
              } else {
                spots = spotsArr;
              }
            }
            return {
              ...zone,
              spots: spots.map((s: any) => ({
                id: s.id,
                name: s.name,
                floor: s.floor?.toString() ?? "",
                zoneId: s.zoneId,
                number: s.number,
                status: s.status,
                price: s.price,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
                OccupationType: s.OccupationType,
              })),
            };
          } catch {
            return { ...zone, spots: [] };
          }
        })
      );
      setLots((prevLots) =>
        prevLots.map((lot) =>
          lot.id === selectedLotId ? { ...lot, zones: updatedZones } : lot
        )
      );
    };
    if (selectedLot && selectedLot.zones.length > 0) {
      fetchAllSpots();
    }
  }, [
    selectedLotId,
    selectedLot?.zones.map((z) => z.id).join(","),
    activeZone,
  ]);

  return (
    <Group align="flex-start" gap={0} style={{ height: "100%" }}>
      {/* Sidebar for lots */}
      <div
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#f8fafc",
        }}
      >
        {LotSidebar}
      </div>
      {/* Main content: show zones for selected lot */}
      <div style={{ flex: 1, paddingLeft: 24, width: "100%" }}>
        <Stack gap="lg">
          <Group justify="space-between">
            <Title order={2} className="text-primary">
              {selectedLot?.name || "Select a lot"} Zones
            </Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={open}
              className="bg-primary hover:bg-primary/90 text-white border-0"
              style={{
                backgroundColor: "#1C5D66",
                color: "white",
                border: "none",
              }}
              disabled={!selectedLot}
            >
              Add parking zone
            </Button>
          </Group>

          {selectedLot && (
            <Tabs
              value={activeZone || (selectedLot.zones[0]?.id ?? null)}
              onChange={setActiveZone}
            >
              <Tabs.List>
                {selectedLot.zones.map((zone) => (
                  <Tabs.Tab key={zone.id} value={zone.id}>
                    {zone.name}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              {selectedLot.zones.map((zone) => (
                <Tabs.Panel key={zone.id} value={zone.id} pt="md">
                  <Paper withBorder radius="md" p="md">
                    <Group justify="space-between" mb="md">
                      <Title order={3} className="text-primary">
                        {zone.name}
                      </Title>
                      <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => {
                          setAddSpotModal(true);
                          setSpotForm({
                            name: "",
                            number: 1,
                            floor: "",
                            startingNumber: 1,
                            zoneId: zone.id,
                          });
                        }}
                        className="bg-primary hover:bg-primary/90 text-white border-0"
                        style={{
                          backgroundColor: "#1C5D66",
                          color: "white",
                          border: "none",
                        }}
                      >
                        Add spots
                      </Button>
                    </Group>
                    <Divider my="md" />
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th className="text-primary">Name</Table.Th>
                          <Table.Th className="text-primary">Number</Table.Th>
                          <Table.Th className="text-primary">Floor</Table.Th>
                          <Table.Th className="text-primary">Status</Table.Th>
                          <Table.Th className="text-primary">Price</Table.Th>
                          <Table.Th className="text-primary">
                            Occupation Type
                          </Table.Th>
                          <Table.Th className="text-secondary">
                            Actions
                          </Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {zone.spots && zone.spots.length > 0 ? (
                          zone.spots.map((spot: Spot) => (
                            <Table.Tr key={spot.id}>
                              <Table.Td>{spot.name}</Table.Td>
                              <Table.Td>{spot.number}</Table.Td>
                              <Table.Td>{spot.floor || "-"}</Table.Td>
                              <Table.Td>{spot.status}</Table.Td>
                              <Table.Td>{spot.price}</Table.Td>
                              <Table.Td>{spot.OccupationType}</Table.Td>
                              <Table.Td>
                                <Group gap="xs">
                                  <Button
                                    variant="subtle"
                                    color="blue"
                                    size="xs"
                                    onClick={() => {
                                      setEditSpotModal(true);
                                      setSelectedSpot(spot);
                                      setSpotForm({
                                        name: spot.name,
                                        number: spot.number,
                                        floor: spot.floor || "",
                                        startingNumber: 1,
                                        zoneId: zone.id,
                                      });
                                    }}
                                  >
                                    <IconEdit size={16} />
                                  </Button>
                                  <Button
                                    variant="subtle"
                                    color="red"
                                    size="xs"
                                    onClick={() =>
                                      handleDeleteSpot(zone.id, spot.id)
                                    }
                                  >
                                    <IconTrash size={16} />
                                  </Button>
                                </Group>
                              </Table.Td>
                            </Table.Tr>
                          ))
                        ) : (
                          <Table.Tr>
                            <Table.Td
                              colSpan={7}
                              style={{ textAlign: "center", color: "#888" }}
                            >
                              No spots found for this zone.
                            </Table.Td>
                          </Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                </Tabs.Panel>
              ))}
            </Tabs>
          )}

          <Drawer
            opened={opened}
            onClose={close}
            title={<Title order={3}>New parking zone</Title>}
            position="right"
            size="md"
            padding="xl"
            overlayProps={{ opacity: 0.55, blur: 2 }}
          >
            <form onSubmit={handleCreateZone}>
              <Stack>
                <TextInput
                  label="Name of parking zone"
                  placeholder="e.g. Garage"
                  value={zoneForm.name}
                  onChange={(e) =>
                    handleZoneFormChange("name", e.currentTarget.value)
                  }
                  required
                />
                <NumberInput
                  label="Capacity"
                  min={1}
                  value={zoneForm.capacity}
                  onChange={(val) => handleZoneFormChange("capacity", val || 1)}
                  required
                />
                <TextInput
                  label="Vehicle type"
                  placeholder="e.g. Car, Bike"
                  value={zoneForm.vehicleType}
                  onChange={(e) =>
                    handleZoneFormChange("vehicleType", e.currentTarget.value)
                  }
                  required
                />
                <Group justify="end">
                  <Switch
                    color="#E0994B"
                    label="Additional options"
                    checked={showAdditional}
                    onChange={(event) =>
                      setShowAdditional(event.currentTarget.checked)
                    }
                  />
                </Group>
                {showAdditional && (
                  <>
                    <Group grow>
                      <TextInput
                        label="Name of spot"
                        value={zoneForm.spotName}
                        onChange={(e) =>
                          handleZoneFormChange(
                            "spotName",
                            e.currentTarget.value
                          )
                        }
                        required={showAdditional}
                      />
                      <NumberInput
                        label="Number of spots"
                        min={1}
                        value={zoneForm.numberOfSpots}
                        onChange={(val) =>
                          handleZoneFormChange("numberOfSpots", val || 1)
                        }
                        required={showAdditional}
                      />
                    </Group>
                    <Group grow>
                      <TextInput
                        label="Floor (optional)"
                        value={zoneForm.floor}
                        onChange={(e) =>
                          handleZoneFormChange("floor", e.currentTarget.value)
                        }
                      />
                      <NumberInput
                        label="Starting number"
                        min={1}
                        value={zoneForm.startingNumber}
                        onChange={(val) =>
                          handleZoneFormChange("startingNumber", val || 1)
                        }
                      />
                    </Group>
                  </>
                )}
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  style={{
                    backgroundColor: "#1C5D66",
                    color: "white",
                    border: "none",
                  }}
                  loading={zoneLoading}
                >
                  {zoneLoading ? "Creating..." : "Add parking zone"}
                </Button>
              </Stack>
            </form>
          </Drawer>

          {/* Add Spot Modal */}
          <Modal
            opened={addSpotModal}
            onClose={() => setAddSpotModal(false)}
            title={<Title order={4}>Add Spot</Title>}
            centered
            size="md"
          >
            <form onSubmit={handleAddSpot}>
              <Stack>
                <TextInput
                  label="Name"
                  value={spotForm.name ?? ""}
                  onChange={(e) =>
                    setSpotForm((f) => ({ ...f, name: e.target.value ?? "" }))
                  }
                  required
                />
                <NumberInput
                  label="Number"
                  min={1}
                  value={spotForm.number}
                  onChange={(val) =>
                    setSpotForm((f) => ({ ...f, number: Number(val) || 1 }))
                  }
                  required
                />
                <TextInput
                  label="Floor"
                  value={spotForm.floor ?? ""}
                  onChange={(e) =>
                    setSpotForm((f) => ({ ...f, floor: e.target.value ?? "" }))
                  }
                />
                <NumberInput
                  label="Starting number"
                  min={1}
                  value={spotForm.startingNumber}
                  onChange={(val) =>
                    setSpotForm((f) => ({
                      ...f,
                      startingNumber: Number(val) || 1,
                    }))
                  }
                />
                <select
                  value={spotForm.zoneId}
                  onChange={(e) =>
                    setSpotForm((f) => ({ ...f, zoneId: e.target.value }))
                  }
                  style={{
                    padding: 8,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                  required
                >
                  <option value="" disabled>
                    Select zone
                  </option>
                  {selectedLot?.zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  style={{
                    backgroundColor: "#1C5D66",
                    color: "white",
                    border: "none",
                  }}
                  loading={spotLoading}
                >
                  Add Spot
                </Button>
              </Stack>
            </form>
          </Modal>

          {/* Edit Spot Modal */}
          <Modal
            opened={editSpotModal}
            onClose={() => setEditSpotModal(false)}
            title={<Title order={4}>Update Spot</Title>}
            centered
            size="md"
          >
            <form onSubmit={handleEditSpot}>
              <Stack>
                <TextInput
                  label="Name"
                  value={spotForm.name ?? ""}
                  onChange={(e) =>
                    setSpotForm((f) => ({ ...f, name: e.target.value ?? "" }))
                  }
                  required
                />
                <TextInput
                  label="Floor"
                  value={spotForm.floor ?? ""}
                  onChange={(e) =>
                    setSpotForm((f) => ({ ...f, floor: e.target.value ?? "" }))
                  }
                />
                {/* <select
                  value={spotForm.zoneId}
                  onChange={(e) =>
                    setSpotForm((f) => ({ ...f, zoneId: e.target.value }))
                  }
                  style={{
                    padding: 8,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                  required
                >
                  <option value="" disabled>
                    Select zone
                  </option>
                  {selectedLot?.zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select> */}
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  style={{
                    backgroundColor: "#1C5D66",
                    color: "white",
                    border: "none",
                  }}
                  loading={editSpotLoading}
                >
                  Update Spot
                </Button>
              </Stack>
            </form>
          </Modal>

          {/* Create Lot Modal */}
          <Modal
            opened={createLotModal}
            onClose={() => setCreateLotModal(false)}
            title={<Title order={4}>Create Lot</Title>}
            centered
            size="md"
          >
            <form onSubmit={handleCreateLot} encType="multipart/form-data">
              <Stack>
                <TextInput
                  label="Name"
                  value={lotForm.name ?? ""}
                  onChange={(e) => {
                    const value = e.currentTarget?.value ?? "";
                    setLotForm((f) => ({ ...f, name: value }));
                  }}
                  required
                />
                <NumberInput
                  label="Capacity"
                  min={1}
                  value={lotForm.capacity ?? 1}
                  onChange={(val) =>
                    setLotForm((f) => ({ ...f, capacity: Number(val) || 1 }))
                  }
                  required
                />
                {/* Image upload */}
                {lotImages.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {lotImages.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt={`preview-${idx}`}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    ))}
                  </div>
                )}
                <input
                  ref={lotImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files);
                      setLotImages((prev) => [
                        ...prev,
                        ...newFiles.filter(
                          (file) =>
                            !prev.some(
                              (f) =>
                                f.name === file.name && f.size === file.size
                            )
                        ),
                      ]);
                      // Reset input value so user can select the same file again if needed
                      if (lotImageInputRef.current)
                        lotImageInputRef.current.value = "";
                    }
                  }}
                  style={{ marginBottom: 8 }}
                />
                <Title order={6} mt={8} mb={-8}>
                  Pick Location
                </Title>
                <div
                  style={{
                    height: 220,
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <MapContainer
                    center={[lotForm.latitude ?? 0, lotForm.longitude ?? 0]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={[lotForm.latitude ?? 0, lotForm.longitude ?? 0]}
                    />
                    <LocationPicker
                      onChange={(lat, lng) =>
                        setLotForm((f) => ({
                          ...f,
                          latitude: lat,
                          longitude: lng,
                        }))
                      }
                    />
                  </MapContainer>
                </div>
                <Group grow>
                  <TextInput
                    label="Latitude"
                    value={lotForm.latitude ?? ""}
                    readOnly
                  />
                  <TextInput
                    label="Longitude"
                    value={lotForm.longitude ?? ""}
                    readOnly
                  />
                </Group>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  style={{
                    backgroundColor: "#1C5D66",
                    color: "white",
                    border: "none",
                  }}
                  fullWidth
                >
                  Create Lot
                </Button>
              </Stack>
            </form>
          </Modal>

          {/* Edit Lot Modal */}
          <Modal
            opened={editLotModal}
            onClose={() => setEditLotModal(false)}
            title={<Title order={4}>Edit Lot</Title>}
            centered
            size="md"
          >
            <form onSubmit={handleEditLot} encType="multipart/form-data">
              <Stack>
                <TextInput
                  label="Name"
                  value={editLotForm.name ?? ""}
                  onChange={(e) => {
                    const value = e.currentTarget?.value ?? "";
                    setEditLotForm((f) => ({ ...f, name: value }));
                  }}
                  required
                />
                <NumberInput
                  label="Capacity"
                  min={1}
                  value={editLotForm.capacity ?? 1}
                  onChange={(val) =>
                    setEditLotForm((f) => ({
                      ...f,
                      capacity: Number(val) || 1,
                    }))
                  }
                  required
                />
                {/* Image upload */}
                {lotImages.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {lotImages.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt={`preview-edit-${idx}`}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    ))}
                  </div>
                )}
                <input
                  ref={lotImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files);
                      setLotImages((prev) => [
                        ...prev,
                        ...newFiles.filter(
                          (file) =>
                            !prev.some(
                              (f) =>
                                f.name === file.name && f.size === file.size
                            )
                        ),
                      ]);
                      if (lotImageInputRef.current)
                        lotImageInputRef.current.value = "";
                    }
                  }}
                  style={{ marginBottom: 8 }}
                />
                <Title order={6} mt={8} mb={-8}>
                  Pick Location
                </Title>
                <div
                  style={{
                    height: 220,
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <MapContainer
                    center={[editLotForm.latitude, editLotForm.longitude]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={[editLotForm.latitude, editLotForm.longitude]}
                    />
                    <LocationPicker
                      onChange={(lat, lng) =>
                        setEditLotForm((f) => ({
                          ...f,
                          latitude: lat,
                          longitude: lng,
                        }))
                      }
                    />
                  </MapContainer>
                </div>
                <Group grow>
                  <TextInput
                    label="Latitude"
                    value={editLotForm.latitude ?? ""}
                    readOnly
                  />
                  <TextInput
                    label="Longitude"
                    value={editLotForm.longitude ?? ""}
                    readOnly
                  />
                </Group>
                <Button
                  type="submit"
                  className="bg-secondary hover:bg-secondary/90"
                  style={{
                    backgroundColor: "#E0994B",
                    color: "white",
                    border: "none",
                  }}
                  fullWidth
                  loading={editLotLoading}
                >
                  Update Lot
                </Button>
              </Stack>
            </form>
          </Modal>
        </Stack>
      </div>
    </Group>
  );
}
