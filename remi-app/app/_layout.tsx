import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();

  const changedAuthState = (user: User | null) => {
    console.log("onAuthStateChanged", user);
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, changedAuthState);
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;

    console.log("Segments are: ", segments);
    const inAuthGroup = segments && segments[0] === "(auth)";

    if (user && !inAuthGroup) {
      router.replace("./(tabs)/home");
    } else if (!user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, initializing]);

  if (initializing) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="poo" options={{ headerShown: false }} />
      {/* <Stack.Screen name="friends" options={{ headerShown: false }} /> */}

      <Stack.Screen
        name="friends"
        options={{
          headerTitle: "Friends",
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: "#FFF9E6",
          },
          headerTitleStyle: {
            fontFamily: "Nunito_700Bold",
            fontSize: 25,
            color: "#0D5F13",
          },
          headerTintColor: "#0D5F13",
        }}
      />

      <Stack.Screen
        name="notifications"
        options={{
          headerTitle: "Notifications",
          headerStyle: {
            backgroundColor: "#FFF9E6", // Background color of the header
          },
          headerTitleStyle: {
            fontFamily: "Nunito_700Bold",
            fontSize: 25,
            color: "#0D5F13", // Text color
          },
        }}
      />
      <Stack.Screen
        name="(auth)"
        options={{ headerTitle: "Home", headerShown: false }}
      />
    </Stack>
  );
}
