import { MonitorCard } from "@/components/MonitorCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useKumaData } from "@/hooks/useKumaData";
import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

export default function MonitorsScreen() {
  const colorScheme = useColorScheme();
  const { monitors, loading, refreshData } = useKumaData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <IconSymbol
            name="arrow.clockwise"
            size={32}
            color={Colors[colorScheme ?? "light"].tint}
          />
          <ThemedText style={styles.loadingText}>
            Loading monitors...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Monitors
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {monitors.length} monitor{monitors.length !== 1 ? "s" : ""}{" "}
            configured
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.monitorsList}>
          {monitors.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}
        </ThemedView>

        {monitors.length === 0 && (
          <ThemedView style={styles.emptyState}>
            <IconSymbol
              name="server.rack"
              size={48}
              color={Colors[colorScheme ?? "light"].text}
            />
            <ThemedText style={styles.emptyText}>No monitors found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Check your server URL and status page ID in settings
            </ThemedText>
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
  monitorsList: {
    paddingHorizontal: 20,
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
});
