import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, TextInput } from "react-native";

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
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Settings
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Configure your KUMA server
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Server Configuration
          </ThemedText>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Server URL</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme ?? "light"].text,
                  borderColor: Colors[colorScheme ?? "light"].border,
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                },
              ]}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="https://your-kuma-server.com"
              placeholderTextColor={Colors[colorScheme ?? "light"].text + "80"}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Status Page ID</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme ?? "light"].text,
                  borderColor: Colors[colorScheme ?? "light"].border,
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                },
              ]}
              value={statusPageId}
              onChangeText={setStatusPageId}
              placeholder="vroom"
              placeholderTextColor={Colors[colorScheme ?? "light"].text + "80"}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <ThemedView
              style={[
                styles.button,
                { backgroundColor: Colors[colorScheme ?? "light"].tint },
              ]}
              onTouchEnd={testConnection}
            >
              <IconSymbol name="wifi" size={20} color="white" />
              <ThemedText style={styles.buttonText}>Test Connection</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
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
              <ThemedText style={styles.label}>
                Refresh Interval (seconds)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme ?? "light"].text,
                    borderColor: Colors[colorScheme ?? "light"].border,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                ]}
                value={refreshInterval}
                onChangeText={setRefreshInterval}
                placeholder="30"
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].text + "80"
                }
                keyboardType="numeric"
              />
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <ThemedView
            style={[
              styles.saveButton,
              { backgroundColor: Colors[colorScheme ?? "light"].tint },
            ]}
            onTouchEnd={saveSettings}
          >
            <IconSymbol name="checkmark" size={20} color="white" />
            <ThemedText style={styles.buttonText}>Save Settings</ThemedText>
          </ThemedView>
        </ThemedView>
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
