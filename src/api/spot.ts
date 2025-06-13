import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface CreateSpotPayload {
  name: string;
  number: number;
  floor: number;
  startingNumber: string;
  zoneId: string;
}

export async function createSpot(payload: CreateSpotPayload, token: string) {
  const response = await axios.post(`${BASE_URL}/spots`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-client-type": "provider",
    },
  });
  return response.data;
}

export async function fetchSpots(zoneId: string, token: string) {
  const response = await axios.get(`${BASE_URL}/zones/${zoneId}/spots`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-client-type": "provider",
    },
  });
  return response.data;
}

export async function updateSpot(
  spotId: string,
  payload: { name: string; floor: number },
  token: string
) {
  const response = await axios.patch(`${BASE_URL}/spots/${spotId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-client-type": "provider",
    },
  });
  return response.data;
}

export async function fetchSpotById(spotId: string, token: string) {
  const response = await axios.get(`${BASE_URL}/spots/${spotId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-client-type": "provider",
    },
  });
  return response.data;
}
