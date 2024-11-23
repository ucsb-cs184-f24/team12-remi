import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Alert,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Ustyles from "../../components/UniversalStyles";
import { RecipePost } from "./(tabs)/home";

interface PostsTabProps {
  searchQuery: string;
}

interface Post {
  id: string;
  title?: string;
  caption?: string;
  likesCount?: number;
  userId?: string;
  createdAt?: string;
  comments?: number;
  Price?: number;
  Difficulty?: number;
  Time?: number;
  hashtags?: string[];
  mediaUrl?: string;
  userHasCommented?: boolean;
  [key: string]: any;
}

const PostsTab: React.FC<PostsTabProps> = ({ searchQuery }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const postsRef = collection(db, "Posts");
      const postsQuery = query(postsRef, orderBy("likesCount", "desc"), limit(searchQuery ? 50 : 10));
      const querySnapshot = await getDocs(postsQuery);

      const fetchedPosts: Post[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Post[];

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert(
        "Error",
        "Failed to fetch posts. Please check your connection and try again."
      );
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const renderPost = ({ item: post }: { item: Post }) => (
    <View style={styles.postContainer}>
      <RecipePost
        userID={post.userId || "Anonymous"}
        timeAgo={post.createdAt ? new Date(post.createdAt) : new Date()}
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
      <View style={Ustyles.separator} />
    </View>
  );

  return (
    <SafeAreaView style={Ustyles.background} edges={["bottom"]}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(post) => post.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    width: "100%",
  },
  flatListContent: {
    flexGrow: 1, // Ensures the list takes up available space
    paddingVertical: 10, // Adds padding at the top and bottom
  },
});

export default PostsTab;
