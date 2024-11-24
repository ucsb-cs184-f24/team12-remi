// PostsTab.tsx
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  FlatList,
  Button,
  Image,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // For icons
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  QuerySnapshot,
  DocumentData,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig"; // Ensure correct imports
import { signOut } from "firebase/auth";
import Ustyles from "../../components/UniversalStyles";
import Spacer from "../../components/Spacer";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecipePost } from "./(tabs)/home";

interface PostsTabProps {
  searchQuery: string;
}
interface PostsTabProps {
  searchQuery: string;
  filters: {
    price: [number, number]; // Range for price
    difficulty: [number, number]; // Range for difficulty
    time: [number, number]; // Range for time
  };
}
interface Post {
  id: string;
  title?: string;
  caption?: string;
  likesCount?: number;
  userId?: string;
  createdAt?: string;
  [key: string]: any; // For additional properties
}

const PostsTab: React.FC<PostsTabProps> = ({ searchQuery, filters }) => {
  const [posts, setPosts] = useState<DocumentData[]>([]);
  const user = auth.currentUser;

  const fetchAllPosts = async () => {
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

      let querySnapshot;
      if (!searchQuery && isDefaultFilters) {
        querySnapshot = await getDocs(
          query(postsRef, where("userId", "in", publicUserIds))
        );
      } else {
        querySnapshot = await getDocs(
          query(postsRef, where("userId", "in", publicUserIds), orderBy("likesCount", "desc"), limit(10))
        );
      }

      const allPosts: Post[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Post[];

      let filteredPosts = allPosts;

      // Apply search query if present
      if (searchQuery) {
        const keywords = searchQuery.toLowerCase().split(" ");
        filteredPosts = filteredPosts.filter((post) => {
          const title = post.title?.toLowerCase() || "";
          const caption = post.caption?.toLowerCase() || "";
          return keywords.some(
            (keyword) => title.includes(keyword) || caption.includes(keyword)
          );
        });
      }

      // Apply filters for price, difficulty, and time
      if (!isDefaultFilters) {
        filteredPosts = filteredPosts.filter((post) => {
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

      setPosts(filteredPosts);
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to fetch posts: ${error instanceof Error ? error.message : "An unknown error occurred."}`
      );
    }
  };

  useEffect(() => {
    fetchAllPosts();
    const interval = setInterval(fetchAllPosts, 60000); // 1 minute
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [searchQuery, filters]);

  return (
    <SafeAreaView style={Ustyles.background} edges={["top"]}>
      <View style={Ustyles.background}>
        <ScrollView style={Ustyles.feed}>
          {posts.map((post, index) => (
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
                postID={post.id}
                userHasCommented={post.userHasCommented}
              />
              <View style={Ustyles.separator} />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PostsTab;

export default PostsTab;
