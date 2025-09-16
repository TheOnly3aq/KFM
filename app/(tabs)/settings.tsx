import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { DesignSystem } from "@/constants/design";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEYS = {
  SERVER_URL: "kuma_server_url",
  STATUS_PAGE_ID: "kuma_status_page_id",
  AUTO_REFRESH: "kuma_auto_refresh",
  REFRESH_INTERVAL: "kuma_refresh_interval",
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [serverUrl, setServerUrl] = useState("");
  const [statusPageId, setStatusPageId] = useState("vroom");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [url, pageId, refresh, interval] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL),
        AsyncStorage.getItem(STORAGE_KEYS.STATUS_PAGE_ID),
        AsyncStorage.getItem(STORAGE_KEYS.AUTO_REFRESH),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_INTERVAL),
      ]);

      setServerUrl(url || "");
      setStatusPageId(pageId || "vroom");
      setAutoRefresh(refresh === "true");
      setRefreshInterval(interval || "30");
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.SERVER_URL, serverUrl),
        AsyncStorage.setItem(STORAGE_KEYS.STATUS_PAGE_ID, statusPageId),
        AsyncStorage.setItem(STORAGE_KEYS.AUTO_REFRESH, autoRefresh.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_INTERVAL, refreshInterval),
      ]);
      Alert.alert("Success", "Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings");
    }
  };

  const testConnection = async () => {
    if (!serverUrl || !statusPageId) {
      Alert.alert("Error", "Please enter both server URL and status page ID");
      return;
    }

    try {
      const url = `${serverUrl}/api/status-page/${statusPageId}`;
      console.log("Testing connection to:", url);

      const response = await fetch(url);

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          Alert.alert("Success", "Connection successful!");
        } else {
          const responseText = await response.text();
          if (responseText.includes("<svg")) {
            Alert.alert(
              "Success",
              "Connection successful! (SVG badge response detected)"
            );
          } else {
            Alert.alert(
              "Warning",
              "Connection successful but server returned non-JSON response. This might indicate an issue with the status page ID."
            );
          }
        }
      } else {
        const responseText = await response.text();
        console.error("Server response:", responseText.substring(0, 200));
        Alert.alert(
          "Error",
          `Connection failed: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Connection test error:", error);
      Alert.alert(
        "Error",
        `Failed to connect to server: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

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
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.header}>
            <ThemedText
              style={[styles.title, DesignSystem.typography.largeTitle]}
            >
              Settings
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, DesignSystem.typography.subhead]}
            >
              Configure your KUMA server
            </ThemedText>
          </ThemedView>

          <GlassCard style={styles.section} intensity={60}>
            <ThemedText
              style={[styles.sectionTitle, DesignSystem.typography.title3]}
            >
              Server Configuration
            </ThemedText>

            <ThemedView style={styles.inputGroup}>
              <ThemedText
                style={[styles.label, DesignSystem.typography.callout]}
              >
                Server URL
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: DesignSystem.colors[colorScheme ?? "light"].label,
                    borderColor:
                      DesignSystem.colors[colorScheme ?? "light"].separator,
                    backgroundColor:
                      DesignSystem.colors[colorScheme ?? "light"].systemFill,
                  },
                ]}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://your-kuma-server.com"
                placeholderTextColor={
                  DesignSystem.colors[colorScheme ?? "light"].tertiaryLabel
                }
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText
                style={[styles.label, DesignSystem.typography.callout]}
              >
                Status Page ID
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: DesignSystem.colors[colorScheme ?? "light"].label,
                    borderColor:
                      DesignSystem.colors[colorScheme ?? "light"].separator,
                    backgroundColor:
                      DesignSystem.colors[colorScheme ?? "light"].systemFill,
                  },
                ]}
                value={statusPageId}
                onChangeText={setStatusPageId}
                placeholder="vroom"
                placeholderTextColor={
                  DesignSystem.colors[colorScheme ?? "light"].tertiaryLabel
                }
                autoCapitalize="none"
                autoCorrect={false}
              />
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
              <GlassButton
                title="Test Connection"
                icon="wifi"
                variant="primary"
                size="md"
                onPress={testConnection}
                style={styles.testButton}
              />
            </ThemedView>
          </GlassCard>

          <GlassCard style={styles.section} intensity={60}>
            <ThemedText
              style={[styles.sectionTitle, DesignSystem.typography.title3]}
            >
              Refresh Settings
            </ThemedText>

            <ThemedView style={styles.switchRow}>
              <ThemedView style={styles.switchLabel}>
                <ThemedText style={styles.label}>Auto Refresh</ThemedText>
                <ThemedText style={styles.switchDescription}>
                  Automatically refresh monitor data
                </ThemedText>
              </ThemedView>
              <Switch
                value={autoRefresh}
                onValueChange={setAutoRefresh}
                trackColor={{
                  false: "#767577",
                  true: Colors[colorScheme ?? "light"].tint,
                }}
                thumbColor={autoRefresh ? "white" : "#f4f3f4"}
              />
            </ThemedView>

            {autoRefresh && (
              <ThemedView style={styles.inputGroup}>
                <ThemedText
                  style={[styles.label, DesignSystem.typography.callout]}
                >
                  Refresh Interval (seconds)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: DesignSystem.colors[colorScheme ?? "light"].label,
                      borderColor:
                        DesignSystem.colors[colorScheme ?? "light"].separator,
                      backgroundColor:
                        DesignSystem.colors[colorScheme ?? "light"].systemFill,
                    },
                  ]}
                  value={refreshInterval}
                  onChangeText={setRefreshInterval}
                  placeholder="30"
                  placeholderTextColor={
                    DesignSystem.colors[colorScheme ?? "light"].tertiaryLabel
                  }
                  keyboardType="numeric"
                />
              </ThemedView>
            )}
          </GlassCard>

          <ThemedView style={styles.buttonContainer}>
            <GlassButton
              title="Save Settings"
              icon="checkmark"
              variant="primary"
              size="lg"
              onPress={saveSettings}
              style={styles.saveButton}
            />
          </ThemedView>
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
    paddingBottom: DesignSystem.spacing.md,
  },
  title: {
    marginBottom: DesignSystem.spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
  },
  section: {
    margin: DesignSystem.spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: DesignSystem.spacing.md,
  },
  inputGroup: {
    marginBottom: DesignSystem.spacing.md,
  },
  label: {
    marginBottom: DesignSystem.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.md,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DesignSystem.spacing.md,
  },
  switchLabel: {
    flex: 1,
    marginRight: DesignSystem.spacing.md,
  },
  switchDescription: {
    opacity: 0.7,
    marginTop: DesignSystem.spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.md,
  },
  testButton: {
    width: "100%",
  },
  saveButton: {
    width: "100%",
  },
});
