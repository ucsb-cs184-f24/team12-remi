import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import Spacer from "@/components/Spacer";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { FirebaseError } from "firebase/app";
import { auth, db, storage } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import * as FileSystem from "expo-file-system";

interface Params {
  image: string;
  title: string;
  caption: string;
  selectedTags: string[];
}

const uploadImageToStorage = async (uri: string): Promise<string> => {
  try {
    console.log("What am i now: ", uri);
    if (!uri) throw new Error("Image URI is null or undefined.");
    const response = await fetch(uri);
    if (!response.ok) throw new Error("Failed to fetch the image.");
    const blob = await response.blob();
    const storageRef = ref(storage, `images/${Date.now()}.jpg`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log(
            `Upload is ${((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(2)}% done`
          );
        },
        (error) => {
          console.error("Upload failed", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    alert(`Image upload failed: ${(error as Error).message}`);
    throw error;
  }
};

export default function App() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const { image, title, caption, selectedTags } = params;
  const [price, setPrice] = useState<number>(1.5);
  const [difficulty, setDifficulty] = useState<number>(4.5);
  const [time, setTime] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [decodedImage, setDecodedImage] = useState("");

  useEffect(() => {
    if (image) {
      let decoded = decodeURIComponent(image as string);

      if (Platform.OS === "android") {
        decoded = decoded.replace(/%40/g, "%2540").replace(/%2F/g, "%252F");
      }
      setDecodedImage(decoded);
    }
  }, [image]);

  const handleSubmit = async () => {
    console.log("Image link in Next.tsx", decodedImage);
    if (!decodedImage) {
      alert("Please select an image.");
      return;
    }
    if (!caption.trim()) {
      alert("Caption is required.");
      return;
    }
    if (selectedTags.length == 0) {
      alert("Please add at least one hashtag.");
      return;
    }
    setLoading(true);
    try {
      let mediaUrl = "";

      if (decodedImage) {
        console.log("have image");
        mediaUrl = await uploadImageToStorage(decodedImage);
        console.log(mediaUrl);
      }
      const docRef = doc(db, "Posts", `${Date.now()}`);
      await setDoc(docRef, {
        title: title,
        caption: caption,
        hashtags: selectedTags,
        mediaUrl: mediaUrl,
        Price: price,
        Difficulty: difficulty,
        Time: time,
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        likesCount: 0,
      });

      alert("Recipe submitted successfully!");
      resetState();
      router.push("/(tabs)/add-recipe");
    } catch (error) {
      const errorMessage =
        (error as FirebaseError).message || (error as Error).message;
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setPrice(1.5);
    setDifficulty(4.5);
    setTime(30);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.justifytop_container}>
        <Spacer size={60} />
        <Image source={{ uri: decodedImage }} style={styles.iconContainer} />
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Price: ${price.toFixed(2)}/Serving</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={0.1}
            value={price}
            onValueChange={(value) => setPrice(value)}
            minimumTrackTintColor="#0D5F13"
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.label}>
            Difficulty: {difficulty.toFixed(1)}/5
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5}
            step={0.1}
            value={difficulty}
            onValueChange={(value) => setDifficulty(value)}
            minimumTrackTintColor="#0D5F13"
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Time: {time} min</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={120}
            step={5}
            value={time}
            onValueChange={(value) => setTime(value)}
            minimumTrackTintColor="#0D5F13"
          />
          <Text style={styles.subLabel}>
            {Math.floor(time * 0.67)} active minutes + {Math.ceil(time * 0.33)}{" "}
            passive minutes
          </Text>
        </View>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text>{loading ? "Submitting..." : "Submit Recipe"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imagestyle: {
    width: 200,
    height: 200,
    alignSelf: "center",
    borderWidth: 4,
    borderRadius: 4,
    borderColor: "#0D5F13",
    marginVertical: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 20,
  },
  buttonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  justifytop_container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
    padding: 20,
    justifyContent: "flex-start",
  },
  iconContainer: {
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#BCD5AC",
    padding: 35,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  changeImageButton: {
    alignSelf: "center",
    backgroundColor: "#0D5F13",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  changeImageText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
  sliderContainer: {
    width: "90%",
    marginVertical: 15,
    alignSelf: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2f4f2f",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  subLabel: {
    textAlign: "center",
    marginTop: 5,
    fontSize: 14,
    color: "#556b2f",
  },
});
