import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import {
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Avatar } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import Spacer from "../components/Spacer";

interface Friend {
  id: string;
  email: string;
  username: string;
  profilePic?: string;
}

export const Friends: React.FC = () => {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserEmail = auth.currentUser?.email;

    if (!currentUserEmail) {
      console.error("Current user email not available");
      setFriends([]);
      setLoading(false);
      return;
    }

    const currentUserQuery = query(
      collection(db, "RemiUsers"),
      where("email", "==", currentUserEmail)
    );

    const unsubscribe = onSnapshot(currentUserQuery, (snapshot) => {
      if (snapshot.empty) {
        console.log("No matching user found in Firestore");
        setFriends([]);
        setLoading(false);
        return;
      }

      const currentUserDoc = snapshot.docs[0];
      const userData = currentUserDoc.data();
      const friendsList = userData.friends_list || [];

      if (friendsList.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const friendsQuery = query(
        collection(db, "RemiUsers"),
        where("email", "in", friendsList)
      );

      getDocs(friendsQuery)
        .then((friendsSnapshot) => {
          const friendsData = friendsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Friend[];
          setFriends(friendsData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching friends data:", error);
          setLoading(false);
        });
    });

    return () => unsubscribe();
  }, []);

  const removeFriend = async (friendEmail: string) => {
    const currentUserEmail = auth.currentUser?.email;

    if (!currentUserEmail) {
      console.error("Current user email not available");
      return;
    }

    try {
      const currentUserQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", currentUserEmail)
      );

      const currentUserSnapshot = await getDocs(currentUserQuery);
      if (!currentUserSnapshot.empty) {
        const currentUserDoc = currentUserSnapshot.docs[0].ref;
        await updateDoc(currentUserDoc, {
          friends_list: arrayRemove(friendEmail),
        });
      }

      const friendQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", friendEmail)
      );

      const friendSnapshot = await getDocs(friendQuery);
      if (!friendSnapshot.empty) {
        const friendDoc = friendSnapshot.docs[0].ref;
        await updateDoc(friendDoc, {
          friends_list: arrayRemove(currentUserEmail),
        });
      }

      alert("Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Failed to remove friend");
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Avatar
        size={50}
        rounded
        source={
          item.profilePic
            ? { uri: item.profilePic }
            : require("../assets/placeholders/profile-pic.png")
        }
        containerStyle={styles.avatarContainer}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.username || "No Name"}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFriend(item.email)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9E6" />
      <ImageBackground
        source={require("../assets/images/background-lineart.png")}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Spacer size={26} />
              <Ionicons name="arrow-back" size={30} color="#0D5F13" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Friends</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D5F13" />
            </View>
          ) : friends.length === 0 ? (
            <View style={styles.noFriendsContainer}>
              <Text style={styles.noFriendsText}>No friends found</Text>
            </View>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              renderItem={renderFriendItem}
              contentContainerStyle={styles.friendsList}
            />
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF9E6",
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
    opacity: 0.1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: "Nunito_700Bold",
    color: "#0D5F13",
    textAlign: "center",
    marginRight: 0,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noFriendsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noFriendsText: {
    fontSize: 18,
    color: "#666",
    fontFamily: "Nunito-Regular",
  },
  friendsList: {
    paddingHorizontal: 20,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#0D5F13",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    fontFamily: "Nunito-Bold",
  },
  removeButton: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#871717",
    backgroundColor: "#FFEBEE",
  },
  removeButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
    fontSize: 14,
  },
});

export default Friends;

