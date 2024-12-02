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
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "react-native-elements";
import { Friends } from "../friends";

interface User {
  friends_list: Array<string>;
  username: string;
  email: string;
  profilePic?: string;
}

interface UsersTabProps {
  searchQuery: string;
}

const UsersTab: React.FC<UsersTabProps> = ({ searchQuery }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserFriends, setCurrentUserFriends] = useState<string[]>([]);
  const currentUser = auth.currentUser;

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
          setCurrentUserFriends(docSnapshot.data().friends_list || []);
        }
        setLoading(false);
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
          username: doc.data().username,
          email: doc.data().email,
          profilePic: doc.data().profilePic,
          friends_list: doc.data().friends_list || [],
        })) as User[];
        setAllUsers(usersList);
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );

    return () => {
      unsubscribeFriendsList();
      unsubscribeUsers();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    if (searchQuery.trim() === "") {
      setFilteredFriends([]);
      return;
    }

    const filtered = allUsers.filter(
      (person) =>
        person.email !== currentUser.email &&
        (person.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredFriends(filtered);
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
    }
  };

  const renderItem = ({ item }: { item: User }) => {
    const isAlreadyFriend = currentUserFriends.includes(item.email);
    // console.log(item.profilePic.uri)
    return (
      <View style={styles.item}>
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
              // Default fallback to placeholder
              return require("../../assets/placeholders/user-avatar.png");
            }
          })()}
          containerStyle={styles.avatarContainer}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
        </View>
        {isAlreadyFriend ? (
          <View style={styles.friendStatusContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#6CAB44" />
            <Text style={styles.alreadyFriendText}>Friends</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => handleInvite(item)}>
            <Ionicons name="person-add" size={20} color="#FFFFFF" />
            <Text style={styles.inviteButtonText}>Invite</Text>
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
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return searchQuery.trim() === "" ? (
    <Friends /> // Render the Friends component
  ) : (
    <FlatList
      data={filteredFriends}
      renderItem={renderItem}
      keyExtractor={(item) => item.email}
      ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  avatarContainer: {
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#006400",
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
  friendStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  alreadyFriendText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6CAB44",
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#006400",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inviteButtonText: {
    color: "#FFFFFF",
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888888",
    fontFamily: "Nunito-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UsersTab;
