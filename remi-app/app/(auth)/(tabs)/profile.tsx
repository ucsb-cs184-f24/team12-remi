import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Switch,
  TextInput,
  Animated,
  ImageBackground,
  Button,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import { auth, db, storage } from "../../../firebaseConfig";
import { doc, updateDoc, getDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import RecipePost from "./home";

const { width, height } = Dimensions.get("window");
const MAX_BIO_LENGTH = 150;

const uploadImageToStorage = async (uri: string): Promise<string> => {
  try {
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

const useImagePicker = () => {
  const [image, setImage] = useState<string | null>(null);

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
        aspect: [1, 1],
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
  const [profilePic, setProfilePic] = useState(
    "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
  );
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isBookmarkVisible, setBookmarkVisible] = useState(false);
  const { image, pickImage } = useImagePicker();
  const bioInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [friendCount, setFriendCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "RemiUsers", user.uid);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setIsPublic(userData.visibility === "public");
            setUsername(userData.username || "");
            setProfilePic(userData.profilePic || profilePic);
            setBio(userData.bio || "");
            
            setFriendCount(userData.friends_list?.length || 0);

            const postsQuery = query(collection(db, "Posts"), where("userId", "==", user.uid));
            const postsSnapshot = await getDocs(postsQuery);
            setPostCount(postsSnapshot.size);

            // Initial likes count calculation
            let initialLikesCount = 0;
            postsSnapshot.forEach((doc) => {
              initialLikesCount += doc.data().likesCount || 0;
            });
            setLikesCount(initialLikesCount);

            // Set up real-time listener for posts
            const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
              let newLikesCount = 0;
              snapshot.forEach((doc) => {
                newLikesCount += doc.data().likesCount || 0;
              });
              setLikesCount(newLikesCount);
            });

            // Clean up the listener when the component unmounts
            return () => unsubscribe();
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }
      }
    };

    fetchUserData();
  }, [user, fadeAnim]);

  useEffect(() => {
    if (image) {
      setProfilePic(image);
      updateProfilePicture(image);
    }
  }, [image]);

  const updateProfilePicture = async (imageUri: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const mediaUrl = await uploadImageToStorage(imageUri);

      const userDocRef = doc(db, "RemiUsers", user.uid);
      await updateDoc(userDocRef, { profilePic: mediaUrl });
      alert("Profile picture updated successfully!");
      setProfilePic(mediaUrl);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      alert("Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditingBio && bioInputRef.current) {
      bioInputRef.current.focus();
    }
  }, [isEditingBio]);

  const toggleVisibility = async (value: boolean) => {
    if (!user) return;
    const newVisibility = value ? "public" : "private";
    setIsPublic(value);

    try {
      const userDocRef = doc(db, "RemiUsers", user.uid);
      await updateDoc(userDocRef, { visibility: newVisibility });
      alert(`Profile visibility updated to ${newVisibility}`);
    } catch (error) {
      console.error("Error updating visibility:", error);
      alert("Failed to update profile visibility");
    }
  };

  const saveBio = async () => {
    if (!user) return;
    if (bio.trim().length === 0) {
      alert("Bio cannot be empty");
      return;
    }
    try {
      const userDocRef = doc(db, "RemiUsers", user.uid);
      await updateDoc(userDocRef, { bio });
      setIsEditingBio(false);
      alert("Bio updated successfully");
    } catch (error) {
      console.error("Error updating bio:", error);
      alert("Failed to update bio");
    }
  };

  const handleSignOut = async () => {
    setIsMenuVisible(false);
    router.push("../../poo");
    await signOut(auth);
  };

  // const handleBookmarksPress = () => {
  //   // Implement bookmarks functionality here
  //   setBookmarkVisible(true);
  //   console.log("user wants to see bookmarks!");
  // };
  const handleBookmarksPress = () => {
    setBookmarkVisible(false); // Close menu if applicable
    router.push("../../bookmarks"); // Adjust path as needed for your project structure
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={["#FFF9E6", "#BCD5AC"]}
        style={styles.backgroundGradient}
      >
        <ImageBackground
          source={require("../../../assets/images/background-lineart.png")}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.header}>
            <Text style={styles.username}>{username}</Text>
            <TouchableOpacity
              onPress={() => setIsMenuVisible(true)}
              style={styles.menuButton}
            >
              <Ionicons name="menu" size={24} color="#0D5F13" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
          >
            <View style={styles.profileSection}>
              <View style={styles.profileTopSection}>
                <TouchableOpacity
                  style={styles.profileImageContainer}
                  onPress={pickImage}
                >
                  <Image
                    source={{ uri: profilePic }}
                    style={styles.profileImage}
                  />
                  <View style={styles.editOverlay}>
                    <Ionicons name="camera" size={24} color="#FFF" />
                  </View>
                </TouchableOpacity>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{friendCount}</Text>
                    <Text style={styles.statLabel}>friends</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{postCount}</Text>
                    <Text style={styles.statLabel}>posts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{likesCount}</Text>
                    <Text style={styles.statLabel}>likes</Text>
                  </View>
                </View>
              </View>
              <View style={styles.bioContainer}>
                {isEditingBio ? (
                  <View style={styles.bioEditContainer}>
                    <TextInput
                      ref={bioInputRef}
                      style={styles.bioInput}
                      value={bio}
                      onChangeText={(text) =>
                        setBio(text.slice(0, MAX_BIO_LENGTH))
                      }
                      placeholder="Enter your bio"
                      multiline
                      maxLength={MAX_BIO_LENGTH}
                    />
                    <Text style={styles.characterCount}>
                      {MAX_BIO_LENGTH - bio.length} characters remaining
                    </Text>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={saveBio}
                    >
                      <Text style={styles.saveButtonText}>Save Bio</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsEditingBio(true)}
                    style={styles.bioTextContainer}
                  >
                    <Text style={styles.bioText}>
                      {bio || "Tap to add a bio..."}
                    </Text>
                    <Ionicons
                      name="pencil-outline"
                      size={16}
                      color="#666"
                      style={styles.editIcon}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.contentSection}>
              <Text style={styles.recentActivityTitle}>Recent Activity</Text>
              {/* Add your recent activity content here */}
              <Text style={styles.placeholderText}>
                No recent activity to show.
              </Text>
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
                    trackColor={{ false: "#767577", true: "#0D5F13" }}
                    thumbColor={isPublic ? "#BCD5AC" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleVisibility}
                    value={isPublic}
                  />
                </View>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleBookmarksPress}
                >
                  <Text style={styles.menuItemText}>Bookmarks</Text>
                  <Ionicons name="bookmark-outline" size={24} color="#0D5F13" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleSignOut}
                >
                  <Text style={styles.menuItemText}>Sign Out</Text>
                  <Ionicons name="log-out-outline" size={24} color="#0D5F13" />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ImageBackground>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  menuButton: {
    padding: 5,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D5F13",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  profileSection: {
    backgroundColor: "rgba(255, 249, 230, 0.8)",
    borderRadius: 20,
    margin: 20,
    padding: 20,
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
  profileTopSection: {
    flexDirection: "row",
    marginBottom: 20,
  },
  profileImageContainer: {
    marginRight: 20,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#0D5F13",
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(13, 95, 19, 0.7)",
    borderRadius: 20,
    padding: 8,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D5F13",
  },
  statLabel: {
    fontSize: 14,
    color: "#0D5F13",
  },
  bioContainer: {
    backgroundColor: "rgba(188, 213, 172, 0.8)",
    borderRadius: 15,
    padding: 15,
  },
  bioEditContainer: {
    width: "100%",
    alignItems: "stretch",
  },
  bioInput: {
    fontSize: 16,
    color: "#444",
    minHeight: 80,
    textAlignVertical: "top",
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
  },
  characterCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#FFCCCB",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  bioTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bioText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
    color: "#333",
  },
  editIcon: {
    marginLeft: 8,
  },
  contentSection: {
    flex: 1,
    backgroundColor: "rgba(255, 249, 230, 0.8)",
    borderRadius: 20,
    margin: 20,
    padding: 20,
    minHeight: 200,
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
  recentActivityTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D5F13",
    textAlign: "center",
    marginBottom: 15,
  },
  placeholderText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
  },
  modal: {
    margin: 0,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#FFF9E6",
    padding: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    width: "70%",
    height: "100%",
  },
  menuContent: {
    marginTop: 60,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuItemText: {
    fontSize: 18,
    color: "#333",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});
