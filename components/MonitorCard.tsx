import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { DesignSystem } from "@/constants/design";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useKumaData } from "@/hooks/useKumaData";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface Monitor {
  id: number;
  name: string;
  type: string;
  sendUrl: number;
  status?: "up" | "down" | "loading" | "error";
  lastCheck?: string;
}

interface MonitorCardProps {
  monitor: Monitor;
}

export function MonitorCard({ monitor }: MonitorCardProps) {
  const colorScheme = useColorScheme();
  const { preloadMonitorData } = useKumaData();

  // Use status from monitor prop, fallback to loading if not available
  const status = monitor.status || "loading";
  const lastCheck = monitor.lastCheck || "";

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

  const handlePress = async () => {
    // Preload data immediately when clicked
    preloadMonitorData(monitor.id);

    // Navigate immediately
    router.push({
      pathname: "/monitor-detail",
      params: {
        monitorId: monitor.id.toString(),
        monitorName: monitor.name,
      },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <GlassCard style={styles.card} intensity={60}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText
              style={[styles.name, DesignSystem.typography.headline]}
              numberOfLines={1}
            >
              {monitor.name}
            </ThemedText>
            <ThemedText style={[styles.type, DesignSystem.typography.caption1]}>
              {monitor.type.toUpperCase()}
            </ThemedText>
          </ThemedView>

          <StatusIndicator status={status} size="md" />
        </ThemedView>

        <ThemedView style={styles.footer}>
          <ThemedText
            style={[styles.statusText, DesignSystem.typography.callout]}
          >
            {getStatusText()}
          </ThemedText>
          {lastCheck && (
            <ThemedText
              style={[styles.lastCheck, DesignSystem.typography.caption2]}
            >
              {lastCheck}
            </ThemedText>
          )}
        </ThemedView>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: DesignSystem.spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: DesignSystem.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: DesignSystem.spacing.sm,
  },
  name: {
    marginBottom: DesignSystem.spacing.xs,
  },
  type: {
    opacity: 0.7,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontWeight: "600",
  },
  lastCheck: {
    opacity: 0.7,
  },
});
