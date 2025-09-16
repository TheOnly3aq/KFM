import { Platform } from "react-native";

export const DesignSystem = {
  // iOS Liquid Glass Colors
  colors: {
    light: {
      // System Colors
      systemBackground: "#FFFFFF",
      secondarySystemBackground: "#F2F2F7",
      tertiarySystemBackground: "#FFFFFF",
      systemGroupedBackground: "#F2F2F7",
      secondarySystemGroupedBackground: "#FFFFFF",
      tertiarySystemGroupedBackground: "#F2F2F7",

      // Label Colors
      label: "#000000",
      secondaryLabel: "#3C3C43",
      tertiaryLabel: "#3C3C43",
      quaternaryLabel: "#2C2C2E",

      // Fill Colors
      systemFill: "rgba(120, 120, 128, 0.2)",
      secondarySystemFill: "rgba(120, 120, 128, 0.16)",
      tertiarySystemFill: "rgba(118, 118, 128, 0.12)",
      quaternarySystemFill: "rgba(116, 116, 128, 0.08)",

      // Separator Colors
      separator: "rgba(60, 60, 67, 0.29)",
      opaqueSeparator: "#C6C6C8",

      // Link Colors
      link: "#007AFF",

      // Status Colors
      success: "#34C759",
      warning: "#FF9500",
      error: "#FF3B30",
      info: "#007AFF",

      // Glass Effect Colors
      glassBackground: "rgba(255, 255, 255, 0.8)",
      glassBorder: "rgba(255, 255, 255, 0.2)",
      glassShadow: "rgba(0, 0, 0, 0.1)",
    },
    dark: {
      // System Colors
      systemBackground: "#000000",
      secondarySystemBackground: "#1C1C1E",
      tertiarySystemBackground: "#2C2C2E",
      systemGroupedBackground: "#000000",
      secondarySystemGroupedBackground: "#1C1C1E",
      tertiarySystemGroupedBackground: "#2C2C2E",

      // Label Colors
      label: "#FFFFFF",
      secondaryLabel: "#EBEBF5",
      tertiaryLabel: "#EBEBF5",
      quaternaryLabel: "#EBEBF5",

      // Fill Colors
      systemFill: "rgba(120, 120, 128, 0.36)",
      secondarySystemFill: "rgba(120, 120, 128, 0.32)",
      tertiarySystemFill: "rgba(118, 118, 128, 0.24)",
      quaternarySystemFill: "rgba(116, 116, 128, 0.18)",

      // Separator Colors
      separator: "rgba(84, 84, 88, 0.6)",
      opaqueSeparator: "#38383A",

      // Link Colors
      link: "#0A84FF",

      // Status Colors
      success: "#30D158",
      warning: "#FF9F0A",
      error: "#FF453A",
      info: "#0A84FF",

      // Glass Effect Colors
      glassBackground: "rgba(28, 28, 30, 0.8)",
      glassBorder: "rgba(255, 255, 255, 0.1)",
      glassShadow: "rgba(0, 0, 0, 0.3)",
    },
  },

  // Typography
  typography: {
    largeTitle: {
      fontSize: 34,
      fontWeight: "700" as const,
      lineHeight: 41,
      letterSpacing: 0.37,
    },
    title1: {
      fontSize: 28,
      fontWeight: "700" as const,
      lineHeight: 34,
      letterSpacing: 0.36,
    },
    title2: {
      fontSize: 22,
      fontWeight: "700" as const,
      lineHeight: 28,
      letterSpacing: 0.35,
    },
    title3: {
      fontSize: 20,
      fontWeight: "600" as const,
      lineHeight: 25,
      letterSpacing: 0.38,
    },
    headline: {
      fontSize: 17,
      fontWeight: "600" as const,
      lineHeight: 22,
      letterSpacing: -0.41,
    },
    body: {
      fontSize: 17,
      fontWeight: "400" as const,
      lineHeight: 22,
      letterSpacing: -0.41,
    },
    callout: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 21,
      letterSpacing: -0.32,
    },
    subhead: {
      fontSize: 15,
      fontWeight: "400" as const,
      lineHeight: 20,
      letterSpacing: -0.24,
    },
    footnote: {
      fontSize: 13,
      fontWeight: "400" as const,
      lineHeight: 18,
      letterSpacing: -0.08,
    },
    caption1: {
      fontSize: 12,
      fontWeight: "400" as const,
      lineHeight: 16,
      letterSpacing: 0,
    },
    caption2: {
      fontSize: 11,
      fontWeight: "400" as const,
      lineHeight: 13,
      letterSpacing: 0.07,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Glass Effects
  glass: {
    light: {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(20px)",
    },
    dark: {
      backgroundColor: "rgba(28, 28, 30, 0.8)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
    },
  },

  // Animation Durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Platform specific
  platform: {
    isIOS: Platform.OS === "ios",
    isAndroid: Platform.OS === "android",
  },
};
