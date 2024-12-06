import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; // Correct imports for routing
import {
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  updateDoc,
  arrayRemove,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig"; // Adjust the path based on your project structure

export const Friends = () => {
  const router = useRouter();
  const { friendsEmails } = useLocalSearchParams(); // Get params passed from profile.tsx
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserEmailTwo = auth.currentUser?.email;

  useEffect(() => {
    const currentUserEmail = auth.currentUser?.email;

    if (!currentUserEmail) {
      console.error("Current user email not available");
      setFriends([]);
      setLoading(false);
      return;
    }

    console.log("Setting up real-time listener for friends list");

    // Listen for changes to the current user's `friends_list`
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
      console.log("Real-time updated friends list:", friendsList);

      if (friendsList.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Query the `RemiUsers` collection to fetch friend details
      const friendsQuery = query(
        collection(db, "RemiUsers"),
        where("email", "in", friendsList) // Query users based on the updated `friends_list`
      );

      getDocs(friendsQuery)
        .then((friendsSnapshot) => {
          const friendsData = friendsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Real-time fetched friends data:", friendsData);
          setFriends(friendsData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching friends data:", error);
          setLoading(false);
        });
    });

    return () => {
      console.log("Cleaning up real-time listener");
      unsubscribe(); // Cleanup the listener on unmount
    };
  }, []);

  const removeFriend = async (friendEmail: string) => {
    // Implement remove friend logic here
    Alert.alert(
      "Confirm Remove",
      "Are you sure you want to remove this friend?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            console.log("friend removed");
            deleteFriend(friendEmail);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteFriend = async (friendEmail: string) => {
    const currentUserEmail = auth.currentUser?.email;

    if (!currentUserEmail) {
      console.error("Current user email not available");
      return;
    }

    try {
      console.log(
        `Removing friend relationship between ${currentUserEmail} and ${friendEmail}`
      );

      // Remove friend from current user's `friends_list`
      const currentUserQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", currentUserEmail)
      );

      const currentUserSnapshot = await getDocs(currentUserQuery);
      if (!currentUserSnapshot.empty) {
        const currentUserDoc = currentUserSnapshot.docs[0].ref;
        console.log("Current user document reference:", currentUserDoc.path);

        await updateDoc(currentUserDoc, {
          friends_list: arrayRemove(friendEmail),
        });
        console.log(
          `Successfully removed ${friendEmail} from ${currentUserEmail}'s friends_list`
        );
      }

      // Remove current user from friend's `friends_list`
      const friendQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", friendEmail)
      );

      const friendSnapshot = await getDocs(friendQuery);
      if (!friendSnapshot.empty) {
        const friendDoc = friendSnapshot.docs[0].ref;
        console.log("Friend document reference:", friendDoc.path);

        await updateDoc(friendDoc, {
          friends_list: arrayRemove(currentUserEmail),
        });
        console.log(
          `Successfully removed ${currentUserEmail} from ${friendEmail}'s friends_list`
        );
      }

      alert("Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Failed to remove friend");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D5F13" />
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View style={styles.noFriendsContainer}>
        <Text style={styles.noFriendsText}>No friends found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Friends List */}
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(auth)/UserProfileInfo",
                  params: { username: item.username },
                })
              }
            >
              <Image
                source={
                  item.profilePic
                    ? { uri: item.profilePic }
                    : require("../assets/placeholders/profile-pic.png") // Adjust the path as per your project structure
                }
                style={styles.profilePic}
              />
            </TouchableOpacity>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>
                {item.username || "No Name"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFriend(item.email)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
    padding: 20,
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
    fontSize: 16,
    color: "#666",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    paddingBottom: 8,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: "#0D5F13", // Dark green color
    borderRadius: 25,
    marginRight: 16,
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
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: "Nunito-Bold",
    textAlign: "center",
    color: "#871717",
  },
});

export default Friends;
