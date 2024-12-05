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
import { useRouter } from "expo-router";
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

  const handleRemoveFriend = (user: User) => {
    // Implement remove friend logic here
    Alert.alert("Remove Friend", `Are you sure you want to remove ${user.username} from your friends?`);
  };

  const renderItem = ({ item }: { item: User }) => {
    const isAlreadyFriend = currentUserFriends.includes(item.email);
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
                if (item.profilePic) {
                  return require("../../assets/placeholders/profile-pic.png");
                } else {
                  return { uri: item.profilePic };
                }
              } else if (typeof item.profilePic === "string") {
                return { uri: item.profilePic };
              } else {
                return { uri: item.profilePic };
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
        {isAlreadyFriend ? (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFriend(item)}
          >
            <Text style={[styles.buttonText, { color: "#871717" }]}>Remove</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => handleInvite(item)}
          >
            <Ionicons name="person-add" size={16} color="#0D5F13" style={styles.buttonIcon} />
            <Text style={[styles.buttonText, { color: "#0D5F13" }]}>Invite</Text>
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

  return searchQuery.trim() === "" ? (
    <Friends />
  ) : (
    <FlatList
      data={filteredFriends}
      renderItem={renderItem}
      keyExtractor={(item) => item.email}
      ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
      contentContainerStyle={styles.listContent}
    />
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
    borderColor: "#0D5F13", // Dark green color
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
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: "Nunito-Bold",
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: 4,
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

