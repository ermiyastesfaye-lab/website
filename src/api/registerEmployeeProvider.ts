// src/api/registerEmployeeProvider.ts
import axios from "axios";

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
    "https://6jm979tt-5000.euw.devtunnels.ms/v1/employees/auth/register",
    payload
  );
  return response.data;
}
