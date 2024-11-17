import React, { useState } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { LinearGradient } from 'expo-linear-gradient';

const recipeTagItems = [
  { name: 'Meal Type', id: 0, children: [
    { name: 'Breakfast', id: 1 },
    { name: 'Lunch', id: 2 },
    { name: 'Dinner', id: 3 },
    { name: 'Snacks', id: 23 },
    { name: 'Dessert', id: 22 },
    { name: 'Beverages', id: 29 },
  ]},
  { name: 'Diet', id: 100, children: [
    { name: 'Vegetarian', id: 4 },
    { name: 'Vegan', id: 5 },
    { name: 'Gluten-Free', id: 6 },
    { name: 'Dairy-Free', id: 7 },
    { name: 'Keto', id: 8 },
    { name: 'Paleo', id: 9 },
    { name: 'Low Carb', id: 10 },
  ]},
  { name: 'Cuisine', id: 200, children: [
    { name: 'Italian', id: 13 },
    { name: 'Mexican', id: 14 },
    { name: 'Asian', id: 12 },
    { name: 'Indian', id: 15 },
    { name: 'Mediterranean', id: 11 },
    { name: 'American', id: 18 },
    { name: 'Middle Eastern', id: 16 },
    { name: 'French', id: 17 },
    { name: 'African', id: 19 },
    { name: 'Caribbean', id: 20 },
  ]},
  { name: 'Course', id: 300, children: [
    { name: 'Appetizers', id: 24 },
    { name: 'Main Course', id: 301 },
    { name: 'Side Dish', id: 302 },
    { name: 'Salads', id: 28 },
    { name: 'Soups & Stews', id: 27 },
    { name: 'BBQ', id: 25 },
    { name: 'Seafood', id: 26 },
  ]},
];

export default function RecipeCreationScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
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
      alert('Please enter a title for your recipe.');
      return;
    }
    if (!image) {
      alert('Please select an image for your recipe.');
      return;
    }
    const encodedImage = encodeURIComponent(image);
    router.push({
      pathname: '/Next',
      params: { image: encodedImage, title, caption, selectedTags: selectedTags.join(',') },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={['#FFF9E6', '#BCD5AC']} style={styles.container}>
        <ImageBackground
          source={require("../../../assets/images/background-lineart.png")}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Add Recipe</Text>
                <Text style={styles.subHeaderText}>What did you make today?</Text>
              </View>
              
              <TextInput
                style={styles.titleInput}
                placeholder="Dish name"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#BCD5AC"
              />
              
              <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
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
                colors={{ primary: '#0D5F13' }}
                styles={multiSelectStyles}
                showCancelButton
                alwaysShowSelectText={true}
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
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.5,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 80, // Increased padding to move everything down more
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30, // Increased margin to add more space between header texts
  },
  headerText: {
    fontSize: 32, // Increased font size
    fontWeight: '800',
    color: '#0D5F13',
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    marginBottom: 15, // Added margin to increase space between texts
  },
  subHeaderText: {
    fontSize: 20, // Increased font size
    fontWeight: '700',
    color: '#0D5F13',
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },
  titleInput: {
    height: 50,
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FFF9E6',
    borderColor: '#0D5F13',
    fontSize: 18,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 20,
  },
  imagePickerButton: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9E6', // Changed background color
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#FFF9E6',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: "#000", // Added shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 10,
    color: '#0D5F13',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  captionInput: {
    height: 150,
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#FFF9E6',
    borderColor: '#0D5F13',
    textAlignVertical: 'top',
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#0D5F13',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Nunito_600SemiBold',
  },
});

const multiSelectStyles = {
  selectToggle: {
    backgroundColor: '#BCD5AC',
    borderColor: '#0D5F13',
    borderWidth: 2,
    padding: 12,
    borderRadius: 4,
  },
  selectToggleText: {
    fontSize: 16,
    color: '#0D5F13',
    fontFamily: 'Nunito_600SemiBold',
  },
  chipContainer: {
    backgroundColor: '#BCD5AC',
  },
  chipText: {
    color: '#0D5F13',
  },
  itemText: {
    color: '#333',
  },
  selectedItemText: {
    color: '#0D5F13',
  },
};