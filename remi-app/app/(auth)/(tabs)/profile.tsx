import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  Platform,
  Switch,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, } from "firebase/storage";
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');
const ARCH_HEIGHT = height * 0.73;
const uploadImageToStorage = async (uri: string): Promise<string> => {
  try {
    console.log("What am i now: ", uri);
    if (!uri) throw new Error("Image URI is null or undefined.");
    const response = await fetch(uri);
    if (!response.ok) throw new Error("Failed to fetch the image.");
    const blob = await response.blob();
    const storageRef = ref(storage, `images/${Date.now()}.jpg`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return await new Promise((resolve, reject) => {
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
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    alert(`Image upload failed: ${(error as Error).message}`);
    throw error;
  }
};

// Define useImagePicker hook within this file
const useImagePicker = () => {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      alert("An error occurred while selecting an image. Please try again.");
    }
  };

  return { image, pickImage };
};

export default function Component() {
  const user = auth.currentUser;
  const [profilePic, setProfilePic] = useState('https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png');
  const [username, setUsername] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { image, pickImage } = useImagePicker();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'RemiUsers', user.uid);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setIsPublic(userData.visibility === 'public');
            setUsername(userData.username || '');
            setProfilePic(userData.profilePic || profilePic);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (image) {
      setProfilePic(image);
      updateProfilePicture(image); // Save image to Firebase
    }
  }, [image]);

  const updateProfilePicture = async (imageUri: string) => {
    if (!user) return;
  
    try {
      setLoading(true);
      const mediaUrl = await uploadImageToStorage(imageUri);
      
      const userDocRef = doc(db, 'RemiUsers', user.uid);
      await updateDoc(userDocRef, { profilePic: mediaUrl });
      alert("Profile picture updated successfully!");
      setProfilePic(mediaUrl); // Update state with new image URL
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };


  const toggleVisibility = async (value: boolean) => {
    if (!user) return;
    const newVisibility = value ? 'public' : 'private';
    setIsPublic(value);

    try {
      const userDocRef = doc(db, 'RemiUsers', user.uid);
      await updateDoc(userDocRef, { visibility: newVisibility });
      alert(`Profile visibility updated to ${newVisibility}`);
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert('Failed to update profile visibility');
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      // Handle successful sign out
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
    setIsMenuVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/background-lineart.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
            <Ionicons name="menu" size={30} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.archOverlay} />

          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
              <Image source={{ uri: profilePic }} style={styles.profileImage} />
              <Text style={styles.replaceText}>Click to replace</Text>
            </TouchableOpacity>

            <Text style={styles.username}>{username}</Text>
            <Text style={styles.friendsCount}>9 friends</Text>

            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>
                Bio goes here...
              </Text>
            </View>
          </View>
        </ScrollView>

        <Modal
          isVisible={isMenuVisible}
          onBackdropPress={() => setIsMenuVisible(false)}
          animationIn="slideInRight"
          animationOut="slideOutRight"
          style={styles.modal}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuContent}>
              <View style={styles.menuItem}>
                <Text style={styles.menuItemText}>Profile Visibility</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={isPublic ? "#f5dd4b" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleVisibility}
                  value={isPublic}
                />
              </View>
              <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
                <Text style={styles.menuItemText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  archOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ARCH_HEIGHT,
    backgroundColor: '#FFF9E6',
    borderTopLeftRadius: ARCH_HEIGHT,
    borderTopRightRadius: ARCH_HEIGHT,
    opacity: 0.95,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    minHeight: '100%',
    paddingTop: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: '#0D5F13', // Default border color
    backgroundColor: '#fff',
    justifyContent: 'center', // Center the image inside the container
    alignItems: 'center',    // Center the image inside the container
    marginTop: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  replaceText: {
    position: 'absolute',
    bottom: -30,
    width: '100%',
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#333',
  },
  friendsCount: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  bioContainer: {
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    width: '70%',
    height: '100%',
  },
  menuContent: {
    marginTop: 60, // Added to move menu items lower
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 18,
    color: '#333',
  },
});