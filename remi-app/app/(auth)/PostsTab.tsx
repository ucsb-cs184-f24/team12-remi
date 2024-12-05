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
  where,
  orderBy,
  limit,
  DocumentData,
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import Ustyles from "../../components/UniversalStyles";
import { RecipePost } from "./(tabs)/home";

interface PostsTabProps {
  searchQuery: string;
  filters: {
    price: [number, number];
    difficulty: [number, number];
    time: [number, number];
  };
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
  hashtags?: string;
  mediaUrl?: string;
  userHasCommented?: boolean;
  [key: string]: any;
}

const PostsTab: React.FC<PostsTabProps> = ({ searchQuery, filters }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const usersRef = collection(db, "RemiUsers");
      const usersQuery = query(usersRef, where("visibility", "==", "public"));
      const userSnapshot = await getDocs(usersQuery);

      const publicUserIds = userSnapshot.docs.map((doc) => doc.id);

      if (publicUserIds.length === 0) {
        setPosts([]);
        return;
      }

      const postsRef = collection(db, "Posts");
      const isDefaultFilters =
        filters.price[0] === 1 &&
        filters.price[1] === 100 &&
        filters.difficulty[0] === 0 &&
        filters.difficulty[1] === 5 &&
        filters.time[0] === 1 &&
        filters.time[1] === 120;

      let postsQuery;
      if (!searchQuery && isDefaultFilters) {
        postsQuery = query(
          postsRef,
          where("userId", "in", publicUserIds),
          orderBy("likesCount", "desc"),
          limit(10)
        );
      } else {
        postsQuery = query(
          postsRef,
          where("userId", "in", publicUserIds),
          orderBy("likesCount", "desc"),
          limit(50)
        );
      }

      const querySnapshot = await getDocs(postsQuery);

      let fetchedPosts: Post[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Post[];

      // Apply search query if present
      if (searchQuery) {
        const keywords = searchQuery.toLowerCase().split(" ");
        fetchedPosts = fetchedPosts.filter((post) => {
          const title = post.title?.toLowerCase() || "";
          const caption = post.caption?.toLowerCase() || "";
          return keywords.some(
            (keyword) => title.includes(keyword) || caption.includes(keyword)
          );
        });
      }

      // Apply filters for price, difficulty, and time
      if (!isDefaultFilters) {
        fetchedPosts = fetchedPosts.filter((post) => {
          const price = post.Price || 0.0;
          const difficulty = post.Difficulty || 0;
          const time = post.Time || 0;

          return (
            price >= filters.price[0] &&
            price <= filters.price[1] &&
            difficulty >= filters.difficulty[0] &&
            difficulty <= filters.difficulty[1] &&
            time >= filters.time[0] &&
            time <= filters.time[1]
          );
        });
      }

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert(
        "Error",
        "Failed to fetch posts. Please check your connection and try again."
      );
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 60000); // 1 minute
    return () => clearInterval(interval); // Cleanup interval on component unmount
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
        hashtags={post.hashtags || "None"}
        mediaUrl={post.mediaUrl || ""}
        postID={post.id}
        userHasCommented={post.userHasCommented ?? false}
      />
      <View style={styles.separator} />
    </View>
  );

  return (
    <SafeAreaView style={Ustyles.background} edges={[]}>
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
    marginBottom: 10,
    borderRadius: 8,
  },
  flatListContent: {
    flexGrow: 1,
    paddingVertical: 0,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});

export default PostsTab;

