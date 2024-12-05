import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { LinearGradient } from "expo-linear-gradient";

const recipeTagItems = [
  {
    name: "Meal Type",
    id: 0,
    children: [
      { name: "Breakfast", id: 1 },
      { name: "Lunch", id: 2 },
      { name: "Dinner", id: 3 },
      { name: "Snacks", id: 4 },
      { name: "Dessert", id: 5 },
      { name: "Beverages", id: 6 },
    ],
  },
  {
    name: "Diet",
    id: 100,
    children: [
      { name: "Vegetarian", id: 101 },
      { name: "Pescatarian", id: 102 },
      { name: "Halal", id: 103 },
      { name: "Vegan", id: 104 },
      { name: "Jain", id: 105 },
      { name: "Gluten-Free", id: 106 },
      { name: "Dairy-Free", id: 107 },
      { name: "Keto", id: 108 },
      { name: "Paleo", id: 109 },
      { name: "Low Carb", id: 110 },
    ],
  },
  {
    name: "Cuisine",
    id: 200,
    children: [
      { name: "Italian", id: 201 },
      { name: "French", id: 202 },
      { name: "Mexican", id: 203 },
      { name: "Japanese", id: 204 },
      { name: "Chinese", id: 205 },
      { name: "Korean", id: 206 },
      { name: "Thai", id: 207 },
      { name: "Malaysian", id: 208 },
      { name: "Vietnamese", id: 209 },
      { name: "Indian", id: 210 },
      { name: "Pakistani", id: 211 },
      { name: "Mediterranean", id: 212 },
      { name: "American", id: 213 },
      { name: "Southern", id: 214 },
      { name: "Middle Eastern", id: 215 },
      { name: "African", id: 216 },
      { name: "Caribbean", id: 217 },
      { name: "Creole", id: 218 },
      { name: "Cajun", id: 219 },
    ],
  },
  {
    name: "Course",
    id: 300,
    children: [
      { name: "Appetizers", id: 301 },
      { name: "Main Course", id: 302 },
      { name: "Side Dish", id: 303 },
    ],
  },
];

export default function RecipeCreationScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!title.trim()) {
      alert("Please enter a title for your recipe.");
      return;
    }
    if (!image) {
      alert("Please select an image for your recipe.");
      return;
    }
    const encodedImage = encodeURIComponent(image);
    router.push({
      pathname: "/Next",
      params: {
        image: encodedImage,
        title,
        caption,
        selectedTags: selectedTags.join(","),
      },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={["#FFF9E6", "#BCD5AC"]} style={styles.container}>
        <ImageBackground
          source={require("../../../assets/images/background-lineart.png")}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.centerContainer}
          >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Add Recipe</Text>
                <Text style={styles.subHeaderText}>
                  What did you make today?
                </Text>
              </View>

              <TextInput
                style={styles.titleInput}
                placeholder="Dish name"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#BCD5AC"
              />

              <TouchableOpacity
                onPress={pickImage}
                style={styles.imagePickerButton}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.iconContainer}>
                    <Ionicons name="camera-outline" size={80} color="#0D5F13" />
                    <Text style={styles.imagePickerText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                multiline
                style={styles.captionInput}
                placeholder="Ingredients, recipe, or anything you want your friends to know?"
                value={caption}
                onChangeText={setCaption}
                placeholderTextColor="#BCD5AC"
              />

              <SectionedMultiSelect
                items={recipeTagItems}
                IconRenderer={MaterialIcons as any}
                uniqueKey="id"
                subKey="children"
                selectText="Select Tags"
                showDropDowns={true}
                readOnlyHeadings={true}
                onSelectedItemsChange={(items) => setSelectedTags(items)}
                selectedItems={selectedTags}
                searchPlaceholderText="Search Tags"
                confirmText="Apply Tags"
                colors={{
                  primary: "#0D5F13",
                  searchPlaceholderTextColor: "#BCD5AC",
                }}
                styles={multiSelectStyles}
                alwaysShowSelectText={true}
                selectToggleIconComponent={
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color="#0D5F13"
                  />
                }
                dropDownToggleIconDownComponent={
                  <View
                    style={{
                      backgroundColor: "#FFF9E6",
                      padding: 5,
                      borderRadius: 5,
                    }}
                  >
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={24}
                      color="#0D5F13"
                      style={styles.iconBack}
                    />
                  </View>
                }
                searchIconComponent={
                  <MaterialIcons
                    name="search"
                    size={24}
                    color="#0D5F13"
                    style={{ paddingHorizontal: 10 }}
                  />
                }
                dropDownToggleIconUpComponent={
                  <View
                    style={{
                      backgroundColor: "#FFF9E6",
                      padding: 5,
                      borderRadius: 5,
                    }}
                  >
                    <MaterialIcons
                      name="keyboard-arrow-up"
                      size={24}
                      color="#0D5F13"
                      style={styles.iconBack}
                    />
                  </View>
                }
                noResultsComponent={
                  <Text style={styles.noResultsText}> Sorry, no results </Text>
                }
              />

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  iconBack: {
    backgroundColor: "#FFF9E6",
    padding: 5,
    margin: -15,
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 80,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0D5F13",
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
    marginBottom: 15,
  },
  subHeaderText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D5F13",
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
  },
  titleInput: {
    height: 50,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 10,
    backgroundColor: "#FFF9E6",
    borderColor: "#0D5F13",
    fontSize: 18,
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 20,
  },
  imagePickerButton: {
    alignSelf: "center",
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#0D5F13",
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    alignItems: "center",
  },
  imagePickerText: {
    marginTop: 10,
    color: "#0D5F13",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Nunito_600SemiBold",
  },
  captionInput: {
    height: 150,
    borderWidth: 2,
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#FFF9E6",
    borderColor: "#0D5F13",
    textAlignVertical: "top",
    fontSize: 17,
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: "#0D5F13",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: "center",
    marginTop: 20,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Nunito_600SemiBold",
  },
  noResultsText: {
    color: "#0D5F13",
    fontSize: 18,
    fontFamily: "Nunito_400Regular",
    alignSelf: "center",
    paddingTop: 20,
  },
});

const multiSelectStyles = {
  container: {
    backgroundColor: "#FFF9E6",
    marginTop: 100,
    marginBottom: 100,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#0D5F13",
  },
  listContainer: {
    backgroundColor: "#FFF9E6",
  },
  itemContainer: {
    backgroundColor: "#FFF9E6",
  },
  subItemContainer: {
    backgroundColor: "#FFF9E6",
  },
  scrollView: {
    backgroundColor: "#FFF9E6",
  },
  subSeparator: {
    backgroundColor: "#FFF9E6",
  },
  separator: {
    backgroundColor: "#FFF9E6",
  },
  selectToggle: {
    backgroundColor: "#FFF9E6",
    borderColor: "#0D5F13",
    borderWidth: 2,
    padding: 12,
    borderRadius: 15,
  },
  selectToggleText: {
    fontSize: 16,
    color: "#0D5F13",
    fontFamily: "Nunito_600SemiBold",
  },
  chipContainer: {
    backgroundColor: "#FFF9E6",
  },
  chipText: {
    color: "#0D5F13",
    fontFamily: "Nunito_600SemiBold",
  },
  itemText: {
    color: "#0D5F13",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
  },
  confirmText: {
    color: "#FFF",
    fontFamily: "Nunito_700Bold",
  },
  subItemText: {
    color: "#0D5F13",
    fontFamily: "Nunito_400Regular",
    paddingLeft: 20,
  },
  selectedSubItem: {
    backgroundColor: "#BCD5AC",
    borderRadius: 4,
    paddingVertical: 5,
  },
  item: {
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 10,
  },
  subItem: {
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchTextInput: {
    color: "#0D5F13",
    fontFamily: "Nunito_400Regular",
  },
  searchBar: {
    backgroundColor: "#FFF9E6",
  },
};
