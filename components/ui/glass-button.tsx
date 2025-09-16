import { DesignSystem } from "@/constants/design";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "./icon-symbol";

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function GlassButton({
  title,
  onPress,
  icon,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  textStyle,
}: GlassButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "light";

  const getVariantConfig = () => {
    switch (variant) {
      case "primary":
        return {
          gradientColors: isDark
            ? ["#007AFF", "#0051D5"]
            : ["#007AFF", "#0051D5"],
          textColor: "#FFFFFF",
          blurTint: "light" as const,
        };
      case "secondary":
        return {
          gradientColors: isDark
            ? ["rgba(120, 120, 128, 0.2)", "rgba(120, 120, 128, 0.1)"]
            : ["rgba(120, 120, 128, 0.2)", "rgba(120, 120, 128, 0.1)"],
          textColor: DesignSystem.colors[colorScheme ?? "light"].label,
          blurTint: "light" as const,
        };
      case "tertiary":
        return {
          gradientColors: isDark
            ? ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
            : ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.6)"],
          textColor: DesignSystem.colors[colorScheme ?? "light"].label,
          blurTint: "light" as const,
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 14,
          iconSize: 16,
          borderRadius: 8,
        };
      case "md":
        return {
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          iconSize: 18,
          borderRadius: 12,
        };
      case "lg":
        return {
          paddingHorizontal: 20,
          paddingVertical: 16,
          fontSize: 18,
          iconSize: 20,
          borderRadius: 16,
        };
    }
  };

  const config = getVariantConfig();
  const sizeConfig = getSizeConfig();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[style]}
    >
      <BlurView
        intensity={disabled ? 20 : 60}
        tint={config.blurTint}
        style={[
          styles.container,
          {
            borderRadius: sizeConfig.borderRadius,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={config.gradientColors}
          style={[
            styles.gradient,
            {
              paddingHorizontal: sizeConfig.paddingHorizontal,
              paddingVertical: sizeConfig.paddingVertical,
              borderRadius: sizeConfig.borderRadius - 1,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {icon && (
            <IconSymbol
              name={icon}
              size={sizeConfig.iconSize}
              color={config.textColor}
              style={styles.icon}
            />
          )}
          <ThemedText
            style={[
              styles.text,
              {
                fontSize: sizeConfig.fontSize,
                color: config.textColor,
              },
              textStyle,
            ]}
          >
            {title}
          </ThemedText>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    ...DesignSystem.shadows.sm,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: DesignSystem.spacing.sm,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
});
