import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEYS = {
  SERVER_URL: "kuma_server_url",
  STATUS_PAGE_ID: "kuma_status_page_id",
  AUTO_REFRESH: "kuma_auto_refresh",
  REFRESH_INTERVAL: "kuma_refresh_interval",
};

interface Monitor {
  id: number;
  name: string;
  type: string;
  sendUrl: number;
}

interface StatusPageData {
  config: {
    slug: string;
    title: string;
    description: string | null;
    icon: string;
    theme: string;
    published: boolean;
  };
  publicGroupList: Array<{
    id: number;
    name: string;
    weight: number;
    monitorList: Monitor[];
  }>;
  incident: any;
  maintenanceList: any[];
}

interface MonitorWithStatus extends Monitor {
  status?: "up" | "down" | "error";
  lastCheck?: string;
}

interface MonitorStatus {
  status: "up" | "down" | "error";
  lastCheck?: string;
}

export function useKumaData() {
  const [serverUrl, setServerUrl] = useState("");
  const [statusPageId, setStatusPageId] = useState("vroom");
  const [monitors, setMonitors] = useState<MonitorWithStatus[]>([]);
  const [overallStatus, setOverallStatus] = useState<
    "up" | "down" | "loading" | "error"
  >("loading");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!serverUrl || !statusPageId) return;

    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Default 30 seconds

    return () => clearInterval(interval);
  }, [serverUrl, statusPageId]);

  const loadSettings = async () => {
    try {
      const [url, pageId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL),
        AsyncStorage.getItem(STORAGE_KEYS.STATUS_PAGE_ID),
      ]);

      if (url) setServerUrl(url);
      if (pageId) setStatusPageId(pageId);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const refreshData = useCallback(async () => {
    if (!serverUrl || !statusPageId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch status page data
      const statusPageResponse = await fetch(
        `${serverUrl}/api/status-page/${statusPageId}`
      );

      if (!statusPageResponse.ok) {
        throw new Error(
          `Failed to fetch status page: ${statusPageResponse.status} ${statusPageResponse.statusText}`
        );
      }

      // Check if response is JSON
      const contentType = statusPageResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await statusPageResponse.text();
        console.error(
          "Non-JSON response received:",
          responseText.substring(0, 200)
        );
        throw new Error(
          "Server returned non-JSON response. Check your server URL and status page ID."
        );
      }

      const statusPageData: StatusPageData = await statusPageResponse.json();

      // Extract monitors from all groups and set default status
      const allMonitors: MonitorWithStatus[] = [];
      statusPageData.publicGroupList.forEach((group) => {
        group.monitorList.forEach((monitor) => {
          allMonitors.push({
            ...monitor,
            status: "loading", // Default to loading, will be updated by individual status calls
            lastCheck: undefined,
          });
        });
      });

      setMonitors(allMonitors);

      // Try to fetch individual monitor statuses in the background
      allMonitors.forEach(async (monitor) => {
        try {
          const monitorStatus = await getMonitorStatus(monitor.id);
          setMonitors((prevMonitors) =>
            prevMonitors.map((m) =>
              m.id === monitor.id
                ? {
                    ...m,
                    status: monitorStatus.status,
                    lastCheck: monitorStatus.lastCheck,
                  }
                : m
            )
          );
        } catch (error) {
          console.warn(
            `Failed to fetch status for monitor ${monitor.id}:`,
            error
          );
          setMonitors((prevMonitors) =>
            prevMonitors.map((m) =>
              m.id === monitor.id ? { ...m, status: "error" as const } : m
            )
          );
        }
      });

      // Fetch overall status
      try {
        const overallStatusResponse = await fetch(
          `${serverUrl}/api/status-page/${statusPageId}/badge`
        );
        if (overallStatusResponse.ok) {
          const contentType = overallStatusResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const overallStatusData = await overallStatusResponse.json();
            setOverallStatus(overallStatusData.status || "up");
          } else {
            // Try to parse SVG response
            const responseText = await overallStatusResponse.text();
            if (responseText.includes("<svg")) {
              const status = parseStatusFromSVG(responseText);
              setOverallStatus(status);
            } else {
              setOverallStatus("up"); // Default to up if non-JSON response
            }
          }
        } else {
          setOverallStatus("up"); // Default to up if badge endpoint fails
        }
      } catch (badgeError) {
        console.warn("Failed to fetch overall status:", badgeError);
        setOverallStatus("up"); // Default to up if badge endpoint fails
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setOverallStatus("error");
    } finally {
      setLoading(false);
    }
  }, [serverUrl, statusPageId]);

  const parseStatusFromSVG = (svgContent: string): "up" | "down" | "error" => {
    try {
      // Look for the status text in the SVG
      const statusMatch = svgContent.match(/aria-label="Status: ([^"]+)"/);
      if (statusMatch) {
        const status = statusMatch[1].toLowerCase();
        if (status === "up") return "up";
        if (status === "down") return "down";
        return "error";
      }

      // Fallback: look for the text content
      const textMatch = svgContent.match(/>([^<]+)<\/text>/g);
      if (textMatch) {
        const lastText = textMatch[textMatch.length - 1];
        if (lastText.includes("Up")) return "up";
        if (lastText.includes("Down")) return "down";
      }

      return "error";
    } catch (error) {
      console.warn("Error parsing SVG status:", error);
      return "error";
    }
  };

  const getMonitorStatus = useCallback(
    async (monitorId: number): Promise<MonitorStatus> => {
      if (!serverUrl) {
        return { status: "error" };
      }

      try {
        const response = await fetch(
          `${serverUrl}/api/badge/${monitorId}/status`
        );
        if (!response.ok) {
          console.warn(
            `Monitor ${monitorId} status endpoint returned ${response.status}`
          );
          return { status: "error" };
        }

        // Get the response text (could be SVG or JSON)
        const responseText = await response.text();

        // Check if it's JSON first
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = JSON.parse(responseText);
          return {
            status: data.status === "up" ? "up" : "down",
            lastCheck: data.lastCheck || new Date().toLocaleTimeString(),
          };
        }

        // If it's SVG, parse the status from it
        if (responseText.includes("<svg")) {
          const status = parseStatusFromSVG(responseText);
          return {
            status,
            lastCheck: new Date().toLocaleTimeString(),
          };
        }

        console.warn(
          `Monitor ${monitorId} returned unexpected response format`
        );
        return { status: "error" };
      } catch (error) {
        console.error(`Error fetching monitor ${monitorId} status:`, error);
        return { status: "error" };
      }
    },
    [serverUrl]
  );

  const getHeartbeats = useCallback(
    async (monitorId: number) => {
      if (!serverUrl) {
        return [];
      }

      try {
        const response = await fetch(
          `${serverUrl}/api/status-page/heartbeat/${statusPageId}`
        );
        if (!response.ok) {
          console.warn(`Heartbeats endpoint returned ${response.status}`);
          return [];
        }

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("Non-JSON response for heartbeats");
          return [];
        }

        const data = await response.json();

        // Filter heartbeats for this monitor and format them properly
        const monitorHeartbeats = data
          .filter((heartbeat: any) => heartbeat.monitorId === monitorId)
          .map((heartbeat: any) => ({
            id: heartbeat.id || heartbeat.time,
            monitorId: heartbeat.monitorId,
            status: heartbeat.status === 1 ? "up" : "down",
            msg: heartbeat.msg || "",
            time: heartbeat.time || heartbeat.timestamp,
            duration: heartbeat.duration || heartbeat.ping,
            ping: heartbeat.ping || heartbeat.duration,
          }))
          .sort(
            (a: any, b: any) =>
              new Date(b.time).getTime() - new Date(a.time).getTime()
          )
          .slice(0, 50); // Limit to last 50 heartbeats for performance

        return monitorHeartbeats;
      } catch (error) {
        console.error("Error fetching heartbeats:", error);
        return [];
      }
    },
    [serverUrl, statusPageId]
  );

  return {
    monitors,
    overallStatus,
    loading,
    error,
    refreshData,
    getMonitorStatus,
    getHeartbeats,
  };
}
