import axios from "axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}

export async function loginEmployee(
  payload: LoginPayload
): Promise<LoginResponse> {
  const response = await axios.post(
    "https://6jm979tt-5000.euw.devtunnels.ms/v1/employees/auth/login",
    payload
  );
  return response.data;
}
