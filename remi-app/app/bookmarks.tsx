import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { RecipePost } from "./(auth)/(tabs)/home"; // Adjust the import path as needed

// Define the structure of a bookmarked post
interface BookmarkedPost {
  id: string;
  userId: string;
  createdAt: string; // Use Date if the data is already parsed as a date
  mediaUrl: string;
  likesCount: number;
  comments: number;
  title: string;
  Price: number;
  Difficulty: number;
  Time: number;
  caption: string;
  hashtags: string;
}

const BookmarksPage: React.FC = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Query the Bookmarks collection for the current user's bookmarks
        const bookmarksRef = collection(db, "Bookmarks");
        const q = query(bookmarksRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const postIds = querySnapshot.docs.map((doc) => doc.data().postId);

        // Fetch the posts that match the bookmarked post IDs
        const postsData = await Promise.all(
          postIds.map(async (postId) => {
            const postDoc = await getDoc(doc(db, "Posts", postId));
            if (postDoc.exists()) {
              return { id: postDoc.id, ...postDoc.data() } as BookmarkedPost;
            }
            return null; // Handle missing or deleted posts
          })
        );

        setBookmarkedPosts(
          postsData.filter((post) => post !== null) as BookmarkedPost[]
        );
      } catch (error) {
        console.error("Error fetching bookmarked posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarkedPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipePost
            postID={item.id}
            userID={item.userId}
            timeAgo={new Date(item.createdAt)}
            mediaUrl={item.mediaUrl}
            likes={item.likesCount}
            comments={item.comments}
            recipeName={item.title || "Untitled"}
            price={item.Price || 0.0}
            difficulty={item.Difficulty || 0}
            time={item.Time || 0}
            caption={item.caption || ""}
            hashtags={item.hashtags || ""}
            userHasCommented={false} // Placeholder, adjust if you track this
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No bookmarks found.</Text>
        }
      />
    </View>
  );
};

export default BookmarksPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});
