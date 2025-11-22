import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppHeaderProps {
  readonly onStartPress?: () => void;
  readonly onStopPress?: () => void;
}

type HeaderButtonVariant = "primary" | "secondary";

interface HeaderButtonProps {
  readonly label: string;
  readonly onPress?: () => void;
  readonly variant?: HeaderButtonVariant;
  readonly iconName?: keyof typeof Ionicons.glyphMap;
}

export function AppHeader({ onStartPress, onStopPress }: AppHeaderProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Bloc titre + accroche */}
        <View style={styles.textBlock}>
          <Text style={styles.title} accessibilityRole="header">
            Tableau de Bord d&#39;Analyse de l&#39;Écriture
          </Text>

          <Text style={styles.subtitle}>
            Écris le mot dans la zone et observe les paramètres en temps réel.
          </Text>
        </View>

        {/* Bandeau de navigation */}
        <View style={styles.navBar}>
          <HeaderButton
            label="Démarrer"
            onPress={onStartPress}
            variant="primary"
            iconName="play"
          />
          <HeaderButton
            label="Terminé"
            onPress={onStopPress}
            variant="secondary"
            iconName="stop"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function HeaderButton({
  label,
  onPress,
  variant = "primary",
  iconName,
}: HeaderButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.buttonContent}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={16}
            color={isPrimary ? "#ffffff" : "#f7f8faff"}
            style={styles.buttonIcon}
          />
        )}
        <Text
          style={
            isPrimary ? styles.buttonPrimaryText : styles.buttonSecondaryText
          }
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#f5ddcfff", 
  },
  container: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 1000, 
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: "center",
    gap: 12,
  },
  textBlock: {
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 22, // "h1" mobile
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14, // "h3"
    color: "#4b5563",
    textAlign: "center",
  },
  navBar: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    maxWidth: 800,
    width: "100%",
    flexWrap: "wrap",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3e6e6ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3, // ombre Android
    justifyContent: "center",
  },
  buttonBase: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.1,
    elevation: 3, // ombre Android
  },
  buttonPrimary: {
    backgroundColor: "#19191aff",
    borderColor: "#090909ff",
  },
  buttonSecondary: {
    backgroundColor: "#e02d2dff",
    borderColor: "#fd3807ff",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonPrimaryText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonSecondaryText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
  },
});
