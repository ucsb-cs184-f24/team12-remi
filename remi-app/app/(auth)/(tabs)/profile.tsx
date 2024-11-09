import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import Ustyles from "@/components/UniversalStyles";

const { width, height } = Dimensions.get('window');
const ARCH_HEIGHT = height * 0.73;
const MAX_BIO_LENGTH = 150;

export default function Component() {
  const user = auth.currentUser;
  const [profilePic, setProfilePic] = useState('https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const bioInputRef = useRef<TextInput>(null);

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
            setBio(userData.bio || '');
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
    if (isEditingBio && bioInputRef.current) {
      bioInputRef.current.focus();
    }
  }, [isEditingBio]);

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

  const saveBio = async () => {
    if (!user) return;
    if (bio.trim().length === 0) {
      alert('Bio cannot be empty');
      return;
    }
    try {
      const userDocRef = doc(db, 'RemiUsers', user.uid);
      await updateDoc(userDocRef, { bio });
      setIsEditingBio(false);
      alert('Bio updated successfully');
    } catch (error) {
      console.error('Error updating bio:', error);
      alert('Failed to update bio');
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
            <TouchableOpacity style={styles.profileImageContainer}>
              <Image
                source={{ uri: profilePic }}
                style={styles.profileImage}
              />
              <Text style={styles.replaceText}>Click to replace</Text>
            </TouchableOpacity>

            <Text style={[Ustyles.header_text, styles.username]}>
              {username}
            </Text>
            <Text style={styles.friendsCount}>9 friends</Text>

            <View style={styles.bioContainer}>
              {isEditingBio ? (
                <View style={styles.bioEditContainer}>
                  <View style={styles.bioInputWrapper}>
                    <TextInput
                      ref={bioInputRef}
                      style={styles.bioInput}
                      value={bio}
                      onChangeText={(text) => setBio(text.slice(0, MAX_BIO_LENGTH))}
                      placeholder="Enter your bio"
                      multiline
                      maxLength={MAX_BIO_LENGTH}
                    />
                  </View>
                  <Text style={styles.characterCount}>
                    {MAX_BIO_LENGTH - bio.length} characters remaining
                  </Text>
                  <TouchableOpacity style={styles.saveButton} onPress={saveBio}>
                    <Text style={styles.saveButtonText}>Save Bio</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.bioTextContainer}>
                  <Text style={styles.bioText}>
                    {bio || "Tap to add a bio..."}
                  </Text>
                  <TouchableOpacity onPress={() => setIsEditingBio(true)} style={styles.editIcon}>
                    <Ionicons name="pencil-outline" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
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
    backgroundColor: '#fff',
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
    width: 150,
    height: 150,
    borderRadius: 75,
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
    alignItems: 'center',
  },
  bioEditContainer: {
    width: '100%',
    alignItems: 'stretch',
  },
  bioInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  bioInput: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    minHeight: 40,
    paddingHorizontal: 0,
  },
  characterCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#BCD5AC',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  bioTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  editIcon: {
    marginLeft: 8,
    padding: 4,
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
    marginTop: 60,
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