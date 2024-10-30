import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View, ActivityIndicator, Button, Alert } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { collection, addDoc, getDocs, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '../../../firebaseConfig';

interface User {
  friends_list: Array<string>;
  username: string;
  email: string;
}

const SearchFriendsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
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

    const userDocRef = doc(db, 'RemiUsers', currentUser.uid);
    const unsubscribeFriendsList = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setCurrentUserFriends(docSnapshot.data().friends_list || []);
      }
    }, (error) => {
      console.error("Error fetching friends list:", error);
    });

    const fetchAllUsers = () => {
      const usersCollection = collection(db, 'RemiUsers');
      const unsubscribeUsers = onSnapshot(usersCollection, (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          username: doc.data().username,
          email: doc.data().email,
        })) as User[];
        setAllUsers(usersList);
      }, (error) => {
        console.error('Error fetching users:', error);
      });

      return unsubscribeUsers;
    };

    const unsubscribeUsers = fetchAllUsers();

    return () => {
      unsubscribeFriendsList();
      unsubscribeUsers();
    };
  }, [currentUser]);

  const onChangeSearch = (query: string) => {
    if (!currentUser) return;

    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredFriends([]);
      return;
    }
    const filtered = allUsers.filter(person =>
      person.email !== currentUser.email &&
      (person.username.toLowerCase().startsWith(query.toLowerCase()) ||
       person.email.toLowerCase().startsWith(query.toLowerCase()))
    );
    setFilteredFriends(filtered);
  };

  const renderItem = ({ item }: { item: User }) => {
    const isAlreadyFriend = currentUserFriends.includes(item.email);

    return (
      <View style={styles.item}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        {isAlreadyFriend ? (
          <View style={styles.centeredTextContainer}>
            <Text style={styles.alreadyFriendText}>Already friends with this user!</Text>
          </View>
        ) : (
          <Button title="Invite" onPress={() => handleInvite(item)} />
        )}
      </View>
    );
  };

  const handleInvite = async (user: User) => {
    if (!currentUser) return;

    try {
      const notificationsRef = collection(db, 'Notifications');
      const existingInviteQuery = query(
        notificationsRef,
        where("from", "==", currentUser.email),
        where("to", "==", user.email),
        where("read_flag", "==", true)
      );

      const querySnapshot = await getDocs(existingInviteQuery);

      if (!querySnapshot.empty) {
        Alert.alert('Info', `You have already sent a friend request to ${user.username}`);
        return;
      }

      await addDoc(notificationsRef, {
        from: currentUser.email,
        to: user.email,
        read_flag: true,
      });
      Alert.alert('Success', `Friend request sent to ${user.username}`);
    } catch (error) {
      console.error('Error sending invite:', error);
    }
  };

  if (!auth.currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>User not authenticated. Please sign in.</Text>
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
    <SafeAreaView style={styles.container}>
      <Searchbar
        placeholder="Search by username or email"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredFriends}
        keyExtractor={item => item.username}
        renderItem={renderItem}
        ListEmptyComponent={
          searchQuery ? <Text style={styles.emptyText}>No users found</Text> : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    margin: 10,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  centeredTextContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  alreadyFriendText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
  },
});

export default SearchFriendsScreen;
