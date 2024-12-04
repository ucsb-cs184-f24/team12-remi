import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { View, ActivityIndicator } from "react-native";

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ title: "Home", headerShown: false }}
      />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="Next" options={{ headerShown: false }} />
      <Stack.Screen name="UserProfileInfo" options={{ title: "Profile" }} />
    </Stack>
  );
};
export default AuthLayout;
