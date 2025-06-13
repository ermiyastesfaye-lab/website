// src/api/alerts.ts
import axios from "axios";
import { useEffect, useRef, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface Alert {
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  value: Record<string, any>;
  customerId: string;
  vehicleId: string;
  reservationId: string;
}

export async function fetchAlerts(token: string): Promise<Alert[]> {
  const response = await axios.get(`${BASE_URL}/alerts`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-client-type": "provider",
    },
  });
  // The API returns { data: { alerts: Alert[], count: number } }
  const apiData = response.data?.data;
  if (apiData && Array.isArray(apiData.alerts)) {
    return apiData.alerts;
  }
  return [];
}

// --- POLLING HOOK ---
export function useAlertsPolling(
  token: string,
  intervalMs = 60000,
  lotId?: string | null
) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function poll() {
      setLoading(true);
      try {
        // Only add lotId if it's a non-empty string and not 'all'
        let url = `${BASE_URL}/alerts`;
        if (lotId && lotId !== "all") {
          url += `?lotId=${encodeURIComponent(lotId)}`;
        }
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-client-type": "provider",
          },
        });
        const apiData = response.data?.data;
        if (isMounted && apiData && Array.isArray(apiData.alerts)) {
          setAlerts(apiData.alerts);
        } else if (isMounted) {
          setAlerts([]);
        }
      } catch {
        if (isMounted) setAlerts([]);
      }
      if (isMounted) setLoading(false);
      timer.current = setTimeout(poll, intervalMs);
    }
    poll();
    return () => {
      isMounted = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [token, intervalMs, lotId]);

  return { alerts, loading };
}
