import { MonitorCard } from "@/components/MonitorCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useKumaData } from "@/hooks/useKumaData";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const { monitors, overallStatus, loading, refreshData } = useKumaData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getStatusColor = () => {
    switch (overallStatus) {
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
    switch (overallStatus) {
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
    switch (overallStatus) {
      case "up":
        return "All Systems Operational";
      case "down":
        return "Service Disruption";
      case "error":
        return "Connection Error";
      default:
        return "Loading...";
    }
  };

  const upMonitors = monitors.filter((monitor) => {
    return monitor.status === "up";
  }).length;

  const errorMonitors = monitors.filter((monitor) => {
    return monitor.status === "error";
  }).length;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            KUMA Monitor
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Uptime monitoring dashboard
          </ThemedText>
        </ThemedView>

        {/* Overall Status Card */}
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
              size={32}
              color={getStatusColor()}
            />
            <ThemedView style={styles.statusTextContainer}>
              <ThemedText
                style={[styles.statusText, { color: getStatusColor() }]}
              >
                {getStatusText()}
              </ThemedText>
              <ThemedText style={styles.statusSubtext}>
                {loading ? "Checking status..." : "Last updated just now"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Stats Cards */}
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
              name="server.rack"
              size={24}
              color={Colors[colorScheme ?? "light"].tint}
            />
            <ThemedText style={styles.statNumber}>{monitors.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Monitors</ThemedText>
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
            <IconSymbol name="checkmark.circle" size={24} color="#10B981" />
            <ThemedText style={styles.statNumber}>{upMonitors}</ThemedText>
            <ThemedText style={styles.statLabel}>Operational</ThemedText>
          </ThemedView>

          {errorMonitors > 0 && (
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
              <ThemedText style={styles.statNumber}>{errorMonitors}</ThemedText>
              <ThemedText style={styles.statLabel}>Issues</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <ThemedView style={styles.actionsContainer}>
            <Link href="/monitors" asChild>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
              >
                <IconSymbol name="server.rack" size={20} color="white" />
                <ThemedText style={styles.actionText}>
                  View All Monitors
                </ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href="/settings" asChild>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                    borderColor: Colors[colorScheme ?? "light"].border,
                  },
                ]}
              >
                <IconSymbol
                  name="gear"
                  size={20}
                  color={Colors[colorScheme ?? "light"].text}
                />
                <ThemedText
                  style={[
                    styles.actionText,
                    { color: Colors[colorScheme ?? "light"].text },
                  ]}
                >
                  Settings
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </ThemedView>
        </ThemedView>

        {/* Recent Monitors */}
        {monitors.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Recent Monitors
            </ThemedText>
            <ThemedView style={styles.monitorsList}>
              {monitors.slice(0, 3).map((monitor) => (
                <MonitorCard key={monitor.id} monitor={monitor} />
              ))}
            </ThemedView>

            {errorMonitors > 0 && (
              <ThemedView
                style={[
                  styles.infoBox,
                  {
                    borderColor: Colors[colorScheme ?? "light"].border,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                ]}
              >
                <IconSymbol
                  name="info.circle"
                  size={16}
                  color={Colors[colorScheme ?? "light"].tint}
                />
                <ThemedText style={styles.infoText}>
                  Some monitors show "Error" status. The app now supports both
                  JSON and SVG badge responses. If you still see errors, check
                  that the monitor endpoints are accessible.
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}

        {monitors.length === 0 && !loading && (
          <ThemedView style={styles.emptyState}>
            <IconSymbol
              name="server.rack"
              size={48}
              color={Colors[colorScheme ?? "light"].text}
            />
            <ThemedText style={styles.emptyText}>
              No monitors configured
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Set up your server URL and status page ID in settings
            </ThemedText>
            <Link href="/settings" asChild>
              <TouchableOpacity
                style={[
                  styles.setupButton,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
              >
                <ThemedText style={styles.setupButtonText}>
                  Go to Settings
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
    fontSize: 16,
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
    fontSize: 18,
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
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  actionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  monitorsList: {
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  setupButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  setupButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});
