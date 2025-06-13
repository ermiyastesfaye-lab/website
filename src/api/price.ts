import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function getLotPrice(lotId: string, token?: string) {
  const res = await axios.get(`${BASE_URL}/price/${lotId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-client-type": "provider",
    },
  });
  return res.data;
}

export interface UpdateLotPricePayload {
  minimumPrice: number;
  maximumPrice: number;
  valetPrice: number;
  lotId: string;
}

export async function updateLotPrice(
  lotId: string,
  payload: UpdateLotPricePayload,
  token?: string
) {
  const res = await axios.put(`${BASE_URL}/price/${lotId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-client-type": "provider",
    },
  });
  return res.data;
}
