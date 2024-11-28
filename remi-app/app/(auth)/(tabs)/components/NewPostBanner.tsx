import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";

interface NewPostBannerProps {
  onPress: () => void;
}

export const NewPostBanner: React.FC<NewPostBannerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="New posts available. Tap to refresh."
    >
      <Text style={styles.bannerText}>New posts available</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0D5F13",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  bannerText: {
    color: "#FFF9E6",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
});
