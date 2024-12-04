import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "react-native-elements";
import { useRouter } from "expo-router";

interface User {
  id: string;
  username: string;
  email: string;
  profilePic?: string;
  friends_list: Array<string>;
}

interface UsersTabProps {
  searchQuery: string;
}

const UsersTab: React.FC<UsersTabProps> = ({ searchQuery }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      console.warn("User not authenticated");
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "RemiUsers", currentUser.uid);
    const unsubscribeFriendsList = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const friendsList = docSnapshot.data().friends_list || [];
          fetchFriendsData(friendsList);
        }
      },
      (error) => {
        console.error("Error fetching friends list:", error);
        setLoading(false);
      }
    );

    const usersCollection = collection(db, "RemiUsers");
    const unsubscribeUsers = onSnapshot(
      usersCollection,
      (snapshot) => {
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          username: doc.data().username,
          email: doc.data().email,
          profilePic: doc.data().profilePic,
          friends_list: doc.data().friends_list || [],
        })) as User[];
        setAllUsers(usersList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeFriendsList();
      unsubscribeUsers();
    };
  }, [currentUser]);

  const fetchFriendsData = async (friendsList: string[]) => {
    if (friendsList.length === 0) {
      setFriends([]);
      return;
    }

    const friendsQuery = query(
      collection(db, "RemiUsers"),
      where("email", "in", friendsList)
    );

    try {
      const friendsSnapshot = await getDocs(friendsQuery);
      const friendsData = friendsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setFriends(friendsData);
    } catch (error) {
      console.error("Error fetching friends data:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    if (searchQuery.trim() === "") {
      setFilteredUsers([]);
    } else {
      const filtered = allUsers.filter(
        (person) =>
          person.email !== currentUser.email &&
          (person.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            person.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers, currentUser]);

  const handleInvite = async (user: User) => {
    if (!currentUser) return;

    try {
      const notificationsRef = collection(db, "Notifications");
      const existingInviteQuery = query(
        notificationsRef,
        where("from", "==", currentUser.email),
        where("to", "==", user.email),
        where("read_flag", "==", true)
      );

      const querySnapshot = await getDocs(existingInviteQuery);

      if (!querySnapshot.empty) {
        Alert.alert(
          "Info",
          `You have already sent a friend request to ${user.username}`
        );
        return;
      }

      await addDoc(notificationsRef, {
        from: currentUser.email,
        to: user.email,
        read_flag: true,
      });
      Alert.alert("Success", `Friend request sent to ${user.username}`);
    } catch (error) {
      console.error("Error sending invite:", error);
      Alert.alert("Error", "Failed to send friend request. Please try again.");
    }
  };

  const removeFriend = async (friendEmail: string) => {
    if (!currentUser) {
      console.error("Current user email not available");
      return;
    }

    try {
      const currentUserQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", currentUser.email)
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
          friends_list: arrayRemove(currentUser.email),
        });
      }

      Alert.alert("Success", "Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      Alert.alert("Error", "Failed to remove friend. Please try again.");
    }
  };

  const renderItem = ({ item }: { item: User }) => {
    const isSearchResult = searchQuery.trim() !== "";
    const isFriend = friends.some((friend) => friend.email === item.email);

    return (
      <View style={styles.item}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(auth)/UserProfileInfo",
              params: { username: item.username },
            })
          }
        >
          <Avatar
            size={50}
            rounded
            source={(() => {
              if (typeof item.profilePic === "object" && item.profilePic) {
                // If profilePic is an object with a `uri` key
                if (item.profilePic) {
                  return require("../../assets/placeholders/profile-pic.png"); // Local asset fallback
                } else {
                  return { uri: item.profilePic }; // External URL
                }
              } else if (typeof item.profilePic === "string") {
                // If profilePic is a string (likely a direct URL)
                return { uri: item.profilePic };
              } else {
                return { uri: item.profilePic }; // External URL
              }
            })()}
            containerStyle={styles.avatarContainer}
          />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(auth)/UserProfileInfo",
                params: { username: item.username },
              })
            }
          >
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        </View>
        {isSearchResult ? (
          isFriend ? (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFriend(item.email)}
            >
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => handleInvite(item)}
            >
              <Ionicons name="person-add" size={16} color="#0D5F13" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Invite</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFriend(item.email)}
          >
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!auth.currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>
          User not authenticated. Please sign in.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D5F13" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={searchQuery.trim() === "" ? friends : filteredUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery.trim() === ""
              ? "No friends found"
              : "No users found"}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  item: {
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
  userInfo: {
    flex: 1,
  },
  username: {
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
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#0D5F13",
    backgroundColor: "#E8F5E9",
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    fontFamily: "Nunito-Regular",
  },
});

export default UsersTab;

