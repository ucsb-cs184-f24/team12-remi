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
  const user = auth.currentUser;

  // Fetch all posts from Firestore
  const fetchAllPosts = async () => {
    try {
      const postsRef = collection(db, "Posts");
      const postsQuery = query(
        postsRef,
        orderBy("likesCount", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(postsQuery);
      console.log(querySnapshot);
      const filteredPosts = querySnapshot.docs.map((doc) => doc.data());
      setPosts(filteredPosts);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", `Failed to fetch posts: ${error.message}`);
      } else {
        Alert.alert("Error", "An unknown error occurred.");
      }
    }
  };

  // Use `useEffect` to fetch posts when the component mounts and every minute
  useEffect(() => {
    fetchAllPosts();
    const interval = setInterval(fetchAllPosts, 60000); // 60000 ms = 1 minute
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <SafeAreaView style={Ustyles.background}>
      <View style={Ustyles.background}>
        <ScrollView style={Ustyles.feed}>
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
