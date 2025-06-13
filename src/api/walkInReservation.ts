import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function walkInEntry({
  zoneId,
  lotId,
  licensePlate,
  vehicle,
}: {
  zoneId: string;
  lotId: string;
  licensePlate: string;
  vehicle: { make: string; model: string; color: string };
}) {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${BASE_URL}/vehicles/entry/walk-in`,
      { zoneId, lotId, licensePlate, vehicle },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-client-type": "provider",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.log("Error", error);
  }
}

export async function reservationEntry({
  licensePlate,
  lotId,
}: {
  licensePlate: string;
  lotId: string;
}) {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${BASE_URL}/vehicles/entry/reservation`,
      { licensePlate, lotId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-client-type": "provider",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.log("Error", error);
  }
}

export async function walkInExit({
  licensePlate,
  lotId,
}: {
  licensePlate: string;
  lotId: string;
}) {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.patch(
      `${BASE_URL}/vehicles/exit/walk-in`,
      { licensePlate, lotId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-client-type": "provider",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to submit walk-in exit.");
  }
}

export async function reservationExit({
  licensePlate,
  lotId,
}: {
  licensePlate: string;
  lotId: string;
}) {
  try {
    const token = localStorage.getItem("token");
    console.log(lotId, licensePlate);
    const res = await axios.patch(
      `${BASE_URL}/vehicles/exit/reservation`,
      { licensePlate, lotId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-client-type": "provider",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to submit reservation exit.");
  }
}
