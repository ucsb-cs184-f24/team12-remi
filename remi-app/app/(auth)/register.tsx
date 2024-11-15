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
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
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

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(
    "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
  );
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
      const mediaUrl = profilePic.startsWith("http")
        ? null
        : await uploadImageToStorage(profilePic);

      await setDoc(doc(db, "RemiUsers", user.uid), {
        username: username,
        email: email,
        friends_list: [],
        visibility: "private",
        profilePic: mediaUrl || profilePic,
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
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0D5F13" />
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={pickImage}
          >
            <Image source={{ uri: profilePic }} style={styles.profileImage} />
            <Text style={styles.replaceText}>Click to replace</Text>
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
            <TouchableOpacity style={Ustyles.button} onPress={signUp}>
              <Text style={Ustyles.header_2}>Create Account</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginVertical: 50,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
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
  },
  backButtonText: {
    marginLeft: 5,
    color: "#0D5F13",
    fontSize: 16,
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: "#0D5F13",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    alignSelf: "center",
    marginVertical: 60,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
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
    backgroundColor: "#0D5F13",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
