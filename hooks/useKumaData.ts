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

// Cache for preloaded monitor data
const monitorDataCache = new Map<number, {
  status: MonitorStatus;
  heartbeats: any[];
  timestamp: number;
}>();

export function useKumaData() {
  const [serverUrl, setServerUrl] = useState("");
  const [statusPageId, setStatusPageId] = useState("vroom");
  const [monitors, setMonitors] = useState<MonitorWithStatus[]>([]);
  const [overallStatus, setOverallStatus] = useState<
    "up" | "down" | "loading" | "error"
  >("loading");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount and fetch data
  useEffect(() => {
    loadSettings();
  }, []);

  // Fetch data when settings are loaded
  useEffect(() => {
    if (serverUrl && statusPageId) {
      refreshData();
    }
  }, [serverUrl, statusPageId, refreshData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!serverUrl || !statusPageId) return;

    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Default 30 seconds

    return () => clearInterval(interval);
  }, [serverUrl, statusPageId, refreshData]);

  const loadSettings = async () => {
    try {
      const [url, pageId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL),
        AsyncStorage.getItem(STORAGE_KEYS.STATUS_PAGE_ID),
      ]);

      if (url) setServerUrl(url);
      if (pageId) setStatusPageId(pageId);

      // If no settings are found, set default values and show appropriate message
      if (!url || !pageId) {
        setError(
          "Please configure your server URL and status page ID in settings"
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setError("Error loading settings");
      setLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    if (!serverUrl || !statusPageId) {
      setLoading(false);
      setError(
        "Please configure your server URL and status page ID in settings"
      );
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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      setOverallStatus("error");

      // If it's a network error, try to provide more helpful message
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("Network")
      ) {
        setError(
          "Network error. Please check your internet connection and server URL."
        );
      }
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
        console.log("No server URL for monitor status");
        return { status: "error" };
      }

      try {
        console.log(
          `Fetching status for monitor ${monitorId} from ${serverUrl}/api/badge/${monitorId}/status`
        );
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
        console.log(
          `Monitor ${monitorId} response:`,
          responseText.substring(0, 200)
        );

        // Check if it's JSON first
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = JSON.parse(responseText);
          console.log(`Monitor ${monitorId} JSON data:`, data);
          return {
            status: data.status === "up" ? "up" : "down",
            lastCheck: data.lastCheck || new Date().toLocaleTimeString(),
          };
        }

        // If it's SVG, parse the status from it
        if (responseText.includes("<svg")) {
          const status = parseStatusFromSVG(responseText);
          console.log(`Monitor ${monitorId} SVG status:`, status);
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
        console.log("No server URL for heartbeats");
        return [];
      }

      try {
        console.log(
          `Fetching heartbeats for monitor ${monitorId} from ${serverUrl}/api/status-page/heartbeat/${statusPageId}`
        );
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
        console.log("Heartbeats raw data:", data);

        // The data structure has heartbeatList with monitor IDs as keys
        const heartbeatList = data.heartbeatList || {};
        console.log("Heartbeat list:", heartbeatList);
        // Try both string and number keys for the monitor ID
        const monitorHeartbeats =
          heartbeatList[monitorId] || heartbeatList[monitorId.toString()] || [];
        console.log(`Heartbeats for monitor ${monitorId}:`, monitorHeartbeats);

        // Format the heartbeats properly
        const formattedHeartbeats = monitorHeartbeats
          .map((heartbeat: any, index: number) => ({
            id: heartbeat.time || index, // Use time as ID since it's unique
            monitorId: monitorId,
            status: heartbeat.status === 1 ? "up" : "down",
            msg: heartbeat.msg || "",
            time: heartbeat.time,
            duration: heartbeat.ping, // KUMA uses 'ping' field
            ping: heartbeat.ping,
          }))
          .sort(
            (a: any, b: any) =>
              new Date(b.time).getTime() - new Date(a.time).getTime()
          )
          .slice(0, 50); // Limit to last 50 heartbeats for performance

        console.log(
          `Formatted heartbeats for monitor ${monitorId}:`,
          formattedHeartbeats
        );
        return formattedHeartbeats;
      } catch (error) {
        console.error("Error fetching heartbeats:", error);
        return [];
      }
    },
    [serverUrl, statusPageId]
  );

  const retry = useCallback(() => {
    setError(null);
    refreshData();
  }, [refreshData]);

  // Preload monitor data and cache it
  const preloadMonitorData = useCallback(
    async (monitorId: number) => {
      if (!serverUrl) return;

      try {
        console.log(`Preloading data for monitor ${monitorId}`);
        const [status, heartbeats] = await Promise.all([
          getMonitorStatus(monitorId),
          getHeartbeats(monitorId),
        ]);

        // Cache the data
        monitorDataCache.set(monitorId, {
          status,
          heartbeats,
          timestamp: Date.now(),
        });

        console.log(`Cached data for monitor ${monitorId}:`, {
          status,
          heartbeats: heartbeats.length,
        });
      } catch (error) {
        console.warn(`Failed to preload data for monitor ${monitorId}:`, error);
      }
    },
    [serverUrl, getMonitorStatus, getHeartbeats]
  );

  // Get cached monitor data
  const getCachedMonitorData = useCallback((monitorId: number) => {
    const cached = monitorDataCache.get(monitorId);
    if (cached && Date.now() - cached.timestamp < 30000) {
      // 30 second cache
      console.log(`Using cached data for monitor ${monitorId}`);
      return cached;
    }
    return null;
  }, []);

  return {
    monitors,
    overallStatus,
    loading,
    error,
    refreshData,
    retry,
    getMonitorStatus,
    getHeartbeats,
    preloadMonitorData,
    getCachedMonitorData,
  };
}
