import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  NumberInput,
  Group,
  Modal,
  Title,
  Badge,
  ActionIcon,
  Stack,
  Box,
  Text,
  Center,
  Paper,
  Grid,
  rem,
  Tabs,
} from "@mantine/core";
import {
  IconCurrencyDollar,
  IconEdit,
  IconPlus,
  IconMapPin,
  IconTrendingUp,
  IconTrendingDown,
  IconCar,
  IconCrown,
  IconClock,
  IconTrash,
} from "@tabler/icons-react";
import { fetchLots } from "../../api/lots";
import { getLotPrice, updateLotPrice } from "../../api/price";
import {
  createCost,
  getAllCosts,
  getCostById,
  deleteCost,
} from "../../api/cost";
import { DatePickerInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";

interface LotPricing {
  id: string;
  name: string;
  location: string;
  minimumPrice: number;
  maximumPrice: number;
  valetPrice: number;
  currency: string;
  lastUpdated: Date;
}

// Cost management state
interface LotCost {
  id: string;
  lotId: string;
  lotName: string;
  month: string;
  year: number;
  amount: number;
  margin: number;
}

const PricingManagement: React.FC = () => {
  const [pricingData, setPricingData] = useState<LotPricing[]>([]);
  const [lots, setLots] = useState<
    { id: string; name: string; location: string }[]
  >([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    minimumPrice?: number;
    maximumPrice?: number;
    valetPrice?: number;
  }>({});
  const [editLotId, setEditLotId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    lotId: string;
    minimumPrice?: number;
    maximumPrice?: number;
    valetPrice?: number;
  }>({ lotId: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Cost management state
  const [costData, setCostData] = useState<LotCost[]>([]);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [costForm, setCostForm] = useState<{
    lotId: string;
    date: Date | null;
    amount?: number;
    margin?: number;
  }>({
    lotId: "",
    date: null,
  });
  const [costLoading, setCostLoading] = useState(false);

  // Fetch all lots and their prices on mount
  useEffect(() => {
    const fetchAll = async () => {
      setError("");
      try {
        const token = localStorage.getItem("token") || undefined;
        const lotsData = await fetchLots(token!);
        setLots(
          lotsData.map((lot) => ({
            id: lot.id,
            name: lot.name,
            location: lot.location,
          }))
        );
        // Fetch price for each lot
        const prices = await Promise.all(
          lotsData.map(async (lot) => {
            try {
              const price = await getLotPrice(lot.id, token);
              console.log("Price", price);
              return {
                id: lot.id,
                name: lot.name,
                location: lot.location,
                minimumPrice: Number(price.data.minPrice),
                maximumPrice: Number(price.data.maxPrice),
                valetPrice: Number(price.data.valetPrice),
                currency: price.currency || "USD",
                lastUpdated: price.lastUpdated
                  ? new Date(price.lastUpdated)
                  : new Date(),
              };
            } catch {
              return {
                id: lot.id,
                name: lot.name,
                location: lot.location,
                minimumPrice: 0,
                maximumPrice: 0,
                valetPrice: 0,
                currency: "USD",
                lastUpdated: new Date(),
              };
            }
          })
        );
        setPricingData(prices);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch lots or prices");
      }
    };
    fetchAll();
  }, []);

  // Fetch all costs on mount and when lots change
  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const token = localStorage.getItem("token") || undefined;
        const costs = await getAllCosts(token);
        console.log("Fetched costs:", costs);
        console.log("Current lots:", lots);
        // Convert month number to month name if needed
        const monthNames = [
          "",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        // Handle backend response where costs may be inside a 'data' property
        const costArray =
          costs &&
          typeof costs === "object" &&
          "data" in costs &&
          Array.isArray((costs as any).data)
            ? (costs as any).data
            : costs;
        setCostData(
          (costArray as any[]).map((cost: any) => {
            const lot = lots.find((l) => l.id === cost.lotId);
            return {
              ...cost,
              lotName: lot ? lot.name : cost.lotId, // fallback to lotId if not found
              lotId: cost.lotId || "",
              amount: Number(cost.amount),
              margin: Number(cost.margin) * 100,
              month:
                typeof cost.month === "number"
                  ? monthNames[cost.month]
                  : monthNames[Number(cost.month)] || cost.month,
            };
          })
        );
      } catch (err: any) {
        setError(err?.message || "Failed to fetch costs");
      }
    };
    if (lots.length > 0) fetchCosts();
  }, [lots]);

  // Edit pricing modal open
  const openEditModal = (lot: LotPricing) => {
    setEditLotId(lot.id);
    setEditForm({
      minimumPrice: lot.minimumPrice,
      maximumPrice: lot.maximumPrice,
      valetPrice: lot.valetPrice,
    });
    setEditModalOpen(true);
  };

  // Save edit
  const handleEditSave = async () => {
    if (
      !editLotId ||
      editForm.minimumPrice === undefined ||
      editForm.maximumPrice === undefined ||
      editForm.valetPrice === undefined
    )
      return;
    setEditLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || undefined;
      await updateLotPrice(
        editLotId,
        {
          lotId: editLotId,
          minPrice: editForm.minimumPrice,
          maxPrice: editForm.maximumPrice,
          valetPrice: editForm.valetPrice,
        } as any,
        token
      );
      // Refresh table
      setPricingData((prev) =>
        prev.map((lot) =>
          lot.id === editLotId
            ? {
                ...lot,
                minimumPrice: editForm.minimumPrice!,
                maximumPrice: editForm.maximumPrice!,
                valetPrice: editForm.valetPrice!,
                lastUpdated: new Date(),
              }
            : lot
        )
      );
      setEditModalOpen(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to update price"
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Add pricing modal open
  const openAddModal = () => {
    setAddForm({
      lotId: lots[0]?.id || "",
      minimumPrice: undefined,
      maximumPrice: undefined,
      valetPrice: undefined,
    });
    setAddModalOpen(true);
  };

  // Save add
  const handleAddSave = async () => {
    if (
      !addForm.lotId ||
      addForm.minimumPrice === undefined ||
      addForm.maximumPrice === undefined ||
      addForm.valetPrice === undefined
    )
      return;
    setAddLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || undefined;
      await updateLotPrice(
        addForm.lotId,
        {
          lotId: addForm.lotId,
          minPrice: addForm.minimumPrice,
          maxPrice: addForm.maximumPrice,
          valetPrice: addForm.valetPrice,
        } as any,
        token
      );
      setAddModalOpen(false);
      // Refetch all
      const lotsData = await fetchLots(token!);
      setLots(
        lotsData.map((lot) => ({
          id: lot.id,
          name: lot.name,
          location: lot.location,
        }))
      );
      const prices = await Promise.all(
        lotsData.map(async (lot) => {
          try {
            const price = await getLotPrice(lot.id, token);
            return {
              id: lot.id,
              name: lot.name,
              location: lot.location,
              minimumPrice: Number(price.minPrice),
              maximumPrice: Number(price.maxPrice),
              valetPrice: Number(price.valetPrice),
              currency: price.currency || "USD",
              lastUpdated: price.lastUpdated
                ? new Date(price.lastUpdated)
                : new Date(),
            };
          } catch {
            return {
              id: lot.id,
              name: lot.name,
              location: lot.location,
              minimumPrice: 0,
              maximumPrice: 0,
              valetPrice: 0,
              currency: "USD",
              lastUpdated: new Date(),
            };
          }
        })
      );
      setPricingData(prices);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to add price"
      );
    } finally {
      setAddLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate summary values
  const totalLots = pricingData.length;
  const avgMinPrice =
    totalLots > 0
      ? pricingData.reduce(
          (sum, lot) => sum + (isNaN(lot.minimumPrice) ? 0 : lot.minimumPrice),
          0
        ) / totalLots
      : 0;
  const avgMaxPrice =
    totalLots > 0
      ? pricingData.reduce(
          (sum, lot) => sum + (isNaN(lot.maximumPrice) ? 0 : lot.maximumPrice),
          0
        ) / totalLots
      : 0;

  const openCostModal = () => {
    setCostForm({
      lotId: lots[0]?.id || "",
      date: null,
    });
    setCostModalOpen(true);
  };

  const handleCostSave = async () => {
    if (
      !costForm.lotId ||
      !costForm.date ||
      costForm.amount === undefined ||
      costForm.margin === undefined
    )
      return;
    setCostLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || undefined;
      await createCost(
        {
          month: costForm.date.getMonth() + 1, // send month as number (1-12)
          year: costForm.date.getFullYear(),
          amount: costForm.amount,
          margin: costForm.margin / 100, // divide margin by 100 before sending
          lotId: costForm.lotId,
        } as any,
        token
      );
      setCostModalOpen(false);
      // Refetch costs
      const costs = await getAllCosts(token);
      setCostData(
        costs.map((cost) => ({
          ...cost,
          lotName: lots.find((l) => l.id === cost.lotId)?.name || "",
        }))
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to add cost"
      );
    } finally {
      setCostLoading(false);
    }
  };

  const handleDeleteCost = async (id: string) => {
    setError("");
    try {
      const token = localStorage.getItem("token") || undefined;
      await deleteCost(id, token);
      setCostData((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to delete cost";
      setError(msg);
      if (msg.includes("Cannot delete costs for past months")) {
        showNotification({
          title: "Delete Failed",
          message: "You cannot delete costs for past months.",
          color: "red",
        });
      } else {
        showNotification({
          title: "Delete Failed",
          message: msg,
          color: "red",
        });
      }
    }
  };

  return (
    <Box bg="#F8FAFC" style={{ minHeight: "100vh" }}>
      <Center>
        <Stack align="center" mt={40} mb={20}>
          <Title order={1} c="#1C5D66" fw={700} size={36}>
            Pricing Management
          </Title>
          <Text c="dimmed" size="lg">
            Manage parking lot pricing and rates
          </Text>
        </Stack>
      </Center>
      <Tabs defaultValue="pricing" color="#1C5D66">
        <Tabs.List mb={24}>
          <Tabs.Tab value="pricing">Pricing</Tabs.Tab>
          <Tabs.Tab value="cost">Cost</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="pricing">
          {/* Add Pricing Modal */}
          <Modal
            opened={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            title={<Title order={3}>Add New Pricing</Title>}
            centered
            size="md"
          >
            <Stack>
              <Text>Select Lot</Text>
              <select
                value={addForm.lotId}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, lotId: e.target.value }))
                }
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              >
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name}
                  </option>
                ))}
              </select>
              <NumberInput
                label="Min Price"
                value={addForm.minimumPrice}
                onChange={(val) =>
                  setAddForm((f) => ({ ...f, minimumPrice: val as number }))
                }
                min={0}
                step={0.01}
                placeholder="0.00"
                hideControls
              />
              <NumberInput
                label="Max Price"
                value={addForm.maximumPrice}
                onChange={(val) =>
                  setAddForm((f) => ({ ...f, maximumPrice: val as number }))
                }
                min={0}
                step={0.01}
                placeholder="0.00"
                hideControls
              />
              <NumberInput
                label="Valet Price"
                value={addForm.valetPrice}
                onChange={(val) =>
                  setAddForm((f) => ({ ...f, valetPrice: val as number }))
                }
                min={0}
                step={0.01}
                placeholder="0.00"
                hideControls
              />
              {error && <Text c="red">{error}</Text>}
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  style={{ background: "#1C5D66", color: "#fff" }}
                  onClick={handleAddSave}
                  loading={addLoading}
                >
                  Save
                </Button>
              </Group>
            </Stack>
          </Modal>
          {/* Edit Pricing Modal */}
          <Modal
            opened={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            title={<Title order={3}>Edit Pricing</Title>}
            centered
            size="md"
          >
            <Stack>
              <NumberInput
                label="Min Price"
                value={editForm.minimumPrice}
                onChange={(val) =>
                  setEditForm((f) => ({ ...f, minimumPrice: val as number }))
                }
                min={0}
                step={0.01}
                placeholder="0.00"
                hideControls
              />
              <NumberInput
                label="Max Price"
                value={editForm.maximumPrice}
                onChange={(val) =>
                  setEditForm((f) => ({ ...f, maximumPrice: val as number }))
                }
                min={0}
                step={0.01}
                placeholder="0.00"
                hideControls
              />
              <NumberInput
                label="Valet Price"
                value={editForm.valetPrice}
                onChange={(val) =>
                  setEditForm((f) => ({ ...f, valetPrice: val as number }))
                }
                min={0}
                step={0.01}
                placeholder="0.00"
                hideControls
              />
              {error && <Text c="red">{error}</Text>}
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  style={{ background: "#1C5D66", color: "#fff" }}
                  onClick={handleEditSave}
                  loading={editLoading}
                >
                  Save
                </Button>
              </Group>
            </Stack>
          </Modal>
          <Box maw={1200} mx="auto" mt={24}>
            <Paper shadow="md" radius={"lg"} p={0} withBorder>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead bg="#F3F4F6">
                  <Table.Tr>
                    <Table.Th>
                      <Group gap={6}>
                        <IconCar size={16} />
                        Lot Information
                      </Group>
                    </Table.Th>
                    <Table.Th ta="center">
                      <Group gap={6} justify="center">
                        <IconTrendingDown size={16} color="#16a34a" />
                        Minimum Price
                      </Group>
                    </Table.Th>
                    <Table.Th ta="center">
                      <Group gap={6} justify="center">
                        <IconTrendingUp size={16} color="#dc2626" />
                        Maximum Price
                      </Group>
                    </Table.Th>
                    <Table.Th ta="center">
                      <Group gap={6} justify="center">
                        <IconCrown size={16} color="#a21caf" />
                        Valet Price
                      </Group>
                    </Table.Th>
                    <Table.Th ta="center">
                      <Group gap={6} justify="center">
                        <IconClock size={16} />
                        Last Updated
                      </Group>
                    </Table.Th>
                    <Table.Th ta="center">Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {pricingData.map((lot) => (
                    <Table.Tr key={lot.id}>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text fw={600}>{lot.name}</Text>
                          <Group gap={4}>
                            <IconMapPin size={14} color="#64748b" />
                            <Text size="sm" c="dimmed">
                              {lot.location}
                            </Text>
                          </Group>
                          <Text size="xs" c="gray">
                            ID: {lot.id}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td ta="center">
                        <Badge color="green" variant="light">
                          {formatPrice(lot.minimumPrice, lot.currency)}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="center">
                        <Badge color="red" variant="light">
                          {formatPrice(lot.maximumPrice, lot.currency)}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="center">
                        <Badge color="grape" variant="light">
                          {formatPrice(lot.valetPrice, lot.currency)}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="center">
                        <Text size="sm" c="dimmed">
                          {formatDate(lot.lastUpdated)}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="center">
                        <ActionIcon
                          color="blue"
                          variant="light"
                          onClick={() => openEditModal(lot)}
                          title="Edit pricing"
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
            <Grid mt={32} gutter={24}>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card shadow="sm" radius="lg" p="lg" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Total Lots
                      </Text>
                      <Text fw={700} size="xl" c="#1C5D66">
                        {totalLots}
                      </Text>
                    </div>
                    <Box bg="#E3F0FA" p={10} style={{ borderRadius: 999 }}>
                      <IconCar size={28} color="#1C5D66" />
                    </Box>
                  </Group>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card shadow="sm" radius="lg" p="lg" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Avg. Min Price
                      </Text>
                      <Text fw={700} size="xl" c="#1C5D66">
                        {formatPrice(avgMinPrice, "USD")}
                      </Text>
                    </div>
                    <Box bg="#E6F9F0" p={10} style={{ borderRadius: 999 }}>
                      <IconTrendingDown size={28} color="#16a34a" />
                    </Box>
                  </Group>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card shadow="sm" radius="lg" p="lg" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Avg. Max Price
                      </Text>
                      <Text fw={700} size="xl" c="#1C5D66">
                        {formatPrice(avgMaxPrice, "USD")}
                      </Text>
                    </div>
                    <Box bg="#F3E8FF" p={10} style={{ borderRadius: 999 }}>
                      <IconTrendingUp size={28} color="#dc2626" />
                    </Box>
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>
          </Box>
        </Tabs.Panel>
        <Tabs.Panel value="cost">
          <Group justify="space-between" mb={16}>
            <Title order={3}>Cost Management</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              style={{ background: "#1C5D66", color: "#fff" }}
              onClick={openCostModal}
            >
              Add Cost
            </Button>
          </Group>
          <Modal
            opened={costModalOpen}
            onClose={() => setCostModalOpen(false)}
            title={<Title order={3}>Add New Cost</Title>}
            centered
            size="md"
          >
            <Stack>
              <Text>Select Lot</Text>
              <select
                value={costForm.lotId}
                onChange={(e) =>
                  setCostForm((f) => ({ ...f, lotId: e.target.value }))
                }
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              >
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={
                  costForm.date ? costForm.date.toISOString().split("T")[0] : ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setCostForm((f) => ({
                    ...f,
                    date: val ? new Date(val) : null,
                  }));
                }}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  width: "100%",
                }}
              />
              <NumberInput
                label="Amount"
                value={costForm.amount}
                onChange={(val) =>
                  setCostForm((f) => ({ ...f, amount: val as number }))
                }
                min={0}
                step={0.01}
                placeholder="0.00"
                hideControls
              />
              <NumberInput
                label="Margin"
                value={costForm.margin}
                onChange={(val) =>
                  setCostForm((f) => ({ ...f, margin: val as number }))
                }
                min={0}
                step={0.01}
                placeholder="0.00"
                hideControls
              />
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={() => setCostModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  style={{ background: "#1C5D66", color: "#fff" }}
                  onClick={handleCostSave}
                  loading={costLoading}
                >
                  Save
                </Button>
              </Group>
            </Stack>
          </Modal>
          <Paper shadow="md" radius={"lg"} p={0} withBorder>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead bg="#F3F4F6">
                <Table.Tr>
                  <Table.Th>Lot Name</Table.Th>
                  <Table.Th>Month</Table.Th>
                  <Table.Th>Year</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Margin</Table.Th>
                  <Table.Th ta="center">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {costData.map((cost) => (
                  <Table.Tr key={cost.id}>
                    <Table.Td>{cost.lotName}</Table.Td>
                    <Table.Td>{cost.month}</Table.Td>
                    <Table.Td>{cost.year}</Table.Td>
                    <Table.Td>{formatPrice(cost.amount, "USD")}</Table.Td>
                    <Table.Td>{cost.margin}%</Table.Td>
                    <Table.Td ta="center">
                      {/* Removed Edit Icon */}
                      <ActionIcon
                        color="red"
                        variant="light"
                        title="Delete cost"
                        onClick={() => handleDeleteCost(cost.id)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
};

export default PricingManagement;
