import { Group, Text } from "@mantine/core";
import { IconCheck, IconX, IconAlertCircle } from "@tabler/icons-react";

interface ReservationRowProps {
  licensePlate: string;
  phoneNumber: string;
  status: "Completed" | "Cancelled" | "Active";
}

export function ReservationRow({
  licensePlate,
  phoneNumber,
  status,
}: ReservationRowProps) {
  let icon = null;
  let color = "";
  let textColor = "";
  if (status === "Completed") {
    icon = <IconCheck size={18} color="#4caf50" style={{ flexShrink: 0 }} />;
    color = "#4caf50";
    textColor = "#4caf50";
  } else if (status === "Cancelled") {
    icon = <IconX size={18} color="#f44336" style={{ flexShrink: 0 }} />;
    color = "#f44336";
    textColor = "#f44336";
  } else if (status === "Active") {
    icon = (
      <IconAlertCircle size={18} color="#ffb300" style={{ flexShrink: 0 }} />
    );
    color = "#ffb300";
    textColor = "#ffb300";
  }
  return (
    <Group gap={0} align="center" style={{ fontSize: 14, minHeight: 32 }}>
      <Text w={120}>{licensePlate}</Text>
      <Text w={140}>{phoneNumber}</Text>
      <Group gap={6} align="center" w={100} style={{ flexWrap: "nowrap" }}>
        {icon}
        <Text
          style={{ color: textColor, fontWeight: 500, whiteSpace: "nowrap" }}
        >
          {status}
        </Text>
      </Group>
    </Group>
  );
}
