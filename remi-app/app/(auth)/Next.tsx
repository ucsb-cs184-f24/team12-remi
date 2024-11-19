import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FirebaseError } from "firebase/app";
import { auth, db, storage } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const recipeTagItems = [
  { name: "Meal Type", id: 0, children: [
    { name: "Breakfast", id: 1 },
    { name: "Lunch", id: 2 },
    { name: "Dinner", id: 3 },
    { name: "Snacks", id: 23 },
    { name: "Dessert", id: 22 },
    { name: "Beverages", id: 29 },
  ]},
  { name: "Diet", id: 100, children: [
    { name: "Vegetarian", id: 4 },
    { name: "Vegan", id: 5 },
    { name: "Gluten-Free", id: 6 },
    { name: "Dairy-Free", id: 7 },
    { name: "Keto", id: 8 },
    { name: "Paleo", id: 9 },
    { name: "Low Carb", id: 10 },
  ]},
  { name: "Cuisine", id: 200, children: [
    { name: "Italian", id: 13 },
    { name: "Mexican", id: 14 },
    { name: "Asian", id: 12 },
    { name: "Indian", id: 15 },
    { name: "Mediterranean", id: 11 },
    { name: "American", id: 18 },
    { name: "Middle Eastern", id: 16 },
    { name: "French", id: 17 },
    { name: "African", id: 19 },
    { name: "Caribbean", id: 20 },
  ]},
  { name: "Course", id: 300, children: [
    { name: "Appetizers", id: 24 },
    { name: "Main Course", id: 301 },
    { name: "Side Dish", id: 302 },
    { name: "Salads", id: 28 },
    { name: "Soups & Stews", id: 27 },
    { name: "BBQ", id: 25 },
    { name: "Seafood", id: 26 },
  ]},
];

const getTagNamesFromIds = (tagIds: string) => {
  const allTags = recipeTagItems.flatMap((category) => category.children);
  return tagIds.split(',').map(id => allTags.find((tag) => tag.id === parseInt(id))?.name).filter(Boolean);
};

const uploadImageToStorage = async (uri: string): Promise<string> => {
  try {
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

interface Params {
  image: string;
  title: string;
  caption: string;
  selectedTags: string;
}

export default function RecipeSubmissionPage() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const { image, title, caption, selectedTags } = params;
  const [price, setPrice] = useState<number>(1.5);
  const [difficulty, setDifficulty] = useState<number>(2.5);
  const [time, setTime] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [decodedImage, setDecodedImage] = useState("");

  const tagNames = getTagNamesFromIds(selectedTags);

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
    if (!decodedImage) {
      alert("Please select an image.");
      return;
    }
    if (!caption.trim()) {
      alert("Caption is required.");
      return;
    }
    if (selectedTags.length === 0) {
      alert("Please add at least one tag.");
      return;
    }
    setLoading(true);
    try {
      const mediaUrl = await uploadImageToStorage(decodedImage);
      const docRef = doc(db, "Posts", `${Date.now()}`);
      await setDoc(docRef, {
        title,
        caption,
        hashtags: selectedTags,
        mediaUrl,
        Price: price,
        Difficulty: difficulty,
        Time: time,
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        likesCount: 0,
      });

      alert("Recipe submitted successfully!");
      resetState();
      router.push("../(tabs)/add-recipe");
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
    setDifficulty(2.5);
    setTime(30);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FFF9E6", "#BCD5AC"]} style={styles.gradientBackground}>
        <Image source={require("../../assets/images/background-lineart.png")} style={styles.backgroundImage} />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Image source={{ uri: decodedImage }} style={styles.image} />
            
            <View style={styles.card}>
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
                  maximumTrackTintColor="#BCD5AC"
                  thumbTintColor="#0D5F13"
                />
              </View>

              <View style={styles.sliderContainer}>
                <Text style={styles.label}>Difficulty: {difficulty.toFixed(1)}/5</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={5}
                  step={0.1}
                  value={difficulty}
                  onValueChange={(value) => setDifficulty(value)}
                  minimumTrackTintColor="#0D5F13"
                  maximumTrackTintColor="#BCD5AC"
                  thumbTintColor="#0D5F13"
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
                  maximumTrackTintColor="#BCD5AC"
                  thumbTintColor="#0D5F13"
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.description}>{caption}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Tags:</Text>
              <View style={styles.tagsList}>
                {tagNames.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" style={styles.submitIcon} />
                  <Text style={styles.submitButtonText}>Submit Recipe</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
    top: '-5%',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0D5F13",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: 'Nunito_600SemiBold',
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
    alignSelf: "center",
    borderRadius: 75,
    marginBottom: 30,
    borderWidth: 3,
    borderColor: "#0D5F13",
  },
  card: {
    backgroundColor: "rgba(255, 249, 230, 0.8)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#0D5F13",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sliderContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0D5F13",
    fontFamily: 'Nunito_600SemiBold',
  },
  slider: {
    width: "100%",
    height: 40,
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    fontFamily: 'Nunito_600SemiBold',
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#BCD5AC",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: "#0D5F13",
  },
  tagText: {
    color: "#0D5F13",
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  submitButton: {
    backgroundColor: "#0D5F13",
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,

  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: 'Nunito_600SemiBold',
  },
  submitIcon: {
    marginRight: 10,
  },
});