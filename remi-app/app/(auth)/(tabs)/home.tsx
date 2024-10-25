import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Modal, FlatList,
  Button,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons
import { collection, addDoc, getDocs, doc, query, QuerySnapshot, DocumentData, where, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../../firebaseConfig'; // Ensure correct imports
import { signOut } from 'firebase/auth';
import Ustyles from '../../../components/UniversalStyles';
import Spacer from '../../../components/Spacer';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';


// Component definition
const Page: React.FC = () => {
  const user = auth.currentUser;
  const [posts, setPosts] = useState<DocumentData[]>([]);
  //record notification count using state
  // const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]); // Friend requests data
  const router = useRouter(); 

  // Fetch all posts from Firestore
  const fetchAllPosts = async () => {
    try {
      const postsRef = collection(db, 'Posts');
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(postsRef);
      const allPosts = querySnapshot.docs.map((doc) => doc.data());
      console.log('Fetched Posts:', allPosts); // Print posts to the terminal
      setPosts(allPosts); // Optional: Save posts in state for rendering
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to fetch posts: ${error.message}`);
      } else {
        Alert.alert('Error', 'An unknown error occurred.');
      }
    }
  };

  // Use `useEffect` to fetch posts when the component mounts
  useEffect(() => {
    fetchAllPosts();
  }, []);

      useEffect(() => {
    // Set up real-time listener for pending friend requests
    if (user) {
      const q = query(
        collection(db, 'Notifications'),
        where('to', '==', user.email),
        where('read_flag', '==', true) // Only show unread friend requests
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFriendRequests(requests);
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <View style={Ustyles.background}>
      <Spacer size={80} />
      <Text style={styles.text}>Welcome to home</Text>
      <Text style={Ustyles.logotext}>remi</Text>
      <Text style={styles.text}>{user?.email}</Text>
      <Spacer size={50} />
       
      <View style={styles.bellIconContainer}>
        <TouchableOpacity onPress={() => router.push('../../notifications')} style={{ padding: 10 }}>
          <Ionicons name="notifications-outline" size={30} color="#000" />
          {friendRequests.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{friendRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'space-evenly',
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#0D5F13',
  },
  text: {
    fontFamily: 'Roboto',
    fontSize: 20,
    color: '#0D5F13',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  requestItem: {
    marginBottom: 20,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  notificationBadge: {
    position: 'absolute',
    right: 4,
    top: 2,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bellIconContainer: {
    position: 'absolute', // Absolute positioning
    top: 40,              // Adjust based on where you want it from the top
    right: 20,            // Adjust to align it to the right side of the screen
  },
});

export default Page;



