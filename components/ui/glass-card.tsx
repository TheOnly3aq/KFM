import { DesignSystem } from "@/constants/design";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: "light" | "dark" | "default";
  borderRadius?: number;
  padding?: number;
  margin?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 80,
  tint = "default",
  borderRadius = 16,
  padding = 16,
  margin = 0,
}: GlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const blurTint = tint === "default" ? (isDark ? "dark" : "light") : tint;

  const cardStyle = [
    styles.card,
    {
      borderRadius,
      padding,
      margin,
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      ...DesignSystem.shadows.sm,
    },
    style,
  ];

  return (
    <BlurView intensity={intensity} tint={blurTint} style={cardStyle}>
      <LinearGradient
        colors={
          isDark
            ? ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
            : ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.6)"]
        }
        style={[styles.gradient, { borderRadius: borderRadius - 1 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderWidth: 0.5,
  },
  gradient: {
    flex: 1,
    padding: 1,
  },
});
