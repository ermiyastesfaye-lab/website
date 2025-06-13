import {
  AppShell,
  Group,
  NavLink,
  Button,
  Modal,
  Loader,
  Badge,
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDashboard,
  IconParking,
  IconUsers,
  IconSettings,
  IconUserPlus,
  IconLogout,
  IconBell,
  IconArrowLeftRight, // <-- Add this import
  IconCurrencyDollar, // <-- Add this import
} from "@tabler/icons-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/logo/Layer 1.svg";
import { useState, useEffect } from "react";
import { fetchLots, type Lot } from "../api/lots";
import { inviteEmployee } from "../api/inviteEmployee";
import { useAlertsPolling } from "../api/alerts";

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  // Invite modal state
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "",
    lot: "",
  });
  const [lots, setLots] = useState<Lot[]>([]);
  const [inviteStatus, setInviteStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [inviteError, setInviteError] = useState<string>("");
  // Notification state
  const [notifMenuOpened, setNotifMenuOpened] = useState(false);
  const [showReservationAlert, setShowReservationAlert] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token") || undefined;
  const { alerts: safeNotifications, loading } = useAlertsPolling(token || "");
  // Defensive: ensure notifications is always an array
  const latestNotifications = Array.isArray(safeNotifications)
    ? safeNotifications.slice(0, 3)
    : [];

  // Fetch lots when invite modal opens
  useEffect(() => {
    if (inviteModal) {
      const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
          const lotsData = await fetchLots(token);
          setLots(lotsData);
        } catch (err) {
          setLots([]);
        }
      };
      fetchData();
    }
  }, [inviteModal]);

  useEffect(() => {
    if (!inviteModal) {
      setInviteStatus("idle");
      setInviteError("");
    }
  }, [inviteModal]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus("sending");
    setInviteError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setInviteStatus("error");
      setInviteError("Not authenticated. Please log in again.");
      setTimeout(() => setInviteStatus("idle"), 2000);
      return;
    }
    // Prepare payload: omit lot if not selected, ensure role is lowercase
    const payload: any = {
      email: inviteForm.email,
      role:
        inviteForm.role.charAt(0).toUpperCase() +
        inviteForm.role.slice(1).toLowerCase(),
    };
    if (inviteForm.lot) {
      payload.lot = inviteForm.lot;
    }
    try {
      await inviteEmployee(payload, token);
      setInviteStatus("sent");
      setTimeout(() => {
        setInviteModal(false);
        setInviteForm({ email: "", role: "", lot: "" });
        setInviteStatus("idle");
      }, 1200);
    } catch (err: any) {
      setInviteStatus("error");
      setInviteError(
        err?.response?.data?.message || err?.message || "Failed to send invite."
      );
      setTimeout(() => setInviteStatus("idle"), 2000);
    }
  };

  // Demo: Simulate expired reservation check (replace with real logic)
  const checkExpiredReservations = () => {
    // Example: Replace this with your real reservation expiration logic
    // For demo, we just show the alert
    setShowReservationAlert(true);
    setTimeout(() => setShowReservationAlert(false), 3000);
  };

  const navLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <IconDashboard size="1.2rem" stroke={1.5} />,
    },
    {
      to: "/employees",
      label: "Employees",
      icon: <IconUsers size="1.2rem" stroke={1.5} />,
    },
    {
      to: "/lots",
      label: "Lots",
      icon: <IconParking size="1.2rem" stroke={1.5} />,
    },
    {
      to: "/reservations",
      label: "Reservations",
      icon: <IconParking size="1.2rem" stroke={1.5} />,
    },
    {
      to: "/reservations/walkin",
      label: "Entry/Exit",
      icon: <IconArrowLeftRight size="1.2rem" stroke={1.5} />,
    },
    {
      to: "/pricing",
      label: "Pricing",
      icon: <IconCurrencyDollar size="1.2rem" stroke={1.5} />,
    },
    {
      to: "/settings",
      label: "Settings",
      icon: <IconSettings size="1.2rem" stroke={1.5} />,
    },
    {
      to: "/",
      label: "Logout",
      icon: <IconLogout size="1.2rem" stroke={1.5} />,
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/");
      },
    },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header>
        <Group
          h="100%"
          px="md"
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          <Group>
            <img src={logo} alt="Nova Logo" className="h-9 w-56 mr-2" />
            {/* Remove Burger button and collapse logic */}
          </Group>
          <Group>
            {/* Notification Bell with Badge and Dropdown */}
            <Menu
              opened={notifMenuOpened}
              onChange={setNotifMenuOpened}
              position="bottom-end"
              width={320}
              withinPortal
            >
              <Menu.Target>
                <Button
                  variant="subtle"
                  color="gray"
                  style={{ marginRight: 8, position: "relative" }}
                  onClick={() => setNotifMenuOpened((o) => !o)}
                >
                  <IconBell size={28} />
                  {latestNotifications.length > 0 && (
                    <Badge
                      color="red"
                      size="sm"
                      style={{
                        position: "absolute",
                        top: 1,
                        right: 4,
                        pointerEvents: "none",
                      }}
                    >
                      {latestNotifications.length}
                    </Badge>
                  )}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {latestNotifications.length === 0 ? (
                  <Menu.Item disabled>No new notifications</Menu.Item>
                ) : (
                  latestNotifications.map((notif) => (
                    <Menu.Item key={notif.id}>
                      <div style={{ fontWeight: 500 }}>
                        {notif.value?.message || notif.type + " alert"}
                      </div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </Menu.Item>
                  ))
                )}
                <Menu.Divider />
                <Menu.Item
                  onClick={() => {
                    setNotifMenuOpened(false);
                    navigate("/alerts");
                  }}
                  style={{ textAlign: "center", fontWeight: 600 }}
                >
                  View All
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Button
              leftSection={<IconUserPlus size={18} />}
              variant="outline"
              color="white"
              onClick={() => setInviteModal(true)}
              style={{ fontWeight: 500, backgroundColor: "#E0994B" }}
            >
              Add
            </Button>
          </Group>
        </Group>
        {/* Reservation Expired Alert */}
        {showReservationAlert && (
          <div
            style={{
              position: "absolute",
              top: 70,
              right: 30,
              background: "#ffeded",
              color: "#b91c1c",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              padding: "12px 24px",
              zIndex: 9999,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            Reservation expired!
          </div>
        )}
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          position: "fixed",
          left: 0,
          top: 60, // header height
          height: "calc(100vh - 60px)",
          zIndex: 100,
          paddingLeft: 0,
          paddingRight: 0,
          width: 300,
          transition: undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              component={Link}
              to={link.to}
              leftSection={link.icon}
              label={link.label}
              style={{
                width: "100%",
                justifyContent: "flex-start",
                paddingLeft: 16,
                paddingRight: 16,
                fontSize: 20,
                minHeight: 56,
              }}
              className={""}
              onClick={link.onClick}
            />
          ))}
        </div>
      </AppShell.Navbar>

      <AppShell.Main style={{ marginLeft: 40 }}>
        <Outlet />
        {/* Invite Modal */}
        <Modal
          opened={inviteModal}
          onClose={() => setInviteModal(false)}
          title={<span className="font-semibold text-lg">Invite User</span>}
          centered
          size="sm"
        >
          <form onSubmit={handleInviteSubmit}>
            <div className="flex flex-col gap-4">
              <input
                type="email"
                required
                placeholder="Email"
                className="border rounded px-3 py-2"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm((f) => ({ ...f, email: e.target.value }))
                }
                disabled={inviteStatus === "sending" || inviteStatus === "sent"}
              />
              <select
                className="border rounded px-3 py-2"
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm((f) => ({ ...f, role: e.target.value }))
                }
                required
                disabled={inviteStatus === "sending" || inviteStatus === "sent"}
              >
                <option value="">Select role</option>
                <option value="valet">Valet</option>
                <option value="admin">Admin</option>
              </select>
              <select
                className="border rounded px-3 py-2"
                value={inviteForm.lot}
                onChange={(e) =>
                  setInviteForm((f) => ({ ...f, lot: e.target.value }))
                }
                disabled={inviteStatus === "sending" || inviteStatus === "sent"}
              >
                <option value="">Select lot (optional)</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name}
                  </option>
                ))}
              </select>
              {inviteStatus === "sent" && (
                <div className="text-green-700 text-center">Invite sent!</div>
              )}
              {inviteStatus === "error" && inviteError && (
                <div className="text-red-700 text-center">{inviteError}</div>
              )}
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white border-0"
                style={{
                  backgroundColor: "#1C5D66",
                  color: "white",
                  border: "none",
                  position: "relative",
                }}
                fullWidth
                disabled={inviteStatus === "sending" || inviteStatus === "sent"}
              >
                {inviteStatus === "sending" ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Loader
                      size={18}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                    Sending...
                  </span>
                ) : (
                  "Send Invite"
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </AppShell.Main>
    </AppShell>
  );
}
