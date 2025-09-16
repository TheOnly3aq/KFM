import { MonitorCard } from "@/components/MonitorCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { DesignSystem } from "@/constants/design";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useKumaData } from "@/hooks/useKumaData";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const { monitors, overallStatus, loading, error, refreshData, retry } =
    useKumaData();
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText
              style={[styles.title, DesignSystem.typography.largeTitle]}
            >
              KUMA Monitor
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, DesignSystem.typography.subhead]}
            >
              Uptime monitoring dashboard
            </ThemedText>
          </ThemedView>

          {/* Overall Status Card */}
          <GlassCard style={styles.statusCard} intensity={80}>
            <ThemedView style={styles.statusHeader}>
              <StatusIndicator status={overallStatus} size="lg" />
              <ThemedView style={styles.statusTextContainer}>
                <ThemedText
                  style={[styles.statusText, DesignSystem.typography.title3]}
                >
                  {getStatusText()}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.statusSubtext,
                    DesignSystem.typography.footnote,
                  ]}
                >
                  {loading ? "Checking status..." : "Last updated just now"}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </GlassCard>

          {/* Stats Cards */}
          <ThemedView style={styles.statsContainer}>
            <GlassCard style={styles.statCard} intensity={60}>
              <IconSymbol
                name="server.rack"
                size={24}
                color={DesignSystem.colors[colorScheme ?? "light"].link}
              />
              <ThemedText
                style={[styles.statNumber, DesignSystem.typography.title1]}
              >
                {monitors.length}
              </ThemedText>
              <ThemedText
                style={[styles.statLabel, DesignSystem.typography.caption1]}
              >
                Total Monitors
              </ThemedText>
            </GlassCard>

            <GlassCard style={styles.statCard} intensity={60}>
              <IconSymbol
                name="checkmark.circle"
                size={24}
                color={DesignSystem.colors[colorScheme ?? "light"].success}
              />
              <ThemedText
                style={[styles.statNumber, DesignSystem.typography.title1]}
              >
                {upMonitors}
              </ThemedText>
              <ThemedText
                style={[styles.statLabel, DesignSystem.typography.caption1]}
              >
                Operational
              </ThemedText>
            </GlassCard>

            {errorMonitors > 0 && (
              <GlassCard style={styles.statCard} intensity={60}>
                <IconSymbol
                  name="exclamationmark.triangle"
                  size={24}
                  color={DesignSystem.colors[colorScheme ?? "light"].warning}
                />
                <ThemedText
                  style={[styles.statNumber, DesignSystem.typography.title1]}
                >
                  {errorMonitors}
                </ThemedText>
                <ThemedText
                  style={[styles.statLabel, DesignSystem.typography.caption1]}
                >
                  Issues
                </ThemedText>
              </GlassCard>
            )}
          </ThemedView>

          {/* Quick Actions */}
          <ThemedView style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, DesignSystem.typography.title3]}
            >
              Quick Actions
            </ThemedText>
            <ThemedView style={styles.actionsContainer}>
              <Link href="/monitors" asChild>
                <GlassButton
                  title="View All Monitors"
                  icon="server.rack"
                  variant="primary"
                  size="md"
                  onPress={() => {}}
                  style={styles.actionButton}
                />
              </Link>

              <Link href="/settings" asChild>
                <GlassButton
                  title="Settings"
                  icon="gear"
                  variant="secondary"
                  size="md"
                  onPress={() => {}}
                  style={styles.actionButton}
                />
              </Link>
            </ThemedView>
          </ThemedView>

          {/* Recent Monitors */}
          {monitors.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText
                style={[styles.sectionTitle, DesignSystem.typography.title3]}
              >
                Recent Monitors
              </ThemedText>
              <ThemedView style={styles.monitorsList}>
                {monitors.slice(0, 3).map((monitor) => (
                  <MonitorCard key={monitor.id} monitor={monitor} />
                ))}
              </ThemedView>

              {errorMonitors > 0 && (
                <GlassCard style={styles.infoBox} intensity={40}>
                  <IconSymbol
                    name="info.circle"
                    size={16}
                    color={DesignSystem.colors[colorScheme ?? "light"].info}
                  />
                  <ThemedText
                    style={[styles.infoText, DesignSystem.typography.footnote]}
                  >
                    Some monitors show &quot;Error&quot; status. The app now
                    supports both JSON and SVG badge responses. If you still see
                    errors, check that the monitor endpoints are accessible.
                  </ThemedText>
                </GlassCard>
              )}
            </ThemedView>
          )}

          {error && (
            <GlassCard style={styles.errorState} intensity={60}>
              <IconSymbol
                name="exclamationmark.triangle"
                size={48}
                color={DesignSystem.colors[colorScheme ?? "light"].error}
              />
              <ThemedText
                style={[styles.errorText, DesignSystem.typography.title2]}
              >
                Connection Error
              </ThemedText>
              <ThemedText
                style={[styles.errorSubtext, DesignSystem.typography.body]}
              >
                {error}
              </ThemedText>
              <ThemedView style={styles.errorActions}>
                <GlassButton
                  title="Retry"
                  icon="arrow.clockwise"
                  variant="primary"
                  size="md"
                  onPress={retry}
                  style={styles.retryButton}
                />
                <Link href="/settings" asChild>
                  <GlassButton
                    title="Settings"
                    icon="gear"
                    variant="secondary"
                    size="md"
                    onPress={() => {}}
                    style={styles.settingsButton}
                  />
                </Link>
              </ThemedView>
            </GlassCard>
          )}

          {monitors.length === 0 && !loading && !error && (
            <GlassCard style={styles.emptyState} intensity={60}>
              <IconSymbol
                name="server.rack"
                size={48}
                color={DesignSystem.colors[colorScheme ?? "light"].label}
              />
              <ThemedText
                style={[styles.emptyText, DesignSystem.typography.title2]}
              >
                No monitors configured
              </ThemedText>
              <ThemedText
                style={[styles.emptySubtext, DesignSystem.typography.body]}
              >
                Set up your server URL and status page ID in settings
              </ThemedText>
              <Link href="/settings" asChild>
                <GlassButton
                  title="Go to Settings"
                  icon="gear"
                  variant="primary"
                  size="md"
                  onPress={() => {}}
                  style={styles.setupButton}
                />
              </Link>
            </GlassCard>
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
  header: {
    padding: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.xl,
  },
  title: {
    marginBottom: DesignSystem.spacing.xs,
  },
  subtitle: {
    opacity: 0.6,
  },
  statusCard: {
    margin: DesignSystem.spacing.lg,
    marginTop: 0,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.md,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    marginBottom: DesignSystem.spacing.xs,
  },
  statusSubtext: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.sm,
    marginBottom: DesignSystem.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: DesignSystem.spacing.sm,
  },
  statNumber: {
    fontWeight: "700",
  },
  statLabel: {
    opacity: 0.7,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    marginBottom: DesignSystem.spacing.md,
  },
  actionsContainer: {
    gap: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  actionButton: {
    width: "100%",
  },
  monitorsList: {
    gap: DesignSystem.spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    padding: DesignSystem.spacing.xxl,
    gap: DesignSystem.spacing.md,
  },
  emptyText: {
    textAlign: "center",
  },
  emptySubtext: {
    opacity: 0.7,
    textAlign: "center",
  },
  setupButton: {
    marginTop: DesignSystem.spacing.sm,
  },
  errorState: {
    alignItems: "center",
    padding: DesignSystem.spacing.xxl,
    gap: DesignSystem.spacing.md,
    margin: DesignSystem.spacing.lg,
  },
  errorText: {
    textAlign: "center",
  },
  errorSubtext: {
    opacity: 0.7,
    textAlign: "center",
  },
  errorActions: {
    flexDirection: "row",
    gap: DesignSystem.spacing.sm,
    marginTop: DesignSystem.spacing.sm,
  },
  retryButton: {
    flex: 1,
  },
  settingsButton: {
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DesignSystem.spacing.sm,
    marginTop: DesignSystem.spacing.sm,
  },
  infoText: {
    flex: 1,
    opacity: 0.8,
    lineHeight: 20,
  },
});
