import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { FirebaseError } from "firebase/app";
import { auth, db, storage } from "../../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from "react-native";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { Ionicons, MaterialIcons as Icon } from "@expo/vector-icons";
import Ustyles from "@/components/UniversalStyles";
import Spacer from "@/components/Spacer";

const items = [
  { name: "Breakfast", id: 1 },
  { name: "Lunch", id: 2 },
  { name: "Dinner", id: 3 },
  { name: "Vegetarian", id: 4 },
  { name: "Vegan", id: 5 },
  { name: "Gluten-Free", id: 6 },
  { name: "Dairy-Free", id: 7 },
  { name: "Keto", id: 8 },
  { name: "Paleo", id: 9 },
  { name: "Low Carb", id: 10 },
  { name: "Mediterranean", id: 11 },
  { name: "Asian", id: 12 },
  { name: "Italian", id: 13 },
  { name: "Mexican", id: 14 },
  { name: "Indian", id: 15 },
  { name: "Middle Eastern", id: 16 },
  { name: "French", id: 17 },
  { name: "American", id: 18 },
  { name: "African", id: 19 },
  { name: "Caribbean", id: 20 },
  { name: "Comfort Food", id: 21 },
  { name: "Dessert", id: 22 },
  { name: "Snacks", id: 23 },
  { name: "Appetizers", id: 24 },
  { name: "BBQ", id: 25 },
  { name: "Seafood", id: 26 },
  { name: "Soups & Stews", id: 27 },
  { name: "Salads", id: 28 },
  { name: "Beverages", id: 29 },
  { name: "Japanese", id: 30 },
];
import { useRouter } from 'expo-router';

const App = () => {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const router = useRouter(); 

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
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      alert("An error occurred while selecting an image. Please try again.");
    }
  };

  const handleTagsChange = (selectedItems: number[]) => {
    setSelectedTags(selectedItems);

    // Convert selected tag IDs to tag names
    const tagsArray = selectedItems
      .map((tagId) => items.find((item) => item.id === tagId)?.name)
      .filter(Boolean); // Filter out any null or undefined values

    // Set hashtags to a comma-separated string for display
    // setHashtags(tagsArray.join(", "));
  };



  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={Ustyles.background}>
        <Spacer size={60} />
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.justifytop_container}>
              <Text style={Ustyles.header_text}>Add Recipe</Text>
              <Spacer size={15} />
              <Text style={Ustyles.header_2}>What did you make today?</Text>
              <TextInput
                multiline={true}
                style={styles.title_input}
                placeholder={`dish name`}
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#BCD5AC"
              />
              <Spacer size={10} />
              {image ? (
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.changeImageButton}
                >
                  <Text style={styles.changeImageText}>Change Image</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.iconContainer}
                >
                  <Ionicons name="camera-outline" size={100} color="#0D5F13" />
                </TouchableOpacity>
              )}
              {image && (
                <Image source={{ uri: image }} style={styles.imagestyle} />
              )}
              <Spacer size={20} />
              <TextInput
                multiline={true}
                style={styles.notes_input}
                placeholder={`ingredients?\nrecipe?\nanything you want your friends to know?`}
                value={caption}
                onChangeText={setCaption}
                placeholderTextColor="#BCD5AC"
              />
              <Spacer size={20} />
              <SectionedMultiSelect
                items={items}
                IconRenderer={Icon as any}
                uniqueKey="id"
                onSelectedItemsChange={handleTagsChange}
                selectedItems={selectedTags}
                selectText="Select Tags"
                searchPlaceholderText="Search Tags"
                confirmText="Apply Tags"
                colors={{ primary: "#0D5F13" }}
                styles={{
                  selectToggle: {
                    backgroundColor: "#BCD5AC", // Dark green background
                    borderColor: "#0D5F13",
                    borderWidth: 2,
                    padding: 12,
                    borderRadius: 8,
                  },
                  selectToggleText: {
                    fontSize: 16,
                    color: "#0D5F13", // White text for visibility on dark green
                    fontFamily: "Nunito_600SemiBold",
                  },
                  chipContainer: {
                    backgroundColor: "#BCD5AC",
                    borderRadius: 15,
                  },
                  backdrop: {
                    backgroundColor: "#BCD5AC",
                  },
                  chipText: {
                    fontSize: 14,
                    color: "#0D5F13",
                    fontFamily: "Nunito_600SemiBold",
                  },
                  itemText: {
                    fontSize: 16,
                    color: "#777",
                    fontFamily: "Nunito_600SemiBold",
                  },
                  confirmText: {
                    color: "#FFFFFF", // Light green color for the "Apply" button text
                    fontSize: 16,
                    fontWeight: "bold",
                    fontFamily: "Nunito_600SemiBold",
                  },
                  selectedItemText: {
                    color: "#0D5F13", // Highlight selected items
                    fontFamily: "Nunito_600SemiBold",
                  },
                  selectedItem: {
                    backgroundColor: "#FFF9E6",
                  },
                  scrollView: {
                    backgroundColor: "#f7f7f9",
                  },
                  subItemText: {
                    color: "#777",
                    fontFamily: "Nunito_600SemiBold",
                  },
                  searchTextInput: {
                    borderBottomWidth: 1,
                    borderBottomColor: "#0D5F13",
                    fontFamily: "Nunito_600SemiBold",
                  },
                }}
              />
              <Spacer size={10} />
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={() =>
                  router.push({
                    pathname: "/Next",
                    params: {
                      image,
                      title,
                      caption,
                      selectedTags,
                    },
                  })
                }
              >
                <View style={styles.button}>
                  <Text style={Ustyles.header_2}>Next</Text>
                </View>
              </TouchableOpacity>


            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

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
  notes_input: {
    marginVertical: 4,
    height: 150,
    borderWidth: 2,
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#fff",
    borderColor: "#0D5F13",
    textAlignVertical: "top",
    //textAlign: 'justify',
    fontSize: 18,
    fontFamily: "Nunito_600SemiBold",
    width: "100%",
  },
  title_input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 2,
    borderRadius: 4,
    paddingVertical: 8, // Adjust padding to balance vertical centering
    paddingHorizontal: 10, // Horizontal padding to keep text away from edges
    backgroundColor: "#fff",
    borderColor: "#0D5F13",
    textAlignVertical: "center", // Centers text vertically
    fontSize: 18,
    fontFamily: "Nunito_600SemiBold",
    width: "100%",
  },
  tags_input: {
    marginVertical: 4,
    height: 80,
    borderWidth: 2,
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#fff",
    borderColor: "#0D5F13",
    textAlignVertical: "top",
    //textAlign: 'justify',
    fontSize: 18,
    fontFamily: "Nunito_600SemiBold",
    width: "100%",
  },
  button: {
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0D5F13",
    backgroundColor: "#FFF9E6",
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
  },
  changeImageText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
});

export default App;
