import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GlassButton } from "@/components/ui/glass-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useKumaData } from "@/hooks/useKumaData";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Heartbeat {
  id: string | number;
  monitorId: number;
  status: "up" | "down";
  msg: string;
  time: string;
  duration?: number;
  ping?: number;
}

export default function MonitorDetailScreen() {
  const { monitorId, monitorName } = useLocalSearchParams<{
    monitorId: string;
    monitorName: string;
  }>();
  const colorScheme = useColorScheme();
  const { getMonitorStatus, getHeartbeats, retry, getCachedMonitorData } =
    useKumaData();
  const [status, setStatus] = useState<"up" | "down" | "loading" | "error">(
    "loading"
  );
  const [lastCheck, setLastCheck] = useState<string>("");
  const [heartbeats, setHeartbeats] = useState<Heartbeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when monitorId changes
  useEffect(() => {
    if (monitorId) {
      setStatus("loading");
      setLastCheck("");
      setHeartbeats([]);
      setLoading(true);
      setError(null);
    }
  }, [monitorId]);

  // Auto-refresh when screen comes into focus (with a small delay to allow preloading)
  useFocusEffect(
    useCallback(() => {
      if (monitorId) {
        // Small delay to allow preloaded data to be used
        const timeoutId = setTimeout(() => {
          loadMonitorData();
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    }, [monitorId, loadMonitorData])
  );

  const loadMonitorData = useCallback(async () => {
    if (!monitorId) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`Loading data for monitor ${monitorId}`);

      // Check for cached data first
      const cachedData = getCachedMonitorData(parseInt(monitorId));
      if (cachedData) {
        console.log(`Using cached data for monitor ${monitorId}`);
        setStatus(cachedData.status.status);
        setLastCheck(cachedData.status.lastCheck || "");
        setHeartbeats(cachedData.heartbeats);
        setLoading(false);
        return;
      }

      // Load fresh data if no cache
      const monitorStatus = await getMonitorStatus(parseInt(monitorId));
      console.log(`Monitor status:`, monitorStatus);
      setStatus(monitorStatus.status);
      setLastCheck(monitorStatus.lastCheck || "");

      // Load heartbeats
      const heartbeatData = await getHeartbeats(parseInt(monitorId));
      console.log(`Heartbeat data:`, heartbeatData);
      setHeartbeats(heartbeatData);
    } catch (error) {
      console.error("Error loading monitor data:", error);
      setStatus("error");
      setError(
        error instanceof Error ? error.message : "Failed to load monitor data"
      );
    } finally {
      setLoading(false);
    }
  }, [monitorId, getMonitorStatus, getHeartbeats, getCachedMonitorData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMonitorData();
    setRefreshing(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case "up":
        return "#10B981"; // green
      case "down":
        return "#EF4444"; // red
      case "error":
        return "#F59E0B"; // yellow
      default:
        return Colors[colorScheme ?? "light"].text;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "up":
        return "checkmark.circle.fill";
      case "down":
        return "xmark.circle.fill";
      case "error":
        return "exclamationmark.triangle.fill";
      default:
        return "arrow.clockwise";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "up":
        return "Operational";
      case "down":
        return "Down";
      case "error":
        return "Error";
      default:
        return "Loading...";
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } catch {
      return timeString;
    }
  };

  const formatDuration = (duration?: number, ping?: number) => {
    const value = duration || ping;
    if (!value) return null;

    if (value < 1000) return `${value}ms`;
    return `${(value / 1000).toFixed(1)}s`;
  };

  const getUptimePercentage = () => {
    if (heartbeats.length === 0) return 0;
    const upCount = heartbeats.filter((h) => h.status === "up").length;
    return Math.round((upCount / heartbeats.length) * 100);
  };

  const getAveragePing = () => {
    if (heartbeats.length === 0) return 0;
    const pings = heartbeats
      .map((h) => h.duration || h.ping)
      .filter((p) => p && p > 0);
    if (pings.length === 0) return 0;
    return Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
  };

  const getLastDownTime = () => {
    const lastDown = heartbeats.find((h) => h.status === "down");
    return lastDown ? formatTime(lastDown.time) : "Never";
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ThemedView style={styles.loadingContainer}>
          <IconSymbol
            name="arrow.clockwise"
            size={32}
            color={Colors[colorScheme ?? "light"].tint}
          />
          <ThemedText style={styles.loadingText}>
            Loading monitor details...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ThemedView style={styles.errorContainer}>
          <IconSymbol
            name="exclamationmark.triangle"
            size={48}
            color={Colors[colorScheme ?? "light"].tint}
          />
          <ThemedText style={styles.errorTitle}>
            Failed to Load Monitor
          </ThemedText>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <GlassButton
            title="Retry"
            icon="arrow.clockwise"
            variant="primary"
            size="md"
            onPress={loadMonitorData}
            style={styles.retryButton}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title} numberOfLines={2}>
            {monitorName || "Monitor Details"}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Monitor ID: {monitorId}
          </ThemedText>
        </ThemedView>

        {/* Status Card */}
        <ThemedView
          style={[
            styles.statusCard,
            {
              borderColor: Colors[colorScheme ?? "light"].border,
              backgroundColor: Colors[colorScheme ?? "light"].background,
            },
          ]}
        >
          <ThemedView style={styles.statusHeader}>
            <IconSymbol
              name={getStatusIcon()}
              size={40}
              color={getStatusColor()}
            />
            <ThemedView style={styles.statusTextContainer}>
              <ThemedText
                style={[styles.statusText, { color: getStatusColor() }]}
              >
                {getStatusText()}
              </ThemedText>
              <ThemedText style={styles.statusSubtext}>
                {lastCheck ? `Last check: ${lastCheck}` : "No recent data"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Stats */}
        <ThemedView style={styles.statsContainer}>
          <ThemedView
            style={[
              styles.statCard,
              {
                borderColor: Colors[colorScheme ?? "light"].border,
                backgroundColor: Colors[colorScheme ?? "light"].background,
              },
            ]}
          >
            <IconSymbol
              name="chart.bar.fill"
              size={24}
              color={Colors[colorScheme ?? "light"].tint}
            />
            <ThemedText style={styles.statNumber}>
              {getUptimePercentage()}%
            </ThemedText>
            <ThemedText style={styles.statLabel}>Uptime</ThemedText>
          </ThemedView>

          <ThemedView
            style={[
              styles.statCard,
              {
                borderColor: Colors[colorScheme ?? "light"].border,
                backgroundColor: Colors[colorScheme ?? "light"].background,
              },
            ]}
          >
            <IconSymbol
              name="clock"
              size={24}
              color={Colors[colorScheme ?? "light"].tint}
            />
            <ThemedText style={styles.statNumber}>
              {heartbeats.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Heartbeats</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Additional Stats */}
        {heartbeats.length > 0 && (
          <ThemedView style={styles.statsContainer}>
            <ThemedView
              style={[
                styles.statCard,
                {
                  borderColor: Colors[colorScheme ?? "light"].border,
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                },
              ]}
            >
              <IconSymbol
                name="speedometer"
                size={24}
                color={Colors[colorScheme ?? "light"].tint}
              />
              <ThemedText style={styles.statNumber}>
                {getAveragePing()}ms
              </ThemedText>
              <ThemedText style={styles.statLabel}>Avg Ping</ThemedText>
            </ThemedView>

            <ThemedView
              style={[
                styles.statCard,
                {
                  borderColor: Colors[colorScheme ?? "light"].border,
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                },
              ]}
            >
              <IconSymbol
                name="exclamationmark.triangle"
                size={24}
                color="#F59E0B"
              />
              <ThemedText style={styles.statNumber}>
                {getLastDownTime()}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Last Down</ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* Recent Heartbeats */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Heartbeats
          </ThemedText>

          {heartbeats.length > 0 ? (
            <ThemedView style={styles.heartbeatsList}>
              <ThemedText style={styles.heartbeatsSubtitle}>
                Showing last {Math.min(heartbeats.length, 20)} of{" "}
                {heartbeats.length} heartbeats
              </ThemedText>
              {heartbeats.slice(0, 20).map((heartbeat, index) => (
                <ThemedView
                  key={heartbeat.id || index}
                  style={[
                    styles.heartbeatCard,
                    {
                      borderColor: Colors[colorScheme ?? "light"].border,
                      backgroundColor:
                        Colors[colorScheme ?? "light"].background,
                    },
                  ]}
                >
                  <ThemedView style={styles.heartbeatHeader}>
                    <IconSymbol
                      name={
                        heartbeat.status === "up"
                          ? "checkmark.circle.fill"
                          : "xmark.circle.fill"
                      }
                      size={20}
                      color={heartbeat.status === "up" ? "#10B981" : "#EF4444"}
                    />
                    <ThemedView style={styles.heartbeatInfo}>
                      <ThemedText style={styles.heartbeatTime}>
                        {formatTime(heartbeat.time)}
                      </ThemedText>
                      {formatDuration(heartbeat.duration, heartbeat.ping) && (
                        <ThemedText style={styles.heartbeatPing}>
                          {formatDuration(heartbeat.duration, heartbeat.ping)}
                        </ThemedText>
                      )}
                    </ThemedView>
                  </ThemedView>

                  {heartbeat.msg && (
                    <ThemedText
                      style={styles.heartbeatMessage}
                      numberOfLines={2}
                    >
                      {heartbeat.msg}
                    </ThemedText>
                  )}
                </ThemedView>
              ))}
            </ThemedView>
          ) : (
            <ThemedView style={styles.emptyState}>
              <IconSymbol
                name="clock"
                size={32}
                color={Colors[colorScheme ?? "light"].text}
              />
              <ThemedText style={styles.emptyText}>
                No heartbeat data available
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 14,
  },
  statusCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  heartbeatsList: {
    gap: 8,
  },
  heartbeatsSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
    fontStyle: "italic",
  },
  heartbeatCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  heartbeatHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  heartbeatInfo: {
    flex: 1,
  },
  heartbeatTime: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  heartbeatPing: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: "500",
  },
  heartbeatMessage: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
  },
});
