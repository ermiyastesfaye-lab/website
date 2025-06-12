import axios from "axios";

export interface CreateLotPayload {
  name: string;
  capacity: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Lot {
  id: string;
  name: string;
  capacity: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

// Accept FormData for createLot to support multipart/form-data (images, location as JSON, etc)
export async function createLot(payload: FormData, token: string) {
  try {
    console.log("FormData payload:");
    for (const [key, value] of payload.entries()) {
      console.log(key, value);
    }
    const response = await axios.post(
      "https://6jm979tt-5000.euw.devtunnels.ms/v1/lots",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-client-type": "provider",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating lot:", error);
    throw error;
  }
}

export async function fetchLots(token: string): Promise<Lot[]> {
  const response = await axios.get(
    "https://6jm979tt-5000.euw.devtunnels.ms/v1/lots",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client-type": "provider",
      },
    }
  );
  return response.data;
}

// PATCH request for editing a lot (multipart/form-data, same payload as createLot)
export async function editLot(lotId: string, payload: FormData, token: string) {
  try {
    console.log("FormData payload (edit):");
    for (const [key, value] of payload.entries()) {
      console.log(key, value);
    }
    const response = await axios.patch(
      `https://6jm979tt-5000.euw.devtunnels.ms/v1/lots/${lotId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-client-type": "provider",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing lot:", error);
    throw error;
  }
}
