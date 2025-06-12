import axios from "axios";

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
    `https://6jm979tt-5000.euw.devtunnels.ms/v1/lots/${lotId}/zones`,
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
  const response = await axios.get(
    `https://6jm979tt-5000.euw.devtunnels.ms/v1/lots/${lotId}/zones`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client-type": "provider",
      },
    }
  );
  return response.data;
}
