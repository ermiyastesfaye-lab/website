// src/api/registerEmployeeProvider.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface EmployeeData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface ProviderData {
  name: string;
  phone: string;
  email: string;
  hasValet: boolean;
}

export interface RegisterPayload {
  employee: EmployeeData;
  provider: ProviderData;
}

export async function registerEmployeeProvider(payload: RegisterPayload) {
  const response = await axios.post(
    `${BASE_URL}/employees/auth/register`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}
