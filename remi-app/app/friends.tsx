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
  ImageBackground,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import Spacer from "../components/Spacer";

interface FriendsProps {
  hideHeader?: boolean;
}

export const Friends: React.FC<FriendsProps> = ({ hideHeader = false }) => {
  const router = useRouter();
  const { friendsEmails } = useLocalSearchParams();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserEmail = auth.currentUser?.email;

    if (!currentUserEmail) {
      console.error("Current user email not available");
      setFriends([]);
      setLoading(false);
      return;
    }

    console.log("Setting up real-time listener for friends list");

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

      const friendsQuery = query(
        collection(db, "RemiUsers"),
        where("email", "in", friendsList)
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
      unsubscribe();
    };
  }, []);

  const removeFriend = async (friendEmail: string) => {
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFF9E6", "#FFF9E6"]}
        style={styles.backgroundGradient}
      >
        <ImageBackground
          source={require("../assets/images/background-lineart.png")}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          {!hideHeader && (
            <>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Spacer size={26} />
                <Ionicons name="arrow-back" size={30} color="#0D5F13" />
              </TouchableOpacity>
              <Spacer size={60} />
              <Text style={styles.headerText}>Friends</Text>
            </>
          )}
          {friends.length === 0 ? (
            <Text style={styles.noFriendsText}>No friends found</Text>
          ) : (
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
                          : require("../assets/placeholders/Group_3.png")
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
              contentContainerStyle={styles.friendsList}
            />
          )}
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

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
    opacity: 0.25,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 25,
    zIndex: 1,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0D5F13",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Nunito-Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noFriendsText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Nunito-Regular",
    textAlign: "center",
    marginTop: 20,
  },
  friendsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    borderColor: "#0D5F13",
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

