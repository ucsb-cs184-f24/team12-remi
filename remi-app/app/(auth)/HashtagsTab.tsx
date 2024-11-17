import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, FlatList, ScrollView } from "react-native";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { RecipePost } from "./(tabs)/home";
import Ustyles from "../../components/UniversalStyles";

// Define the type for a recipe document
type RecipePostType = {
  id: string;
  caption: string;
  hashtags: string; // Assuming hashtags are stored as an array of numbers
};

interface HashtagsTabProps {
  selectedTags: { id: number; name: string }[];
}

const HashtagsTab: React.FC<HashtagsTabProps> = ({ selectedTags }) => {
  const [posts, setPosts] = useState<DocumentData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts based on selected tag IDs
  const fetchPostsByTags = async () => {
    if (selectedTags.length === 0) {
      setError("No tags selected.");
      setPosts([]);
      return;
    }

    setError(null);
    try {
      const postsRef = collection(db, "Posts");
      const snapshot = await getDocs(postsRef);

      // Extract the tag IDs from selectedTags (e.g., [5, 17])
      const selectedTagIds = selectedTags.map((tag) => tag.id);

      // Filter posts where the 'hashtags' field includes any of the selected tag IDs
      const filteredPosts = snapshot.docs
        .map((doc) => {
          const data = doc.data() as Omit<RecipePostType, "id">;
          return { id: doc.id, ...data };
        })
        .filter((post) => {
          // Convert the hashtags string to an array of numbers
          const postHashtags = post.hashtags
            ?.split(",")
            .map((tagId) => parseInt(tagId.trim(), 10))
            .filter((tagId) => !isNaN(tagId)); // Remove invalid numbers

          // Check if any of the selected tag IDs are included in the post's hashtags
          return (
            postHashtags &&
            selectedTagIds.every((tagId) => postHashtags.includes(tagId))
          );
        });

      setPosts(filteredPosts);
      console.log(posts);

      if (filteredPosts.length === 0) {
        setError("No posts found with the selected tags.");
      }
    } catch (error) {
      setError("Error fetching posts.");
      console.error(error);
    }
  };

  // Fetch posts whenever selectedTags changes
  useEffect(() => {
    fetchPostsByTags();
  }, [selectedTags]);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView style={Ustyles.background}>
          {posts
            .sort((a, b) => b.likesCount - a.likesCount)
            .map((post, index) => (
              <View key={post.id}>
                <RecipePost
                  key={index}
                  userID={post.userId || "Anonymous"}
                  timeAgo={
                    post.createdAt
                      ? new Date(post.createdAt)
                      : new Date(2002, 2, 8)
                  }
                  likes={post.likesCount || 0}
                  comments={post.comments || 0}
                  recipeName={post.title || "Untitled Recipe"}
                  price={post.Price || 0.0}
                  difficulty={post.Difficulty || 0}
                  time={post.Time || 0}
                  caption={post.caption || "No caption"}
                  hashtags={post.hashtags || ["None"]}
                  mediaUrl={post.mediaUrl || ""}
                />
                <View style={Ustyles.separator} />
              </View>
            ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBF0",
  },
  errorText: {
    color: "red",
    marginBottom: 1,
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
