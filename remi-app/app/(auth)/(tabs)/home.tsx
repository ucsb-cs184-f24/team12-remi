// import React, { useEffect, useState } from "react";
// import {
//   Text,
//   View,
//   StyleSheet,
//   Modal,
//   FlatList,
//   Button,
//   Image,
//   Alert,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons"; // For icons
// import {
//   collection,
//   addDoc,
//   getDocs,
//   doc,
//   query,
//   QuerySnapshot,
//   DocumentData,
//   where,
//   onSnapshot,
//   updateDoc,
//   arrayUnion,
// } from "firebase/firestore";
// import { db, auth } from "../../../firebaseConfig"; // Ensure correct imports
// import { signOut } from "firebase/auth";
// import Ustyles from "../../../components/UniversalStyles";
// import Spacer from "../../../components/Spacer";
// import { useNavigation } from "@react-navigation/native";
// import { useRouter } from "expo-router";

// interface RecipePostProps {
//   username: string;
//   timeAgo: string;
//   likes: number;
//   comments: number;
//   bookmarks: number;
//   recipeName: string;
//   price: number;
//   difficulty: number;
//   time: number;
//   caption: string;
//   hashtags: string[];
// }

// const RecipePost: React.FC<RecipePostProps> = ({
//   username,
//   timeAgo,
//   likes,
//   comments,
//   bookmarks,
//   recipeName,
//   price,
//   difficulty,
//   time,
//   caption,
//   hashtags,
// }) => (
//   <View style={styles.post}>
//     <View style={styles.postHeader}>
//       <View style={styles.userInfo}>
//         <Image
//           source={require("../../../assets/placeholders/user-avatar.png")}
//           style={styles.avatar}
//         />
//         <View>
//           <Text style={styles.username}>{username}</Text>
//           <Text style={styles.timeAgo}>{timeAgo}</Text>
//         </View>
//       </View>
//       <View style={styles.engagement}>
//         <Text style={styles.engagementText}>❤️ {likes}</Text>
//         <Text style={styles.engagementText}>💬 {comments}</Text>
//         <Text style={styles.engagementText}>🔖 {bookmarks}</Text>
//       </View>
//     </View>
//     <View style={styles.recipeContent}>
//       <View style={styles.leftColumn}>
//         <View style={styles.imageContainer}>
//           <Image
//             source={require("../../../assets/placeholders/recipe-image.png")}
//             style={styles.recipeImage}
//           />
//         </View>
//         <Text style={styles.recipeName}>{recipeName}</Text>
//         <TouchableOpacity style={styles.seeNotesButton}>
//           <Text style={styles.seeNotesText}>See Notes</Text>
//         </TouchableOpacity>
//       </View>
//       <View style={styles.rightColumn}>
//         <View style={styles.recipeDetails}>
//           <Text style={styles.detailText}>Price: ${price}/Serving</Text>
//           <View style={styles.slider}>
//             <View style={[styles.sliderFill, { width: "30%" }]} />
//           </View>
//           <Text style={styles.detailText}>Difficulty: {difficulty}/5</Text>
//           <View style={styles.slider}>
//             <View style={[styles.sliderFill, { width: "90%" }]} />
//           </View>
//           <Text style={styles.detailText}>Time: {time} min</Text>
//           <View style={styles.slider}>
//             <View style={[styles.sliderFill, { width: "50%" }]} />
//           </View>
//           <Text style={styles.subDetailText}>
//             20 active minutes + 10 passive minutes
//           </Text>
//         </View>
//       </View>
//     </View>
//     <View style={styles.captionContainer}>
//       <Text style={styles.caption}>{caption}</Text>
//       <Text style={styles.hashtags}>{hashtags}</Text>
//     </View>
//   </View>
// );

// // Component definition
// const Home: React.FC = () => {
//   const user = auth.currentUser;
//   const [posts, setPosts] = useState<DocumentData[]>([]);
//   //record notification count using state
//   // const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
//   const [friendRequests, setFriendRequests] = useState([]); // Friend requests data
//   const router = useRouter();

//   // Fetch all posts from Firestore
//   const fetchAllPosts = async () => {
//     try {
//       const postsRef = collection(db, "Posts");
//       const userPostsQuery = query(
//         postsRef,
//         where("userId", "==", "ykkMofuaXDb6jQt3dj1IyJwYTtm1")
//       );
//       const querySnapshot = await getDocs(userPostsQuery);
//       const filteredPosts = querySnapshot.docs.map((doc) => doc.data());
//       console.log("Fetched Filtered Posts:", filteredPosts);
//       setPosts(filteredPosts);
//     } catch (error) {
//       if (error instanceof Error) {
//         Alert.alert("Error", `Failed to fetch posts: ${error.message}`);
//       } else {
//         Alert.alert("Error", "An unknown error occurred.");
//       }
//     }
//   };

//   // Use `useEffect` to fetch posts when the component mounts
//   useEffect(() => {
//     fetchAllPosts();
//   }, []);

//   useEffect(() => {
//     // Set up real-time listener for pending friend requests
//     if (user) {
//       const q = query(
//         collection(db, "Notifications"),
//         where("to", "==", user.email),
//         where("read_flag", "==", true) // Only show unread friend requests
//       );

//       const unsubscribe = onSnapshot(q, (snapshot) => {
//         const requests = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setFriendRequests(requests);
//       });

//       return () => unsubscribe();
//     }
//   }, [user]);

//   return (
//     <SafeAreaView style={Ustyles.background}>
//       {/* <View style={Ustyles.background}> */}
//       {/* <Spacer size={80} />
//       <Text style={styles.text}>Welcome to home</Text>
//       <Text style={Ustyles.logotext}>remi</Text>
//       <Text style={styles.text}>{user?.email}</Text>
//       <Spacer size={50} /> */}

//       {/* <View style={styles.bellIconContainer}>
//         <TouchableOpacity
//           onPress={() => router.push("../../notifications")}
//           style={styles.bellIconContainer}
//         >
//           <Ionicons name="notifications-outline" size={30} color="#000" />
//           {friendRequests.length > 0 && (
//             <View style={styles.notificationBadge}>
//               <Text style={styles.notificationText}>
//                 {friendRequests.length}
//               </Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View> */}
//       {/* <Spacer size={70} /> */}
//       <View style={styles.feed}>
//         <ScrollView stickyHeaderIndices={[0]} style={styles.feed}>
//           <View style={styles.stickyHeader}>
//             <TouchableOpacity
//               onPress={() => router.push("../../notifications")}
//               style={styles.bellIconContainer2}
//             >
//               <Ionicons name="notifications-outline" size={30} color="#000" />
//               {friendRequests.length > 0 && (
//                 <View style={styles.notificationBadge}>
//                   <Text style={styles.notificationText}>
//                     {friendRequests.length}
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           </View>
//           {posts.map((post, index) => (
//             <RecipePost
//               key={index}
//               username={post.username || "Anonymous"}
//               timeAgo={
//                 post.createdAt
//                   ? new Date(post.createdAt).toLocaleString()
//                   : "Unknown time"
//               }
//               likes={post.likes || "0"}
//               comments={post.comments || "0"}
//               bookmarks={post.bookmarks || "0"}
//               recipeName={post.recipeName || "Untitled Recipe"}
//               price={post.price || "0.00"}
//               difficulty={post.difficulty || "0"}
//               time={post.cookingTime || "0"}
//               caption={post.caption || "No caption"}
//               hashtags={post.hashtags || ["#default"]}
//             />
//           ))}
//         </ScrollView>
//         {/* <Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" /> */}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   centerText: {
//     justifyContent: "center",
//     alignContent: "center",
//   },
//   bellContainer2: {
//     position: "absolute",
//     right: 16,
//     top: 0,
//     bottom: 0,
//     justifyContent: "center",
//   },
//   headerText: {
//     color: "white",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   stickyHeader: {
//     height: 50,
//     backgroundColor: "#FFF9E6",
//   },
//   containerMarginTop: {
//     flex: 1,
//     marginTop: 10,
//   },
//   container: {
//     marginHorizontal: 20,
//     flex: 1,
//     justifyContent: "space-evenly",
//   },
//   input: {
//     marginVertical: 4,
//     height: 50,
//     borderWidth: 2,
//     borderRadius: 4,
//     padding: 10,
//     backgroundColor: "#fff",
//     borderColor: "#0D5F13",
//   },
//   text: {
//     fontFamily: "Roboto",
//     fontSize: 20,
//     color: "#0D5F13",
//     justifyContent: "center",
//     alignSelf: "center",
//   },
//   modalContainer: {
//     flex: 1,
//     padding: 20,
//     justifyContent: "center",
//     backgroundColor: "white",
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   requestItem: {
//     marginBottom: 20,
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ccc",
//   },
//   notificationBadge: {
//     position: "absolute",
//     right: 4,
//     top: 1,
//     backgroundColor: "red",
//     borderRadius: 10,
//     width: 15,
//     height: 15,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 0,
//   },
//   notificationText: {
//     color: "white",
//     fontSize: 11,
//     fontWeight: "bold",
//   },
//   bellIconContainer2: {
//     marginLeft: "auto", // Pushes the icon to the right
//     marginRight: 15,
//     justifyContent: "center",
//     alignItems: "flex-end",
//   },
//   logo: {
//     width: 30,
//     height: 30,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#006400",
//   },
//   feed: {
//     flex: 1,
//   },
//   post: {
//     backgroundColor: "#FFFFFF",
//     marginBottom: 10,
//     padding: 10,
//     borderRadius: 10,
//   },
//   postHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   userInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   username: {
//     fontWeight: "bold",
//     fontSize: 16,
//     color: "#006400",
//   },
//   timeAgo: {
//     color: "#888",
//     fontSize: 12,
//   },
//   engagement: {
//     flexDirection: "row",
//   },
//   engagementText: {
//     fontSize: 14,
//     marginLeft: 10,
//     color: "#8B4513",
//   },
//   recipeContent: {
//     flexDirection: "row",
//     borderWidth: 1,
//     borderColor: "#006400",
//     borderRadius: 10,
//     overflow: "hidden",
//   },
//   leftColumn: {
//     width: "65%",
//     padding: 10,
//   },
//   imageContainer: {
//     aspectRatio: 1,
//     borderWidth: 1,
//     borderColor: "#006400",
//     borderRadius: 10,
//     overflow: "hidden",
//   },
//   recipeImage: {
//     width: "100%",
//     height: "100%",
//   },
//   recipeName: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#006400",
//     marginTop: 10,
//     marginBottom: 5,
//   },
//   seeNotesButton: {
//     backgroundColor: "#E6F3E6",
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     alignSelf: "flex-start",
//     borderWidth: 1,
//     borderColor: "#006400",
//   },
//   seeNotesText: {
//     color: "#006400",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   rightColumn: {
//     width: "35%",
//     backgroundColor: "#E6F3E6",
//     padding: 10,
//   },
//   recipeDetails: {
//     justifyContent: "center",
//   },
//   detailText: {
//     marginBottom: 5,
//     fontSize: 14,
//     color: "#006400",
//     fontWeight: "bold",
//   },
//   subDetailText: {
//     fontSize: 12,
//     color: "#006400",
//     marginTop: 2,
//   },
//   slider: {
//     height: 4,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 2,
//     marginBottom: 10,
//   },
//   sliderFill: {
//     height: "100%",
//     backgroundColor: "#006400",
//     borderRadius: 2,
//   },
//   captionContainer: {
//     backgroundColor: "#E6F3E6",
//     padding: 10,
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   caption: {
//     color: "#006400",
//     marginBottom: 5,
//   },
//   hashtags: {
//     color: "#006400",
//     fontSize: 12,
//   },
//   navbar: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: "#E0E0E0",
//   },
// });

// export default Home;

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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // For icons
import {
  collection,
  addDoc,
  getDocs,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";
import Ustyles from "../../../components/UniversalStyles";
import Spacer from "../../../components/Spacer";
import { useRouter } from "expo-router";

const Home: React.FC = () => {
  const user = auth.currentUser;
  const [posts, setPosts] = useState<DocumentData[]>([]);
  const [friendRequests, setFriendRequests] = useState([]); 
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<DocumentData | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<DocumentData[]>([]); // To store comments for a post
  const router = useRouter();

  const fetchAllPosts = async () => {
    try {
      const postsRef = collection(db, "Posts");
      const userPostsQuery = query(
        postsRef,
        where("userId", "==", "ykkMofuaXDb6jQt3dj1IyJwYTtm1")
      );
      const querySnapshot = await getDocs(userPostsQuery);
      const filteredPosts = querySnapshot.docs.map((doc) => doc.data());
      setPosts(filteredPosts);
    } catch (error) {
      Alert.alert("Error", `Failed to fetch posts: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  // Fetch comments for a selected post
  const fetchComments = async (postId: string) => {
    try {
      const commentsRef = collection(db, `Posts/${postId}/Comments`);
      const querySnapshot = await getDocs(commentsRef);
      const commentsData = querySnapshot.docs.map((doc) => doc.data());
      setComments(commentsData);
    } catch (error) {
      Alert.alert("Error", `Failed to load comments: ${error.message}`);
    }
  };

  // Open comments modal and fetch comments for the post
  const openCommentsModal = (post: DocumentData) => {
    setSelectedPost(post);
    fetchComments(post.id);
    setCommentsModalVisible(true);
  };

  // Submit a new comment
  const handleAddComment = async () => {
    if (selectedPost && newComment.trim()) {
      try {
        const commentsRef = collection(db, `Posts/${selectedPost.id}/Comments`);
        await addDoc(commentsRef, { text: newComment, user: user?.email });
        setNewComment("");
        fetchComments(selectedPost.id); // Refresh comments after adding
      } catch (error) {
        Alert.alert("Error", `Failed to add comment: ${error.message}`);
      }
    }
  };

  return (
    <SafeAreaView style={Ustyles.background}>
      <View style={styles.feed}>
        <ScrollView stickyHeaderIndices={[0]} style={styles.feed}>
          <View style={styles.stickyHeader}>
            <TouchableOpacity
              onPress={() => router.push("../../notifications")}
              style={styles.bellIconContainer2}
            >
              <Ionicons name="notifications-outline" size={30} color="#000" />
              {friendRequests.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {friendRequests.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {posts.map((post, index) => (
            <View key={index} style={styles.post}>
              {/* Other post details */}
              <TouchableOpacity onPress={() => openCommentsModal(post)}>
                <Text style={styles.engagementText}>💬 {post.comments || 0}</Text>
              </TouchableOpacity>
              {/* Comments Modal */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={commentsModalVisible}
                onRequestClose={() => setCommentsModalVisible(false)}
              >
                <View style={styles.modalContainer}>
                  <Text style={styles.modalHeader}>Comments</Text>
                  <FlatList
                    data={comments}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.comment}>
                        <Text style={styles.commentUser}>{item.user}</Text>
                        <Text>{item.text}</Text>
                      </View>
                    )}
                  />
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentInput}
                      value={newComment}
                      onChangeText={setNewComment}
                      placeholder="Add a comment"
                    />
                    <Button title="Post" onPress={handleAddComment} />
                  </View>
                  <Button title="Close" onPress={() => setCommentsModalVisible(false)} />
                </View>
              </Modal>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  /* Other styles... */
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
    padding: 20,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  comment: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
  },
  commentUser: {
    fontWeight: "bold",
  },
  commentInputContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 10,
  },
});

export default Home;
