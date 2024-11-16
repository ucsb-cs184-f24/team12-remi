// HashtagsTab.tsx
import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// Define the type for a recipe document 
type RecipePost = {
  id: string;
  caption: string;
  hashtags: string; // Assuming hashtags are stored as a comma-separated string 
};

const HashtagsTab = () => {
  const [searchTag, setSearchTag] = useState<string>("");
  const [posts, setPosts] = useState<RecipePost[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts by search tag
  const searchPostsByTag = async () => {
    if (!searchTag.trim()) {
      setError("Please enter a tag to search.");
      setPosts([]);
      return;
    }

    setError(null); // Reset error message 
    try {
      const postsRef = collection(db, "Posts");
      const snapshot = await getDocs(postsRef);

      // Filter posts where the 'hashtags' field includes the search tag
      const filteredPosts = snapshot.docs
        .map((doc) => {
          const data = doc.data() as Omit<RecipePost, "id">;
          return { id: doc.id, ...data };
        })
        .filter((post) => post.hashtags && post.hashtags.split(",").includes(searchTag));

      setPosts(filteredPosts);

      if (filteredPosts.length === 0) {
        setError(`No posts found with tag "${searchTag}"`);
      }
    } catch (error) {
      setError("Error fetching posts.");
      console.error(error);
    }
  };

  // Handle search on button press 
  const handleSearch = () => {
    searchPostsByTag();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter a tag ID to search posts (e.g., '17')"
        value={searchTag}
        onChangeText={setSearchTag}
      />
      <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <Text style={styles.postTitle}>{item.caption}</Text>
              <Text>Tags: {item.hashtags}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 16,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
  postContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HashtagsTab;
