import axios from "axios";

export interface ReservationVehicle {
  id: string;
  make: string;
  model: string;
  color: string;
  licensePlateNumber: string;
  customer: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ReservationSpot {
  id: string;
  name: string;
  floor: number;
  status: string;
  zone: {
    id: string;
    name: string;
  };
}

export interface Reservation {
  id: string;
  startTime: string;
  endTime: string;
  arrivalTime: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  licensePlate: string;
  requestedValet: string | null;
  spotId: string;
  vehicleId: string;
  spot: ReservationSpot;
  vehicle: ReservationVehicle;
}

export interface ReservationsResponse {
  count: number;
  reservations: Reservation[];
}

export async function fetchReservations(
  token: string
): Promise<ReservationsResponse> {
  const response = await axios.get(
    "https://6jm979tt-5000.euw.devtunnels.ms/v1/reservations",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client-type": "provider",
      },
    }
  );
  console.log("response", response.data);
  return response.data;
}

export async function deleteReservation(reservationId: string, token: string) {
  const response = await axios.delete(
    `https://6jm979tt-5000.euw.devtunnels.ms/v1/reservations/${reservationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client-type": "provider",
      },
    }
  );
  return response.data;
}
