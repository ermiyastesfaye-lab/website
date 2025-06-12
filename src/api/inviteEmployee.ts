import axios from "axios";

export interface InviteEmployeePayload {
  email: string;
  role: string;
  lot: string;
}

export async function inviteEmployee(
  payload: InviteEmployeePayload,
  token: string
) {
  const response = await axios.post(
    "https://6jm979tt-5000.euw.devtunnels.ms/v1/employees/invite",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client-type": "provider",
      },
    }
  );
  return response.data;
}

export interface InvitedEmployeeSignUpPayload {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export async function invitedEmployeeSignUp(
  payload: InvitedEmployeeSignUpPayload,
  token: string
) {
  const response = await axios.post(
    `https://6jm979tt-5000.euw.devtunnels.ms/v1/employees?token=${token}`,
    payload,
    {
      headers: {
        "x-client-type": "provider",
      },
    }
  );
  return response.data;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  lotId: string;
  lot: {
    name: string;
    id: string;
  };
}

export interface EmployeesResponse {
  count: number;
  employees: Employee[];
}

export async function fetchEmployees(
  token: string
): Promise<EmployeesResponse> {
  const response = await axios.get(
    "https://6jm979tt-5000.euw.devtunnels.ms/v1/employees",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client-type": "provider",
      },
    }
  );
  return response.data;
}
