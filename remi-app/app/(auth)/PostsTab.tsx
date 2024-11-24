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
interface Post {
  id: string;
  title?: string;
  caption?: string;
  likesCount?: number;
  userId?: string;
  createdAt?: string;
  [key: string]: any; // For additional properties
}

const PostsTab: React.FC<PostsTabProps> = ({ searchQuery }) => {
  const [posts, setPosts] = useState<DocumentData[]>([]);

  useEffect(() => {
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
        let postsQuery;

        if (searchQuery) {
          const keywords = searchQuery.toLowerCase().split(" ");

          const allPostsSnapshot = await getDocs(
            query(postsRef, where("userId", "in", publicUserIds))
          );

          const allPosts: Post[] = allPostsSnapshot.docs.map((doc) => ({
            ...(doc.data() as Post), 
            id: doc.id,
          }));

          const filteredPosts = allPosts
            .filter((post) => {
              const title = post.title?.toLowerCase() || "";
              const caption = post.caption?.toLowerCase() || "";
              return keywords.some(
                (keyword) =>
                  title.includes(keyword) || caption.includes(keyword)
              );
            })
            .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)); 

          setPosts(filteredPosts);
        } else {
          postsQuery = query(
            postsRef,
            where("userId", "in", publicUserIds),
            orderBy("likesCount", "desc"),
            limit(10)
          );

          const postsSnapshot = await getDocs(postsQuery);
          const defaultPosts: Post[] = postsSnapshot.docs.map((doc) => ({
            ...(doc.data() as Post), 
            id: doc.id,
          }));

          setPosts(defaultPosts);
        }
      } catch (error) {
        Alert.alert(
          "Error",
          `Failed to fetch posts: ${error instanceof Error ? error.message : error}`
        );
      }
    };

    fetchAllPosts();

    const interval = setInterval(fetchAllPosts, 60000); // 60000 ms = 1 minute
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [searchQuery]);


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
        {/* <Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" /> */}
      </View>
    </SafeAreaView>
  );
};

export default PostsTab;
