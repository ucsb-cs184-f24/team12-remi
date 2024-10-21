// ImagePickerPage.tsx
import React, { useState } from 'react';
import { Button, Image, View, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ImagePickerPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Function to request permission and pick an image
  const pickImage = async () => {
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need permission to access your media library.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an Image" onPress={pickImage} />
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.image} />
      )}
      {!selectedImage && <Text>No image selected.</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default ImagePickerPage;
