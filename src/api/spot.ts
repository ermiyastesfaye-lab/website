import axios from "axios";

export interface CreateSpotPayload {
  name: string;
  number: number;
  floor: number;
  startingNumber: string;
  zoneId: string;
}

export async function createSpot(payload: CreateSpotPayload, token: string) {
  const response = await axios.post(
    `https://6jm979tt-5000.euw.devtunnels.ms/v1/spots`,
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

export async function fetchSpots(zoneId: string, token: string) {
  const response = await axios.get(
    `https://6jm979tt-5000.euw.devtunnels.ms/v1/zones/${zoneId}/spots`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client-type": "provider",
      },
    }
  );
  return response.data;
}

export async function updateSpot(
  spotId: string,
  payload: { name: string; floor: number },
  token: string
) {
  console.log(spotId);
  const response = await axios.patch(
    `https://6jm979tt-5000.euw.devtunnels.ms/v1/spots/${spotId}`,
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

export async function fetchSpotById(spotId: string, token: string) {
  const response = await axios.get(
    `https://6jm979tt-5000.euw.devtunnels.ms/v1/spots/${spotId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client-type": "provider",
      },
    }
  );
  return response.data;
}
