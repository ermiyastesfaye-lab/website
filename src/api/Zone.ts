import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface CreateZonePayload {
  name: string;
  capacity: number;
  vehicleType: string;
  spot?: {
    name: string;
    numberOfSpots: number;
    floor: number;
    startingNumber: number;
  };
}

export async function createZone(
  lotId: string,
  payload: CreateZonePayload,
  token: string
) {
  const response = await axios.post(
    `${BASE_URL}/lots/${lotId}/zones`,
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

export async function fetchZones(lotId: string, token: string) {
  const response = await axios.get(`${BASE_URL}/lots/${lotId}/zones`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-client-type": "provider",
    },
  });
  return response.data;
}
