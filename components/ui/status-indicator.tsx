import { DesignSystem } from "@/constants/design";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { IconSymbol } from "./icon-symbol";

interface StatusIndicatorProps {
  status: "up" | "down" | "loading" | "error";
  size?: "sm" | "md" | "lg";
  showPulse?: boolean;
  style?: ViewStyle;
}

export function StatusIndicator({
  status,
  size = "md",
  showPulse = true,
  style,
}: StatusIndicatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const getStatusConfig = () => {
    switch (status) {
      case "up":
        return {
          icon: "checkmark.circle.fill",
          color: DesignSystem.colors[colorScheme ?? "light"].success,
          gradientColors: isDark
            ? ["#30D158", "#28CD41"]
            : ["#34C759", "#30A46C"],
        };
      case "down":
        return {
          icon: "xmark.circle.fill",
          color: DesignSystem.colors[colorScheme ?? "light"].error,
          gradientColors: isDark
            ? ["#FF453A", "#FF3B30"]
            : ["#FF3B30", "#E34850"],
        };
      case "error":
        return {
          icon: "exclamationmark.triangle.fill",
          color: DesignSystem.colors[colorScheme ?? "light"].warning,
          gradientColors: isDark
            ? ["#FF9F0A", "#FF9500"]
            : ["#FF9500", "#FF8C00"],
        };
      case "loading":
        return {
          icon: "arrow.clockwise",
          color: DesignSystem.colors[colorScheme ?? "light"].label,
          gradientColors: isDark
            ? ["#8E8E93", "#636366"]
            : ["#8E8E93", "#636366"],
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return { size: 16, containerSize: 24 };
      case "md":
        return { size: 20, containerSize: 32 };
      case "lg":
        return { size: 24, containerSize: 40 };
    }
  };

  const config = getStatusConfig();
  const sizeConfig = getSizeConfig();

  return (
    <BlurView
      intensity={60}
      tint={isDark ? "dark" : "light"}
      style={[
        styles.container,
        {
          width: sizeConfig.containerSize,
          height: sizeConfig.containerSize,
          borderRadius: sizeConfig.containerSize / 2,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={config.gradientColors}
        style={[
          styles.gradient,
          {
            width: sizeConfig.containerSize,
            height: sizeConfig.containerSize,
            borderRadius: sizeConfig.containerSize / 2,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <IconSymbol name={config.icon} size={sizeConfig.size} color="white" />
      </LinearGradient>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    ...DesignSystem.shadows.sm,
  },
  gradient: {
    justifyContent: "center",
    alignItems: "center",
  },
});
