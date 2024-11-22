import React from "react";
import { View, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

interface Props {
  children: React.ReactNode;
  // You can add any additional props that KeyboardAvoidingView accepts
  keyboardVerticalOffset?: number;
}

export const ConditionalKeyboardAvoidingView: React.FC<Props> = ({
  children,
  keyboardVerticalOffset = 0,
}) => {
  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        {children}
      </KeyboardAvoidingView>
    );
  }

  // On Android, just render the children without KeyboardAvoidingView
  return <View style={{ flex: 1 }}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
    justifyContent: "space-evenly",
  },
});
