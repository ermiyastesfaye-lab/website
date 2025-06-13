import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface InviteEmployeePayload {
  email: string;
  role: string;
  lot: string;
}

export async function inviteEmployee(
  payload: InviteEmployeePayload,
  token: string
) {
  const response = await axios.post(`${BASE_URL}/employees/invite`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
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
    `${BASE_URL}/employees?token=${token}`,
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
  const response = await axios.get(`${BASE_URL}/employees`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
