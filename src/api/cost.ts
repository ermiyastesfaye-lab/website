import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

export interface Cost {
  id: string;
  lotId: string; // Added lotId for correct mapping
  month: string;
  year: number;
  amount: number;
  margin: number;
}

export interface CreateCostRequest {
  month: string;
  year: number;
  amount: number;
  margin: number;
}

function getHeaders(token?: string) {
  return {
    Authorization: `Bearer ${token}`,
    "x-client-type": "provider",
  };
}

// Create a new cost entry
export async function createCost(data: CreateCostRequest, token?: string) {
  const payload = {
    ...data,
    month: Number(data.month),
    year: Number(data.year),
    amount: Number(data.amount),
    margin: Number(data.margin),
  };
  const res = await axios.post(`${baseUrl}/cost`, payload, {
    headers: getHeaders(token),
  });
  return res.data;
}

// Get all cost entries
export async function getAllCosts(token?: string): Promise<Cost[]> {
  const res = await axios.get(`${baseUrl}/cost`, {
    headers: getHeaders(token),
  });

  return res.data;
}

// Get a single cost entry by id
export async function getCostById(id: string, token?: string): Promise<Cost> {
  const res = await axios.get(`${baseUrl}/cost/${id}`, {
    headers: getHeaders(token),
  });
  return res.data;
}

// Delete a cost entry by id
export async function deleteCost(id: string, token?: string) {
  try {
    const res = await axios.delete(`${baseUrl}/cost/${id}`, {
      headers: getHeaders(token),
    });
    return res.data;
  } catch (error) {
    console.error("Failed to delete cost:", error);
    throw error;
  }
}
