import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { View, ActivityIndicator } from "react-native";

const AuthLayout = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();

  const changedAuthState = (user: User | null) => {
    console.log("onAuthStateChanged", user);
    console.log(segments);

    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, changedAuthState);
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;

    // console.log('Segments are: ', segments);
    console.log("and is: ", segments, segments[0]);

    const inAuthGroup = segments && segments[0] === "(tabs)";

    if (user && !inAuthGroup) {
      router.replace("./home");
    } else if (!user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, initializing]);
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="Next" options={{ headerShown: false }} />
    </Stack>
  );
};
export default AuthLayout;
