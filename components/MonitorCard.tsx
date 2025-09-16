import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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

  // Use status from monitor prop, fallback to loading if not available
  const status = monitor.status || "loading";
  const lastCheck = monitor.lastCheck || "";

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

  const handlePress = () => {
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
      <ThemedView
        style={[
          styles.card,
          {
            borderColor: Colors[colorScheme ?? "light"].border,
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        ]}
      >
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {monitor.name}
            </ThemedText>
            <ThemedText style={styles.type}>
              {monitor.type.toUpperCase()}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.statusContainer}>
            <IconSymbol
              name={getStatusIcon()}
              size={24}
              color={getStatusColor()}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.footer}>
          <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </ThemedText>
          {lastCheck && (
            <ThemedText style={styles.lastCheck}>{lastCheck}</ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: "500",
  },
  statusContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  lastCheck: {
    fontSize: 12,
    opacity: 0.7,
  },
});
