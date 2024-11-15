import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Button,
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

    // Fetch current user's friends list
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

    // Fetch all users from Firestore
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

  // Filter users based on the search query
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
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        {isAlreadyFriend ? (
          <View style={styles.centeredTextContainer}>
            <Text style={styles.alreadyFriendText}>
              Already friends with this user!
            </Text>
          </View>
        ) : (
          <Button title="Invite" onPress={() => handleInvite(item)} />
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
      <ScrollView>
        {filteredFriends.length > 0
          ? filteredFriends.map((item) => (
              <View key={item.username}>{renderItem({ item })}</View>
            ))
          : searchQuery && <Text style={styles.emptyText}>No users found</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  centeredTextContainer: {
    alignItems: "center",
    marginTop: 5,
  },
  alreadyFriendText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UsersTab;
