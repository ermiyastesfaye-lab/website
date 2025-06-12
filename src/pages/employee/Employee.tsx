import { useEffect, useState } from "react";
import { Paper, Title, Button, Table, Group, Stack } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { fetchEmployees } from "../../api/inviteEmployee";
import type { EmployeesResponse, Employee } from "../../api/inviteEmployee";

export function Employee() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        const data: EmployeesResponse = await fetchEmployees(token);
        console.log("Data", data);
        setEmployees(data.employees || []);
        console.log("Employees", data.employees || []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch employees."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Only run on mount

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Employees</Title>
      </Group>
      <Paper withBorder radius="md">
        {loading && (
          <div className="text-blue-700 text-center py-4">
            Loading employees...
          </div>
        )}
        {error && <div className="text-red-700 text-center py-4">{error}</div>}
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Lot Name</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {employees.map((emp) => (
              <Table.Tr key={emp.id}>
                <Table.Td>{emp.name}</Table.Td>
                <Table.Td>{emp.phone}</Table.Td>
                <Table.Td>{emp.email}</Table.Td>
                <Table.Td>{emp.role}</Table.Td>
                <Table.Td>{emp.lot.name}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button variant="subtle" color="blue" size="xs">
                      <IconEdit size={16} />
                    </Button>
                    <Button variant="subtle" color="red" size="xs">
                      <IconTrash size={16} />
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
