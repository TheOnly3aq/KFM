import { MonitorCard } from "@/components/MonitorCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GlassButton } from "@/components/ui/glass-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { DesignSystem } from "@/constants/design";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useKumaData } from "@/hooks/useKumaData";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MonitorsScreen() {
  const colorScheme = useColorScheme();
  const { monitors, loading, error, refreshData, retry } = useKumaData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  if (loading && !refreshing) {
    return (
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#000000", "#1C1C1E", "#2C2C2E"]
            : ["#F2F2F7", "#FFFFFF", "#F8F9FA"]
        }
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={
        colorScheme === "dark"
          ? ["#000000", "#1C1C1E", "#2C2C2E"]
          : ["#F2F2F7", "#FFFFFF", "#F8F9FA"]
      }
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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

          {error && (
            <ThemedView style={styles.errorState}>
              <IconSymbol
                name="exclamationmark.triangle"
                size={48}
                color={DesignSystem.colors[colorScheme ?? "light"].error}
              />
              <ThemedText style={styles.errorText}>Connection Error</ThemedText>
              <ThemedText style={styles.errorSubtext}>{error}</ThemedText>
              <GlassButton
                title="Retry"
                icon="arrow.clockwise"
                variant="primary"
                size="md"
                onPress={retry}
                style={styles.retryButton}
              />
            </ThemedView>
          )}

          {monitors.length === 0 && !error && (
            <ThemedView style={styles.emptyState}>
              <IconSymbol
                name="server.rack"
                size={48}
                color={Colors[colorScheme ?? "light"].text}
              />
              <ThemedText style={styles.emptyText}>
                No monitors found
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Check your server URL and status page ID in settings
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: DesignSystem.spacing.xl,
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
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
  },
  errorSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
  },
});
