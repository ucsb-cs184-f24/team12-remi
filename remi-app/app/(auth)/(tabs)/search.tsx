import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View, ActivityIndicator , Button} from 'react-native';
import { Searchbar } from 'react-native-paper';
import { collection, getDocs ,query, limit} from 'firebase/firestore';
import { db, auth } from '../../../firebaseConfig';

interface User {
  friends_list: Array<string>;
  username: string;
  email: string;
}

const SearchFriendsScreen: React.FC = () => {
  const user = auth.currentUser;
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const usersCollection = collection(db, 'RemiUsers');
        // const usersQuery = query(usersCollection, limit(20));
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          username: doc.data().username,
          email: doc.data().email
        })) as User[];
        setAllUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  // Handle search query for both username and email
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    // console.log("search with query: ", query);
    if (query.trim() === '') {
      setFilteredFriends([]);
      return;
    }
    const filtered = allUsers.filter(person =>
      person.username.toLowerCase().startsWith(query.toLowerCase()) ||
      person.email.toLowerCase().startsWith(query.toLowerCase())
    );
    const filteredWithoutSelf = filtered.filter(person => person.email !== user?.email);
    setFilteredFriends(filteredWithoutSelf);
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.item}>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.email}>{item.email}</Text>
      <Button title="Invite" onPress={() => handleInvite(item)} />
    </View>
  );

  const handleInvite = (user: User) => {
    // Handle invite logic here
    console.log(`Invited ${user.username}`);
  };

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
});

export default SearchFriendsScreen;