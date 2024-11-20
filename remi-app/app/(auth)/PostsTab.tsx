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

const PostsTab: React.FC<PostsTabProps> = ({ searchQuery }) => {
  const [posts, setPosts] = useState<DocumentData[]>([]);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const usersRef = collection(db, "RemiUsers");
        const usersQuery = query(usersRef, where("visibility", "==", "public"));
        const userSnapshot = await getDocs(usersQuery);

        const publicUserIds = userSnapshot.docs.map((doc) => doc.id);

        // console.log("Public User IDs:", publicUserIds);

        if (publicUserIds.length === 0) {
          setPosts([]);
          return;
        }

        const postsRef = collection(db, "Posts");
        const postsQuery = query(
          postsRef,
          where("userId", "in", publicUserIds),
          orderBy("likesCount", "desc"),
          limit(10)
        );

        const postsSnapshot = await getDocs(postsQuery);
        const filteredPosts = postsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // console.log("Filtered Posts:", filteredPosts);

        setPosts(filteredPosts);
      } catch (error) {
        Alert.alert("Error", `Failed to fetch posts: ${error}`);
      }
    };

    fetchAllPosts();
    const interval = setInterval(fetchAllPosts, 60000); // Fetch every 1 minute
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={Ustyles.background}>
      <ScrollView style={Ustyles.feed}>
        {posts.map((post, index) => (
          <View key={post.id}>
            <RecipePost
              key={index}
              userID={post.userId || "Anonymous"}
              timeAgo={
                post.createdAt ? new Date(post.createdAt) : new Date(2002, 2, 8)
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
    </SafeAreaView>
  );
};

export default PostsTab;
