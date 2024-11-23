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

interface User {
  friends_list: Array<string>;
  username: string;
  email: string;
}

interface UsersTabProps {
  searchQuery: string;
}

const UsersTab: React.FC<UsersTabProps> = ({ searchQuery }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserFriends, setCurrentUserFriends] = useState<string[]>([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      console.warn("User not authenticated");
      return;
    }

    const userDocRef = doc(db, "RemiUsers", currentUser.uid);
    const unsubscribeFriendsList = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setCurrentUserFriends(docSnapshot.data().friends_list || []);
        }
      },
      (error) => {
        console.error("Error fetching friends list:", error);
      }
    );

    const fetchAllUsers = () => {
      const usersCollection = collection(db, "RemiUsers");
      const unsubscribeUsers = onSnapshot(
        usersCollection,
        (snapshot) => {
          const usersList = snapshot.docs.map((doc) => ({
            username: doc.data().username,
            email: doc.data().email,
          })) as User[];
          setAllUsers(usersList);
        },
        (error) => {
          console.error("Error fetching users:", error);
        }
      );

      return unsubscribeUsers;
    };

    const unsubscribeUsers = fetchAllUsers();

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

    return (
      <View style={styles.item}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        {isAlreadyFriend ? (
          <View style={styles.friendStatusContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.alreadyFriendText}>Friends</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => handleInvite(item)}
          >
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

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredFriends}
        renderItem={renderItem}
        keyExtractor={(item) => item.email}
        ListEmptyComponent={
          searchQuery ? (
            <Text style={styles.emptyText}>No users found</Text>
          ) : null
        }
      />
    </View>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#006400",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
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
  email: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Nunito-Regular",
  },
  friendStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  alreadyFriendText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#0D5F13",
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

