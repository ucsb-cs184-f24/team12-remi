import React, { useState } from "react";
import {
  TouchableWithoutFeedback,
  Keyboard,
  View,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ImageBackground,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // Add this import
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../../firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import Ustyles from "../../components/UniversalStyles";
import ConditionalKeyboardAvoidingView from "./ConditionalKeyboardAvoidingView";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const profilePicPlaceholder = require("../../assets/placeholders/profile-pic.png");
  const [profilePic, setProfilePic] = useState<any>(profilePicPlaceholder);
  const router = useRouter(); // Initialize router

  // Image Picker Handler
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access camera roll is required!");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect for profile pic
        quality: 1,
      });
      if (!result.canceled) {
        setProfilePic(result.assets[0].uri); // Display the chosen image
      }
    } catch (error) {
      alert("An error occurred while selecting an image. Please try again.");
    }
  };

  const checkIfUsernameExists = async (username: string) => {
    const usersRef = collection(db, "RemiUsers");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if the username exists
  };

  const uploadImageToStorage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `images/${Date.now()}.jpg`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const signUp = async () => {
    setLoading(true);
    try {
      const usernameExists = await checkIfUsernameExists(username);
      if (usernameExists) {
        alert("Username is already taken. Please choose a different one.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Upload profile picture if one is chosen
      let mediaUrl = null;
      if (profilePic) {
        // If profilePic is not already a URL, upload it to storage
        if (typeof profilePic === "string" && !profilePic.startsWith("http")) {
          mediaUrl = await uploadImageToStorage(profilePic);
        } else {
          mediaUrl = null; // No upload needed for local placeholder or external URLs
        }
      }

      await setDoc(doc(db, "RemiUsers", user.uid), {
        username: username,
        email: email,
        friends_list: [],
        visibility: "private",
        profilePic: mediaUrl || profilePic || "",
      });

      alert("Account created successfully!");
      // router.push("/login");
    } catch (e: any) {
      const err = e;
      if (err.code === "auth/email-already-in-use") {
        alert(
          "This email is already associated with an account. Please use a different email or login with this existing email."
        );
      } else {
        alert("Registration failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ConditionalKeyboardAvoidingView>
        <LinearGradient
          colors={["#FFF9E6", "#BCD5AC"]}
          style={styles.backgroundGradient}
        >
          <ImageBackground
            source={require("../../assets/images/background-lineart.png")}
            style={styles.backgroundImage}
            imageStyle={styles.backgroundImageStyle}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#0D5F13" />
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>

            <Text style={Ustyles.header_2}> Create your account! </Text>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <TouchableOpacity
                style={styles.profileImageContainer}
                onPress={pickImage}
              >
                <View style={styles.outerCircle}>
                  <Image
                    source={
                      typeof profilePic === "string"
                        ? { uri: profilePic }
                        : profilePic
                    }
                    style={styles.profileImage}
                  />
                  <View style={styles.editOverlay}>
                    <Ionicons name="camera" size={24} color="#0D5F13" />
                  </View>
                </View>
                <Text style={Ustyles.seeNotesText}>Click to replace</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCorrect={false}
                autoCapitalize="none"
                placeholderTextColor="#BCD5AC"
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCorrect={false}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#BCD5AC"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                autoCorrect={false}
                autoCapitalize="none"
                secureTextEntry
                placeholderTextColor="#BCD5AC"
              />
              {loading ? (
                <ActivityIndicator size={"small"} style={{ margin: 28 }} />
              ) : (
                <TouchableOpacity style={styles.button} onPress={signUp}>
                  <Text style={Ustyles.header_2}>Submit</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </ImageBackground>
        </LinearGradient>
      </ConditionalKeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
    justifyContent: "space-evenly",
  },
  scrollContent: {
    marginVertical: 0,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    marginTop: 4,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderColor: "#0D5F13",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginLeft: 10,
    padding: 10,
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 5,
    color: "#0D5F13",
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    alignSelf: "center",
    marginVertical: 0,
    marginBottom: 40,
  },
  outerCircle: {
    justifyContent: "center",
    alignItems: "center",
    width: 160, // Adjust size as needed
    height: 160, // Adjust size as needed
    borderRadius: 90, // Half of width/height for a perfect circle
    borderColor: "#0D5F13", // Green color for the outer circle
    borderWidth: 4,
    marginBottom: 5,
  },
  profileImage: {
    width: 140, // Image size smaller than the inner circle
    height: 140,
    borderRadius: 70, // Half of width/height for a perfect circle
  },
  replaceText: {
    position: "absolute",
    bottom: -30,
    width: "100%",
    textAlign: "center",
    color: "#666",
    fontSize: 12,
  },
  button: {
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0D5F13",
    backgroundColor: "transparent",
    marginVertical: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  backgroundGradient: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.2,
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(255, 249, 230, 0.7)",
    borderRadius: 20,
    padding: 8,
  },
});
