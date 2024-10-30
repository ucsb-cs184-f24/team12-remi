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
} from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig"; // Ensure correct imports
import { signOut } from "firebase/auth";
import Ustyles from "../../../components/UniversalStyles";
import Spacer from "../../../components/Spacer";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears > 0) {
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  } else if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
};

interface RecipePostProps {
  userID: string;
  timeAgo: Date;
  mediaUrl: string;
  likes: number;
  comments: number;
  recipeName: string;
  price: number;
  difficulty: number;
  time: number;
  caption: string;
  hashtags: string[];
}

const getUsername = async (userID: string): Promise<string> => {
  try {
    const userDocRef = doc(db, "RemiUsers", userID);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return userData.username;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
  return "Unknown User";
};

const RecipePost: React.FC<RecipePostProps> = ({
  userID,
  timeAgo,
  likes,
  comments,
  recipeName,
  price,
  difficulty,
  time,
  caption,
  hashtags,
  mediaUrl,
}) => {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUsername = async () => {
      const name = await getUsername(userID);
      setUsername(name);
    };
    fetchUsername();
  }, [userID]);

  return (
    <View style={Ustyles.post}>
      <View style={Ustyles.postHeader}>
        <View style={Ustyles.userInfo}>
          <Image
            source={require("../../../assets/placeholders/user-avatar.png")}
            style={Ustyles.avatar}
          />
          <View>
            <Text style={Ustyles.username}>{username}</Text>
            <Text style={Ustyles.timeAgo}>{formatTimeAgo(timeAgo)}</Text>
          </View>
        </View>
        <View style={Ustyles.engagement}>
          <View style={Ustyles.engagementItem}>
            <Ionicons name="heart-outline" size={27} color="red" />
            <Text style={Ustyles.engagementText}>{likes}</Text>
          </View>
          <View style={Ustyles.engagementItem}>
            <Ionicons name="chatbox-outline" size={27} color="gray" />
            <Text style={Ustyles.engagementText}>{comments}</Text>
          </View>
        </View>
      </View>
      <View style={Ustyles.recipeContent}>
        <View style={Ustyles.leftColumn}>
          <View style={Ustyles.imageContainer}>
            <Image
              source={
                mediaUrl
                  ? { uri: mediaUrl }
                  : require("../../../assets/placeholders/recipe-image.png")
              }
              style={Ustyles.recipeImage}
            />
          </View>
          <Text style={Ustyles.recipeName}>{recipeName}</Text>
          <TouchableOpacity style={Ustyles.seeNotesButton}>
            <Text style={Ustyles.seeNotesText}>See Notes</Text>
          </TouchableOpacity>
        </View>
        <View style={Ustyles.rightColumn}>
          <View style={Ustyles.recipeDetails}>
            <Text style={Ustyles.detailText}>
              Price: ${price.toFixed(2)}/Serving
            </Text>
            <View style={Ustyles.slider}>
              <View
                style={[
                  Ustyles.sliderFill,
                  { width: `${(price / 10) * 100}%` },
                ]}
              />
            </View>
            <Text style={Ustyles.detailText}>
              Difficulty: {difficulty.toFixed(1)} / 5
            </Text>
            <View style={Ustyles.slider}>
              <View
                style={[
                  Ustyles.sliderFill,
                  { width: `${(difficulty / 5) * 100}%` },
                ]}
              />
            </View>
            <Text style={Ustyles.detailText}>Time: {time} min</Text>
            <View style={Ustyles.slider}>
              <View
                style={[
                  Ustyles.sliderFill,
                  { width: `${(time / 120) * 100}%` },
                ]}
              />
            </View>
            <Text style={Ustyles.subDetailText}>
              20 active minutes + 10 passive minutes
            </Text>
          </View>
        </View>
      </View>
      <View style={Ustyles.captionContainer}>
        <Text style={Ustyles.caption}>{caption}</Text>
        <Text style={Ustyles.hashtags}>{hashtags}</Text>
      </View>
    </View>
  );
};

// Component definition
const Home: React.FC = () => {
  const user = auth.currentUser;
  const [posts, setPosts] = useState<DocumentData[]>([]);
  //record notification count using state
  // const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [friendRequests, setFriendRequests] = useState<
    { id: string; [key: string]: any }[]
  >([]);
  const router = useRouter();
  const [friendsList, setFriendsList] = useState<string[]>([]);

  // Fetch all posts from Firestore
  const fetchAllPosts = async () => {
    try {
      const postsRef = collection(db, "Posts");
      console.log(friendsList);
      const q = query(postsRef, where("userId", "in", friendsList));
      const querySnapshot = await getDocs(q);
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

  // Use `useEffect` to fetch posts when the component mounts
  useEffect(() => {
    fetchAllPosts();
  }, [friendsList]);

  useEffect(() => {
    // Set up real-time listener for pending friend requests
    if (user) {
      const q = query(
        collection(db, "Notifications"),
        where("to", "==", user.email),
        where("read_flag", "==", true) // Only show unread friend requests
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFriendRequests(requests);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const fetchFriendsList = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "RemiUsers", user.uid);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const friendsEmails = userData.friends_list || [];

            if (friendsEmails.length > 0) {
              const q = query(
                collection(db, "RemiUsers"),
                where("email", "in", friendsEmails)
              );
              const querySnapshot = await getDocs(q);
              const friendsIds = querySnapshot.docs.map((doc) => doc.id);
              setFriendsList(friendsIds);
            }
          }
        } catch (error) {
          console.error("Error fetching friend list:", error);
        }
      }
    };

    fetchFriendsList();
  }, [user]);

  return (
    <SafeAreaView style={Ustyles.background}>
      <View style={Ustyles.feed}>
        <ScrollView stickyHeaderIndices={[0]} style={Ustyles.feed}>
          {/* <View style={Ustyles.stickyHeader}>
            <TouchableOpacity
              onPress={() => router.push("../../notifications")}
              style={Ustyles.bellIconContainer2}
            >
              <Ionicons name="notifications-outline" size={30} color="#000" />
              {friendRequests.length > 0 && (
                <View style={Ustyles.notificationBadge}>
                  <Text style={Ustyles.notificationText}>
                    {friendRequests.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View> */}
          <View style={styles.header}>
            <Text style={styles.logoText}>Remi</Text>
            <View style={styles.iconContainer}>
              <TouchableOpacity
                onPress={() => router.push("../../notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={27}
                  color="black"
                />
                {friendRequests.length > 0 && (
                  <View style={Ustyles.notificationBadge}>
                    <Text style={Ustyles.notificationText}>
                      {friendRequests.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {posts.map((post, index) => (
            <RecipePost
              key={index}
              userID={post.userId || "Anonymous"}
              timeAgo={
                post.createdAt ? new Date(post.createdAt) : new Date(2002, 2, 8)
              }
              likes={post.likesCount || "0"}
              comments={post.comments || "0"}
              recipeName={post.title || "Untitled Recipe"}
              price={post.Price || "0.00"}
              difficulty={post.Difficulty || "0"}
              time={post.Time || "0"}
              caption={post.caption || "No caption"}
              hashtags={post.hashtags || ["#default"]}
              mediaUrl={post.mediaUrl || ""}
            />
          ))}
        </ScrollView>
        {/* <Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" /> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the logo
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    position: "relative", // Add this to allow absolute positioning of children
  },
  logoText: {
    fontFamily: "OrelegaOne_400Regular",
    fontSize: 24,
    color: "#000000",
  },
  iconContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  contentItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  contentText: {
    fontSize: 16,
  },
});

export default Home;
