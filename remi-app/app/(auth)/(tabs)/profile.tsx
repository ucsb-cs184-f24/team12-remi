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
  Switch
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');
const ARCH_HEIGHT = height * 0.80; // Arch height covers 92% of the screen

export default function Component() {
  const user = auth.currentUser;
  const [profilePic, setProfilePic] = useState('https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png');
  const [username, setUsername] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const toggleSwitch = async () => {
    if (!user) return;
    const newVisibility = !isPublic ? 'public' : 'private';
    setIsPublic(!isPublic);

    try {
      const userDocRef = doc(db, 'RemiUsers', user.uid);
      await updateDoc(userDocRef, { visibility: newVisibility });
      alert(`Profile visibility updated to ${newVisibility}`);
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert('Failed to update profile visibility');
    }
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          {/* Flipped tan arch overlay */}
          <View style={styles.archOverlay} />

          {/* Profile section */}
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.profileImageContainer}>
              <Image
                source={{ uri: profilePic }}
                style={styles.profileImage}
              />
              <Text style={styles.replaceText}>Click to replace</Text>
            </TouchableOpacity>

            <Text style={styles.username}>{username}</Text>
            <Text style={styles.friendsCount}>9 friends</Text>

            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>
                Bio goes here...
              </Text>
            </View>

            {/* Visibility toggle */}
            <View style={styles.visibilityContainer}>
              <Text style={styles.visibilityText}>Profile Visibility: {isPublic ? 'Public' : 'Private'}</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81B784" }}
                thumbColor={isPublic ? "#0D5F13" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isPublic}
              />
            </View>
          </View>

          {/* Recent Activity section */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <ScrollView style={styles.postsContainer}>
              {/* Placeholder for posts */}
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.postItem}>
                  <Text style={styles.postText}>Post {item}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={() => signOut(auth)}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </ScrollView>
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
  archOverlay: {
    position: 'absolute',
    bottom: 0, // Changed from top to bottom
    left: 0,
    right: 0,
    height: ARCH_HEIGHT,
    backgroundColor: '#FFF9E6',
    borderTopLeftRadius: ARCH_HEIGHT, // Changed from borderBottomLeftRadius
    borderTopRightRadius: ARCH_HEIGHT, // Changed from borderBottomRightRadius
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    minHeight: '100%',
    paddingTop: 40, // Increased from 20
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  profileImageContainer: {
    width: 150, // Increased from 120
    height: 150, // Increased from 120
    borderRadius: 75, // Increased from 60
    backgroundColor: '#fff',
    marginTop: 40, // Added to move it lower
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
    width: 150, // Increased from 120
    height: 150, // Increased from 120
    borderRadius: 75, // Increased from 60
  },
  replaceText: {
    position: 'absolute',
    bottom: -30, // Adjusted from -24
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
  visibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  visibilityText: {
    fontSize: 16,
    color: '#333',
  },
  activitySection: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  postsContainer: {
    maxHeight: 300,
  },
  postItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  postText: {
    fontSize: 16,
    color: '#444',
  },
  signOutButton: {
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    marginHorizontal: 20,
  },
  signOutText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
  },
});