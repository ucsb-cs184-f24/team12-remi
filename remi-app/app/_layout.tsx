import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { User, onAuthStateChanged } from 'firebase/auth'; 
import { View, ActivityIndicator } from 'react-native';


export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();

  const changedAuthState = (user: User | null) => {
    console.log('onAuthStateChanged', user);
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, changedAuthState);
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;

    console.log('Segments are: ', segments);
    const inAuthGroup = segments && segments[0] === '(auth)';
    
    if (user && !inAuthGroup) {
      router.replace('./(tabs)/home'); 
    } else if (!user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, initializing]);

  if (initializing) {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
<<<<<<< HEAD
      <Stack.Screen name="index" options={{ headerShown: false }} />
=======
      <Stack.Screen name="index" options={{ headerTitle: 'Login' }} />
>>>>>>> 449284b (Changed welcome.tsx name to register, and notifications to its own page)
      <Stack.Screen name="notifications" options={{ headerTitle: 'Notifications' }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}
