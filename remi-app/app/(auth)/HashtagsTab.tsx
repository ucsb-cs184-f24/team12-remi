import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  getDocs,
  DocumentData,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { RecipePost } from "./(tabs)/home";
import Ustyles from "../../components/UniversalStyles";

type RecipePostType = {
  id: string;
  caption: string;
  hashtags: string;
};

interface HashtagsTabProps {
  selectedTags: { id: number; name: string }[];
}

const HashtagsTab: React.FC<HashtagsTabProps> = ({ selectedTags }) => {
  const [posts, setPosts] = useState<DocumentData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPostsByTags = async () => {
    setError(null);
    setLoading(true);

    try {
      const postsRef = collection(db, "Posts");

      let postsQuery;

      if (selectedTags.length === 0) {
        // Default fetch logic when no tags are selected
        postsQuery = query(
          postsRef,
          orderBy("likesCount", "desc"), // Order by likes as an example
          limit(10) // Limit to top 10 posts
        );
      } else {
        // Fetch posts matching selected tags
        const selectedTagIds = selectedTags.map((tag) => tag.id);

        const snapshot = await getDocs(postsRef);
        const filteredPosts = snapshot.docs
          .map((doc) => {
            const data = doc.data() as Omit<RecipePostType, "id">;
            return { id: doc.id, ...data };
          })
          .filter((post) => {
            const postHashtags = post.hashtags
              ?.split(",")
              .map((tagId) => parseInt(tagId.trim(), 10))
              .filter((tagId) => !isNaN(tagId));

            return (
              postHashtags &&
              selectedTagIds.every((tagId) => postHashtags.includes(tagId))
            );
          });

        setPosts(filteredPosts);

        if (filteredPosts.length === 0) {
          setError("No posts found with the selected tags.");
        }

        return;
      }

      // Fetch default posts if no tags are selected
      const defaultSnapshot = await getDocs(postsQuery);
      const defaultPosts = defaultSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(defaultPosts);

      if (defaultPosts.length === 0) {
        setError("No posts available at the moment.");
      }
    } catch (error) {
      setError("Error fetching posts.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsByTags();
  }, [selectedTags]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPostsByTags().then(() => setRefreshing(false));
  }, [selectedTags]);
  console.log(selectedTags);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D5F13" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0D5F13"]}
            />
          }>
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts found</Text>
              <Text style={styles.emptySubtext}>
                Try selecting different tags or refresh the page.
              </Text>
            </View>
          ) : (
            posts
              .sort((a, b) => b.likesCount - a.likesCount)
              .map((post, index) => (
                <View key={post.id} style={styles.postContainer}>
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
                    postID={post.id}
                    userHasCommented={post.userHasCommented}
                  />
                  <View style={styles.separator} />
                </View>
              ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFBF0",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#0D5F13",
    fontFamily: "Nunito-Regular",
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    margin: 10,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Nunito-Regular",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
    fontFamily: "Nunito-Bold",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    fontFamily: "Nunito-Regular",
  },
  postContainer: {
    marginBottom: 10,
    borderRadius: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});

export default HashtagsTab;
