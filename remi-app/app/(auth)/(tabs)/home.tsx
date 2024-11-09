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
//   Platform,
//   StatusBar,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons"; // For icons
// import {
//   collection,
//   addDoc,
//   getDoc,
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
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const formatTimeAgo = (date: Date) => {
//   const now = new Date();
//   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
//   const diffInMinutes = Math.floor(diffInSeconds / 60);
//   const diffInHours = Math.floor(diffInMinutes / 60);
//   const diffInDays = Math.floor(diffInHours / 24);
//   const diffInYears = Math.floor(diffInDays / 365);

//   if (diffInYears > 0) {
//     return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
//   } else if (diffInDays > 0) {
//     return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
//   } else if (diffInHours > 0) {
//     return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
//   } else if (diffInMinutes > 0) {
//     return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
//   } else {
//     return "Just now";
//   }
// };

// const hashtagMap: { [key: string]: string } = {
//   "1": "Breakfast",
//   "2": "Lunch",
//   "3": "Dinner",
//   "4": "Vegetarian",
//   "5": "Vegan",
//   "6": "Gluten-Free",
//   "7": "Dairy-Free",
//   "8": "Keto",
//   "9": "Paleo",
//   "10": "Low Carb",
//   "11": "Mediterranean",
//   "12": "Asian",
//   "13": "Italian",
//   "14": "Mexican",
//   "15": "Indian",
//   "16": "Middle Eastern",
//   "17": "French",
//   "18": "American",
//   "19": "African",
//   "20": "Caribbean",
//   "21": "Comfort Food",
//   "22": "Dessert",
//   "23": "Snacks",
//   "24": "Appetizers",
//   "25": "BBQ",
//   "26": "Seafood",
//   "27": "Soups & Stews",
//   "28": "Salads",
//   "29": "Beverages",
//   "30": "Japanese",
// };

// interface RecipePostProps {
//   userID: string;
//   timeAgo: Date;
//   mediaUrl: string;
//   likes: number;
//   comments: number;
//   recipeName: string;
//   price: number;
//   difficulty: number;
//   time: number;
//   caption: string;
//   hashtags: string;
// }

// const getUsername = async (userID: string): Promise<string> => {
//   try {
//     const userDocRef = doc(db, "RemiUsers", userID);
//     const userSnapshot = await getDoc(userDocRef);
//     if (userSnapshot.exists()) {
//       const userData = userSnapshot.data();
//       return userData.username;
//     }
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//   }
//   return "Unknown User";
// };

// const RecipePost: React.FC<RecipePostProps> = ({
//   userID,
//   timeAgo,
//   likes,
//   comments,
//   recipeName,
//   price,
//   difficulty,
//   time,
//   caption,
//   hashtags,
//   mediaUrl,
// }) => {
//   const [username, setUsername] = useState<string>("");

//   const [modalVisible, setModalVisible] = useState(false);

//   const handleSeeNotesPress = () => {
//     setModalVisible(true); // Show the modal
//   };

//   const handleCloseModal = () => {
//     setModalVisible(false); // Hide the modal
//   };

//   useEffect(() => {
//     const fetchUsername = async () => {
//       const name = await getUsername(userID);
//       setUsername(name);
//     };
//     fetchUsername();
//   }, [userID]);

//   const hashtagNames = hashtags
//     .split(',')
//     .map(id => {
//       const name = hashtagMap[id.trim()];
//       return name ? `#${name}` : undefined; // Add "#" to the name if it exists
//     })
//     .filter(Boolean); // Filter out any undefined values

//   return (
//     <View style={Ustyles.post}>
//       <View style={Ustyles.postHeader}>
//         <View style={Ustyles.userInfo}>
//           <Image
//             source={require("../../../assets/placeholders/user-avatar.png")}
//             style={Ustyles.avatar}
//           />
//           <View>
//             <Text style={Ustyles.username}>{username}</Text>
//             <Text style={Ustyles.timeAgo}>{formatTimeAgo(timeAgo)}</Text>
//           </View>
//         </View>
//         <View style={Ustyles.engagement}>
//           <View style={Ustyles.engagementItem}>
//             <Ionicons name="heart-outline" size={27} color="red" />
//             <Text style={Ustyles.engagementText}>{likes}</Text>
//           </View>
//           <View style={Ustyles.engagementItem}>
//             <Ionicons name="chatbox-outline" size={27} color="gray" />
//             <Text style={Ustyles.engagementText}>{comments}</Text>
//           </View>
//         </View>
//       </View>
//       <View style={Ustyles.recipeContent}>
//         <View style={Ustyles.leftColumn}>
//           <View style={Ustyles.imageContainer}>
//             <Image
//               source={
//                 mediaUrl
//                   ? { uri: mediaUrl }
//                   : require("../../../assets/placeholders/recipe-image.png")
//               }
//               style={Ustyles.recipeImage}
//             />
//           </View>
//           <Text style={Ustyles.recipeName}>{recipeName}</Text>
//           <TouchableOpacity
//             style={Ustyles.seeNotesButton}
//             onPress={handleSeeNotesPress}
//           >
//             <Text style={Ustyles.seeNotesText}>See Notes</Text>
//           </TouchableOpacity>
//           <Modal
//             animationType="fade"
//             transparent={true}
//             visible={modalVisible}
//             onRequestClose={handleCloseModal} // Close on back button press
//           >
//             <View style={styles.modalContainer}>
//               <View style={styles.modalContent}>
//                 <Text style={styles.modalText}>{caption}</Text>
//                 {/* Add more content as needed */}
//                 <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
//                   <Text style={styles.closeButtonText}>Close</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Modal>
//         </View>
//         <View style={Ustyles.rightColumn}>
//           <View style={Ustyles.recipeDetails}>
//             <Text style={Ustyles.detailText}>
//               Price: ${price.toFixed(2)}/Serving
//             </Text>
//             <View style={Ustyles.slider}>
//               <View
//                 style={[
//                   Ustyles.sliderFill,
//                   { width: `${(price / 10) * 100}%` },
//                 ]}
//               />
//             </View>
//             <Text style={Ustyles.detailText}>
//               Difficulty: {difficulty.toFixed(1)} / 5
//             </Text>
//             <View style={Ustyles.slider}>
//               <View
//                 style={[
//                   Ustyles.sliderFill,
//                   { width: `${(difficulty / 5) * 100}%` },
//                 ]}
//               />
//             </View>
//             <Text style={Ustyles.detailText}>Time: {time} min</Text>
//             <View style={Ustyles.slider}>
//               <View
//                 style={[
//                   Ustyles.sliderFill,
//                   { width: `${(time / 120) * 100}%` },
//                 ]}
//               />
//             </View>
//             {/* <Text style={Ustyles.subDetailText}>
//               20 active minutes + 10 passive minutes
//             </Text> */}
//           </View>
//         </View>
//       </View>
//       <View style={Ustyles.captionContainer}>
//         {/* <Text style={Ustyles.caption}>{caption}</Text> */}
//         <Text style={Ustyles.hashtags}>{hashtagNames.join(", ")}</Text>
//       </View>
//     </View>
//   );
// };

// // Component definition
// const Home: React.FC = () => {
//   const insets = useSafeAreaInsets();
//   const user = auth.currentUser;
//   const [posts, setPosts] = useState<DocumentData[]>([]);
//   //record notification count using state
//   // const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
//   const [friendRequests, setFriendRequests] = useState<
//     { id: string; [key: string]: any }[]
//   >([]);
//   const router = useRouter();
//   const [friendsList, setFriendsList] = useState<string[]>([]);

//   // Fetch all posts from Firestore
//   const fetchAllPosts = async () => {
//     try {
//       if (friendsList.length === 0) {
//         return;
//       }
//       const postsRef = collection(db, "Posts");
//       console.log(friendsList);
//       const q = query(postsRef, where("userId", "in", friendsList));
//       const querySnapshot = await getDocs(q);
//       console.log(querySnapshot);
//       const filteredPosts = querySnapshot.docs.map((doc) => doc.data());
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
//   }, [friendsList]);

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

//   useEffect(() => {
//     const unsubscribe = onSnapshot(
//       doc(db, "RemiUsers", user?.uid || ""),
//       (doc) => {
//         if (doc.exists()) {
//           const userData = doc.data();
//           const friendsEmails = userData.friends_list || [];

//           if (friendsEmails.length > 0) {
//             const q = query(
//               collection(db, "RemiUsers"),
//               where("email", "in", friendsEmails)
//             );
//             getDocs(q)
//               .then((querySnapshot) => {
//                 const friendsIds = querySnapshot.docs.map((doc) => doc.id);
//                 setFriendsList(friendsIds);
//               })
//               .catch((error) => {
//                 console.error("Error fetching friend list:", error);
//               });
//           }
//         }
//       }
//     );

//     return () => unsubscribe();
//   }, [user]);

//   return (
//     <SafeAreaView style={Ustyles.background}>
//      <View style={Ustyles.background}>
//         <ScrollView stickyHeaderIndices={[0]} style={Ustyles.feed}>
//           <View
//             style={[
//               styles.header,
//               {
//                 backgroundColor: "#FFF9E6",
//               },
//             ]}
//           >
//             <View style={styles.headerContent}>
//               <Text style={styles.logoText}>Remi</Text>
//               <TouchableOpacity
//                 onPress={() => router.push("../../notifications")}
//               >
//                 <Ionicons
//                   name="notifications-outline"
//                   size={27}
//                   color="#0D5F13"
//                 />
//                 {friendRequests.length > 0 && (
//                   <View style={Ustyles.notificationBadge}>
//                     <Text style={Ustyles.notificationText}>
//                       {friendRequests.length}
//                     </Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//           {posts
//             .sort((a, b) => {
//               const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
//               const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
//               return dateB.getTime() - dateA.getTime();
//             })
//             .map((post, index) => (
//               <View>
//                 <RecipePost
//                   key={index}
//                   userID={post.userId || "Anonymous"}
//                   timeAgo={
//                     post.createdAt
//                       ? new Date(post.createdAt)
//                       : new Date(2002, 2, 8)
//                   }
//                   likes={post.likesCount || 0}
//                   comments={post.comments || 0}
//                   recipeName={post.title || "Untitled Recipe"}
//                   price={post.Price || 0.00}
//                   difficulty={post.Difficulty || 0}
//                   time={post.Time || 0}
//                   caption={post.caption || "No caption"}
//                   hashtags={post.hashtags || ["None"]}
//                   mediaUrl={post.mediaUrl || ""}
//                 />
//                 <View style={Ustyles.separator} />
//               </View>
//             ))}
//         </ScrollView>
//         {/* <Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" /> */}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   headerContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 10,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#ffffff",
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
//   },
//   scrollViewContent: {
//     flexGrow: 1,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center", // Center the logo
//     height: 60,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#BCD5AC",
//     position: "relative", // Add this to allow absolute positioning of children
//   },
//   logoText: {
//     fontFamily: "OrelegaOne_400Regular",
//     fontSize: 24,
//     color: "0D5F13",
//   },
//   iconContainer: {
//     position: "absolute",
//     right: 0,
//     top: 0,
//     bottom: 0,
//     justifyContent: "center",
//   },
//   contentItem: {
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e0e0e0",
//   },
//   contentText: {
//     fontSize: 16,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0)", // Semi-transparent background
//   },
//   modalContent: {
//     width: "80%",
//     padding: 20,
//     backgroundColor: "#fff",
//     borderWidth: 2,
//     borderColor: "#0D5F13",
//     borderRadius: 10,
//     elevation: 5, // Shadow for Android
//   },
//   modalText: {
//     fontSize: 16,
//     marginBottom: 20,
//     color: "#0D5F13",
//     fontFamily: "Nunito_400Regular",
//   },
//   closeButton: {
//     alignSelf: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 5,
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: "#0D5F13",
//     // backgroundColor: "#FFF9E6",
//     marginVertical: 5,
//   },
//   closeButtonText: {
//     fontFamily: "Nunito_700Bold",
//     fontSize: 15,
//     color: "#0D5F13",
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
  Platform,
  StatusBar,
  TextInput,
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
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig"; // Ensure correct imports
import { signOut } from "firebase/auth";
import Ustyles from "../../../components/UniversalStyles";
import Spacer from "../../../components/Spacer";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const hashtagMap: { [key: string]: string } = {
  "1": "Breakfast",
  "2": "Lunch",
  "3": "Dinner",
  "4": "Vegetarian",
  "5": "Vegan",
  "6": "Gluten-Free",
  "7": "Dairy-Free",
  "8": "Keto",
  "9": "Paleo",
  "10": "Low Carb",
  "11": "Mediterranean",
  "12": "Asian",
  "13": "Italian",
  "14": "Mexican",
  "15": "Indian",
  "16": "Middle Eastern",
  "17": "French",
  "18": "American",
  "19": "African",
  "20": "Caribbean",
  "21": "Comfort Food",
  "22": "Dessert",
  "23": "Snacks",
  "24": "Appetizers",
  "25": "BBQ",
  "26": "Seafood",
  "27": "Soups & Stews",
  "28": "Salads",
  "29": "Beverages",
  "30": "Japanese",
};

interface RecipePostProps {
  postID: string;
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
  hashtags: string;
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
  postID,
}) => {
  const [username, setUsername] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);

  const [likesCount, setLikesCount] = useState(likes);
  const [likedBy, setLikedBy] = useState<string[]>([]);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [newComment, setNewComment] = useState("");
  const [commentText, setCommentText] = useState<string>("");
  const [postComments, setPostComments] = useState<any[]>([]); // Store comments here

  const fetchComments = async () => {
    try {
      const commentsRef = collection(db, "Comments"); // Assume you have a 'Comments' collection
      const commentsQuery = query(commentsRef, where("postId", "==", userID)); // Adjust the field as necessary
      const querySnapshot = await getDocs(commentsQuery);
      const fetchedComments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPostComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (commentText: string) => {
    if (!commentText.trim()) return; // Prevent empty comments

    try {
      await addDoc(collection(db, "Comments"), {
        postId: userID, // Link to the post
        text: commentText,
        userId: auth.currentUser?.uid, // Current user's ID
        createdAt: new Date(),
      });
      setCommentText(""); // Clear the input field
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Handle submit logic
  const onSubmitComment = () => {
    if (newComment.trim() === "") return; // Prevent empty comments
    handleAddComment(newComment); // Call parent function to handle comment submission
    setNewComment(""); // Clear the text input
    setCommentVisible(false); // Close modal after submitting
  };

  const handleSeeNotesPress = () => {
    setModalVisible(true); // Show the modal
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Hide the modal
  };

  const handleCommentsPress = () => {
    setModalVisible(true); // Show the modal
    fetchComments(); // Fetch comments when modal is opened
  };

  const hanldeCloseComments = () => {
    setModalVisible(false); // Hide the modal
    setCommentText(""); // Reset comment input
  };

  const handleLikePress = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to like posts.");
      return;
    }

    const userId = auth.currentUser.uid;
    const postRef = doc(db, "Posts", postID);

    try {
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        const likedByArray: string[] = postData.likedBy || [];

        if (likedByArray.includes(userId)) {
          // User already liked the post, so remove their like
          await updateDoc(postRef, {
            likesCount: postData.likesCount - 1, // Directly update Firestore
            likedBy: arrayRemove(userId), // Remove user ID
          });
        } else {
          // User has not liked the post, so add their like
          await updateDoc(postRef, {
            likesCount: postData.likesCount + 1, // Directly update Firestore
            likedBy: arrayUnion(userId), // Add user ID
          });
        }
      }
    } catch (error) {
      console.error("Error updating like:", error);
      Alert.alert("Error", "Failed to update like. Please try again.");
    }
  };

  useEffect(() => {
    const postRef = doc(db, "Posts", postID);

    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const postData = doc.data();
        setLikesCount(postData.likesCount || 0); // Real-time update
        setLikedBy(postData.likedBy || []); // Real-time update of likedBy array
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [postID]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const name = await getUsername(userID);
        setUsername(name);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, [userID]);

  const hashtagNames = hashtags
    .split(",")
    .map((id) => {
      const name = hashtagMap[id.trim()];
      return name ? `#${name}` : undefined; // Add "#" to the name if it exists
    })
    .filter(Boolean); // Filter out any undefined values

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
          {/* <View style={Ustyles.engagementItem}>
            <Ionicons
              name={likesCount > 0 ? "heart" : "heart-outline"}
              size={27}
              color="red"
              onPress={handleLikePress}
            />
            <Text style={Ustyles.engagementText}>{likesCount}</Text>
          </View> */}
          <View style={Ustyles.engagementItem}>
            <Ionicons
              name={
                likedBy.includes(auth.currentUser?.uid ?? "")
                  ? "heart"
                  : "heart-outline"
              }
              size={27}
              color={
                likedBy.includes(auth.currentUser?.uid ?? "") ? "red" : "gray"
              }
              onPress={handleLikePress}
            />
            <Text style={Ustyles.engagementText}>{likesCount}</Text>
          </View>
          <View style={Ustyles.engagementItem}>
            {/* Comment Icon */}
            <Ionicons
              name="chatbox-outline"
              size={27}
              color="gray"
              onPress={handleCommentsPress} // Opens the comment modal
            />
            <Text style={Ustyles.engagementText}>{comments}</Text>

            {/* Modal for adding a comment */}
            <Modal
              visible={commentVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setCommentVisible(false)} // Close modal on back press
            >
              <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.title}>Add a Comment</Text>

                  {/* TextInput for comment */}
                  <TextInput
                    style={styles.textInput}
                    value={newComment}
                    onChangeText={setNewComment} // Updates the comment text
                    placeholder="Type your comment here..."
                    multiline={true} // Allows multiple lines if the comment is long
                  />

                  {/* Submit Comment Button */}
                  <Button title="Submit Comment" onPress={onSubmitComment} />

                  {/* Close Modal Button */}
                  <Button
                    title="Close"
                    onPress={() => setCommentVisible(false)}
                  />
                </View>
              </View>
            </Modal>
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
          <TouchableOpacity
            style={Ustyles.seeNotesButton}
            onPress={handleSeeNotesPress}
          >
            <Text style={Ustyles.seeNotesText}>See Notes</Text>
          </TouchableOpacity>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleCloseModal} // Close on back button press
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>{caption}</Text>
                {/* Add more content as needed */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
            {/* <Text style={Ustyles.subDetailText}>
              20 active minutes + 10 passive minutes
            </Text> */}
          </View>
        </View>
      </View>
      <View style={Ustyles.captionContainer}>
        {/* <Text style={Ustyles.caption}>{caption}</Text> */}
        <Text style={Ustyles.hashtags}>{hashtagNames.join(", ")}</Text>
      </View>
    </View>
  );
};

// Component definition
const Home: React.FC = () => {
  const insets = useSafeAreaInsets();
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
      if (friendsList.length === 0) {
        return;
      }
      const postsRef = collection(db, "Posts");
      console.log(friendsList);
      const q = query(postsRef, where("userId", "in", friendsList));
      const querySnapshot = await getDocs(q);
      console.log(querySnapshot);
      const filteredPosts = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        postID: doc.id,
      }));
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
    const unsubscribe = onSnapshot(
      doc(db, "RemiUsers", user?.uid || ""),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const friendsEmails = userData.friends_list || [];

          if (friendsEmails.length > 0) {
            const q = query(
              collection(db, "RemiUsers"),
              where("email", "in", friendsEmails)
            );
            getDocs(q)
              .then((querySnapshot) => {
                const friendsIds = querySnapshot.docs.map((doc) => doc.id);
                setFriendsList(friendsIds);
              })
              .catch((error) => {
                console.error("Error fetching friend list:", error);
              });
          }
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <SafeAreaView style={Ustyles.background}>
      <View style={Ustyles.background}>
        <ScrollView stickyHeaderIndices={[0]} style={Ustyles.feed}>
          <View
            style={[
              styles.header,
              {
                backgroundColor: "#FFF9E6",
              },
            ]}
          >
            <View style={styles.headerContent}>
              <Text style={styles.logoText}>Remi</Text>
              <TouchableOpacity
                onPress={() => router.push("../../notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={27}
                  color="#0D5F13"
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
          {posts
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            })
            .map((post, index) => (
              <View>
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
                  postID={post.postID}
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

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
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
    borderBottomWidth: 1,
    borderBottomColor: "#BCD5AC",
    position: "relative", // Add this to allow absolute positioning of children
  },
  logoText: {
    fontFamily: "OrelegaOne_400Regular",
    fontSize: 24,
    color: "0D5F13",
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
  commentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0)", // Semi-transparent background
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0D5F13",
    borderRadius: 10,
    elevation: 5, // Shadow for Android
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: "#0D5F13",
    fontFamily: "Nunito_400Regular",
  },
  closeButton: {
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#0D5F13",
    // backgroundColor: "#FFF9E6",
    marginVertical: 5,
  },
  closeButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#0D5F13",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end", // Align the modal at the bottom of the screen
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  textInput: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: "top", // Ensures the text input starts from the top when typing
  },
});

export default Home;
