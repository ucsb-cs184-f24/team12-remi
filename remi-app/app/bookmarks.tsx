import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
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
import Ustyles from "../components/UniversalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; // Add this import
import Ionicons from "react-native-vector-icons/Ionicons";

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
  const router = useRouter(); // Initialize router

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
    <SafeAreaView style={Ustyles.background} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={30} color="#0D5F13" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Bookmarks</Text>
        </View>
        <FlatList
          data={bookmarkedPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
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
              <View style={Ustyles.separator} />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No bookmarks found.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default BookmarksPage;

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
  emptyText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 18,
    lineHeight: 0,
    color: "#0D5F13",
    justifyContent: "center",
    alignSelf: "center",
    paddingTop: 20,
  },
  backButton: {
    position: "absolute",
    left: 16,
    padding: 8,
    zIndex: 1,
  },
  backButtonText: {
    marginLeft: 5,
    color: "#0D5F13",
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    position: "relative",
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0D5F13",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Nunito-Bold",
  },
});
