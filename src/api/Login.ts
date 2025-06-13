import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

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
    `${BASE_URL}/employees/auth/login`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}
