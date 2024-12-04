import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import * as Font from "expo-font";
import {
  useFonts,
  OrelegaOne_400Regular,
} from "@expo-google-fonts/orelega-one";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import Ustyles from "../components/UniversalStyles";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";

SplashScreen.preventAutoHideAsync();

async function signInWithUsername(username: string, password: string) {
  try {
    // Query Firestore to find the user document with the given username
    const usersRef = collection(db, "RemiUsers");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("User not found");
    }

    // Assume username is unique, so we can safely get the first document
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Use the email associated with the username to sign in
    const userCredential = await signInWithEmailAndPassword(
      auth,
      userData.email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in with username:", error);
    throw error;
  }
}

export default function Index() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithUsername(username, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Sign in failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  let [fontsLoaded] = useFonts({
    OrelegaOne_400Regular,
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_400Regular,
  });

  // Prepare the app and hide the splash screen once fonts are loaded
  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    }
    prepare();
  }, [fontsLoaded]);

  // Avoid rendering the main content until the splash screen is hidden
  if (!appIsReady) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={Ustyles.background}>
        <ImageBackground
          source={require("../assets/images/background-lineart.png")}
          style={Ustyles.backgroundImage}
        >
          <View style={styles.container}>
            <ImageBackground
              source={require("../assets/images/bg-ellipse.png")}
              style={{ justifyContent: "center" }}
              resizeMode="contain"
            >
              <Text style={Ustyles.logotext}>remi</Text>
            </ImageBackground>
            <KeyboardAvoidingView behavior="padding">
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCorrect={false}
                autoCapitalize="none"
                placeholderTextColor="#BCD5AC"
                placeholder="Username"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  placeholder="Password"
                  placeholderTextColor="#BCD5AC"
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#0D5F13"
                  />
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator size={"small"} style={{ margin: 28 }} />
              ) : (
                <View style={Ustyles.buttonContainer}>
                  <TouchableOpacity style={Ustyles.button} onPress={signIn}>
                    <Text style={Ustyles.header_2}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={Ustyles.button}
                    onPress={() => router.push("/register")}
                  >
                    <Text style={Ustyles.header_2}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              )}
            </KeyboardAvoidingView>
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: "space-evenly",
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
    borderColor: "#0D5F13",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: "#fff",
    borderColor: "#0D5F13",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    padding: 10,
  },
  eyeIcon: {
    padding: 10,
  },
});
