import React, { useEffect, useState, useRef, useContext } from "react";
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
  ActivityIndicator,
  Dimensions,
  GestureResponderEvent,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Animated,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // For icons
import { Image as ExpoImage } from "expo-image";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  DocumentData,
  orderBy,
  limit,
  startAfter,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
  deleteDoc,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig"; // Ensure correct imports
import { signOut } from "firebase/auth";
import Ustyles from "../../../components/UniversalStyles";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollResetContext } from "./_layout";
import { LinearGradient } from "expo-linear-gradient";
import { NewPostBanner } from "./components/NewPostBanner";

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
  "0": "Meal Type",
  "1": "Breakfast",
  "2": "Lunch",
  "3": "Dinner",
  "4": "Snacks",
  "5": "Dessert",
  "6": "Beverages",
  "100": "Diet",
  "101": "Vegetarian",
  "102": "Pescatarian",
  "103": "Halal",
  "104": "Vegan",
  "105": "Jain",
  "106": "Gluten-Free",
  "107": "Dairy-Free",
  "108": "Keto",
  "109": "Paleo",
  "110": "Low Carb",
  "200": "Cuisine",
  "201": "Italian",
  "202": "French",
  "203": "Mexican",
  "204": "Japanese",
  "205": "Chinese",
  "206": "Korean",
  "207": "Thai",
  "208": "Malaysian",
  "209": "Vietnamese",
  "210": "Indian",
  "211": "Pakistani",
  "212": "Mediterranean",
  "213": "American",
  "214": "Southern",
  "215": "Middle Eastern",
  "216": "African",
  "217": "Caribbean",
  "218": "Creole",
  "219": "Cajun",
  "300": "Course",
  "301": "Appetizers",
  "302": "Main Course",
  "303": "Side Dish",
};

const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

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
  userHasCommented: boolean;
  handleUnsavePost?: (postID: string) => void; // Add this callback
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: Date | Timestamp;
  username?: string; // Make username optional
  profilePic?: string;
}

interface Notification {
  to: string;
  from: string;
  action: string;
  title: string;
  read_flag: boolean;
  timestamp: Date;
}

const getUserInfo = async (
  userID: string
): Promise<{ username: string; profilePic: string }> => {
  try {
    const userDocRef = doc(db, "RemiUsers", userID);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return {
        username: userData.username || "Unknown User",

        profilePic:
          userData.profilePic || "../../../assets/placeholders/profile-pic.png",
      };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
  return { username: "Unknown User", profilePic: "/placeholder-user.jpg" };
};

export const RecipePost: React.FC<RecipePostProps> = ({
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
  userHasCommented: initialUserHasCommented,
}) => {
  interface LoadingStates {
    [key: string]: boolean;
  }
  const [username, setUsername] = useState<string>("");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [savedBy, setSavedBy] = useState<string[]>([]);
  const [commentVisible, setCommentVisible] = useState(false);
  const [userHasCommented, setUserHasCommented] = useState(
    initialUserHasCommented
  );
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [likesCount, setLikesCount] = useState(likes);
  const [likedBy, setLikedBy] = useState<string[]>([]);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [newComment, setNewComment] = useState("");
  const [commentText, setCommentText] = useState<string>("");
  // const [postComments, setPostComments] = useState<any[]>([]);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  // const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({}); // State to track loading for each post
  const router = useRouter();
  const [commentError, setCommentError] = useState<string | null>(null);
  const modalPosition = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const glimmerOpacity = useRef(new Animated.Value(0)).current;

  if (!postID) {
    console.error("postID is undefined");
    return null; // Or handle the error appropriately
  }

  const postRef = doc(db, "Posts", postID);

  // const handleAddComment = async (commentText: string) => {
  //   if (!commentText.trim()) return;

  //   try {
  //     await addDoc(collection(db, "Comments"), {
  //       postId: postID,
  //       text: commentText,
  //       userId: auth.currentUser?.uid, // Current user's ID
  //       createdAt: new Date(),
  //     });

  //     await updateDoc(postRef, {
  //       comments: commentsCount + 1, // Update the count in the Firestore post document
  //     });
  //     setCommentsCount((prev) => prev + 1);

  //     setUserHasCommented(true);
  //     sendNotification(postRef.userId, "commented", postRef.title);
  //   } catch (error) {
  //     console.error("Error adding comment:", error);
  //   }
  // };
  const handleAddComment = async (commentText: string) => {
    if (!commentText.trim()) return;

    try {
      // First, ensure we get the current post data
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists()) {
        const postData = postSnapshot.data(); // Get the data from the snapshot

        // Add the comment to the "Comments" collection
        await addDoc(collection(db, "Comments"), {
          postId: postID,
          text: commentText,
          userId: auth.currentUser?.uid, // Current user's ID
          createdAt: new Date(),
        });

        // Update the comment count in the post document
        await updateDoc(postRef, {
          comments: postData.comments + 1, // Increment the current comment count
        });
        setCommentsCount((prev) => prev + 1);
        setUserHasCommented(true);

        // Send notification only if the commenter is not the post owner
        if (postData.userId !== auth.currentUser?.uid) {
          sendNotification(postData.userId, "commented", postData.title);
        }
      } else {
        console.error("Post data not found");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // const handleImageLoad = (post_id: string) => {
  //   setLoadingStates((prev) => ({ ...prev, [post_id]: false })); // Mark this post's image as loaded
  //   // console.log("updated state for ", post_id);
  // };

  // Handle image load finish (set loading state to false and remove from states)
  const handleImageLoad = (post_id: string) => {
    setLoadingStates((prev) => {
      const newState = { ...prev };
      delete newState[post_id]; // Remove the post_id from the loading states once the image is loaded
      // console.log(
      //   "image loaded, state set to false and removed from loadingStates for ",
      //   post_id
      // );
      return newState;
    });
  };

  const handleImageError = (post_id: string) => {
    setLoadingStates((prev) => ({ ...prev, [post_id]: false })); // Handle error and stop showing loading symbol
    // console.log("error: updated state for ", post_id);
  };

  const handleImageStartLoad = (post_id: string) => {
    setLoadingStates((prev) => ({ ...prev, [post_id]: true }));
    // console.log("initialized state to true for ", post_id);
  };

  useEffect(() => {
    handleImageStartLoad(postID); // Trigger loading state as true when the component mounts
  }, [postID]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",

      (e) => {
        Animated.timing(modalPosition, {
          toValue: -e.endCoordinates.height,

          duration: 250,

          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",

      () => {
        Animated.timing(modalPosition, {
          toValue: 0,

          duration: 250,

          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();

      keyboardWillHideListener.remove();
    };
  }, [modalPosition]);

  useEffect(() => {
    if (commentVisible) {
      setIsLoadingComments(true);

      setCommentError(null);

      const commentsRef = collection(db, "Comments");

      const commentsQuery = query(
        commentsRef,

        where("postId", "==", postID),

        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        commentsQuery,

        async (snapshot) => {
          try {
            const updatedComments = await Promise.all(
              snapshot.docs.map(async (doc) => {
                const commentData = doc.data() as Omit<
                  Comment,
                  "username" | "id" | "profilePicture"
                >;

                const { username, profilePic } = await getUserInfo(
                  commentData.userId
                );

                return {
                  ...commentData,

                  id: doc.id,

                  username,

                  profilePic,

                  createdAt:
                    commentData.createdAt instanceof Timestamp
                      ? commentData.createdAt.toDate()
                      : commentData.createdAt,
                } as Comment;
              })
            );

            setPostComments(updatedComments);

            setIsLoadingComments(false);
          } catch (error) {
            console.error("Error fetching comments:", error);

            setCommentError("Failed to load comments. Please try again.");

            setIsLoadingComments(false);
          }
        },

        (error) => {
          console.error("Error in comment snapshot listener:", error);

          setCommentError("Failed to load comments. Please try again.");

          setIsLoadingComments(false);
        }
      );

      return () => unsubscribe();
    }
  }, [commentVisible, postID]);

  const handleUnsavePost = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Remove bookmark from Firestore
      const bookmarksRef = collection(db, "Bookmarks");
      const q = query(
        bookmarksRef,
        where("userId", "==", user.uid),
        where("postId", "==", postID)
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      console.log("unbookmarked post with ID ", postID);

      // // Call the callback to update the state in BookmarksPage
      // if (handleUnsavePost) handleUnsavePost(postID);
    } catch (error) {
      console.error("Error unbookmarking post:", error);
    }
  };

  const handleSavePost = async () => {
    // console.log("in handle save post");
    try {
      await addDoc(collection(db, "Bookmarks"), {
        postId: postID,
        userId: auth.currentUser?.uid, // Current user's ID
      });
      console.log("added to Bookmarks");
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const handleSavePress = async () => {
    // console.log("user tryna save");
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to like posts.");
      return;
    }

    const userId = auth.currentUser.uid;

    try {
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        const savedByArray: string[] = postData.savedBy || [];
        // console.log(postID);
        if (savedByArray.includes(userId)) {
          // console.log(postID);
          // console.log("includes userId");
          // console.log("savedBy array looks like this: ", postData.savedBy);
          // User already liked the post, so remove their like
          await updateDoc(postRef, {
            // savesCount: postData.savesCount - 1, // Directly update Firestore
            savedBy: arrayRemove(userId), // Remove user ID
          });
          handleUnsavePost();
        } else {
          // console.log("need to add it");
          // User has not saved the post, so add their save
          await updateDoc(postRef, {
            savedBy: arrayUnion(userId), // Add user ID
          });
          handleSavePost();
        }
        // console.log("local savedBy: ", savedByArray);
        // console.log("updated saved by: ", postData.savedBy);
        // console.log(
        //   "is user in this? ",
        //   savedBy.includes(auth.currentUser?.uid ?? "")
        // );
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
        setCommentsCount(postData.comments || 0); // Ensure comments count is updated
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [postID]);

  // Handle submit logic
  const onSubmitComment = () => {
    if (newComment.trim() === "") return; // Prevent empty comments
    handleAddComment(newComment); // Call parent function to handle comment submission
    setNewComment(""); // Clear the text input
    Keyboard.dismiss();
  };

  const handleSeeNotesPress = () => {
    setModalVisible(true); // Show the modal
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Hide the modal
  };

  // const handleAvatarPress =
  //   (user_name: string) => (event: GestureResponderEvent) => {
  //     console.log("pressed user avatar");
  //     console.log("user_name: ", user_name);
  //     // router.push(`../UserProfileInfo?username=${user_name}`);
  //     router.push(`../UserProfileInfo?${user_name}`);
  //   };

  const handleCommentsPress = () => {
    setCommentVisible(true);
  };

  const handleCloseComments = () => {
    setCommentVisible(false);
    setNewComment("");
  };

  const handleLikePress = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to like posts.");
      return;
    }

    const userId = auth.currentUser.uid;

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

          // Trigger the heart animation with glimmer
          Animated.parallel([
            Animated.sequence([
              Animated.timing(heartScale, {
                toValue: 1.2,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(heartScale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(glimmerOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(glimmerOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
          
          if (postData.userId !== userId) {
            sendNotification(postData.userId, "liked", postData.title);
          }
        }
      }
    } catch (error) {
      console.error("Error updating like:", error);
      Alert.alert("Error", "Failed to update like. Please try again.");
    }
  };

  const sendNotification = async (
    targetUserId: string,
    action: string,
    title: string
  ): Promise<void> => {
    console.log("sendNotification called with:", {
      targetUserId,
      action,
      title,
    });

    // Check if the notification is being sent to the user themselves
    if (auth.currentUser?.uid === targetUserId) {
      console.log("Attempt to send notification to self; aborting.");
      return; // Do not send notification if the user is liking their own post
    }

    console.log(
      `Preparing to send notification to ${targetUserId}: ${action} on '${title}'`
    );

    const newNotification = {
      to: targetUserId,
      from: auth.currentUser?.uid,
      action: action,
      title: title,
      read_flag: true,
      timestamp: new Date(),
    };

    try {
      const docRef = await addDoc(
        collection(db, "Notifications"),
        newNotification
      );
      console.log("Notification sent successfully, doc ID:", docRef.id);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  useEffect(() => {
    const postRef = doc(db, "Posts", postID);

    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const postData = doc.data();
        setLikesCount(postData.likesCount || 0); // Real-time update
        setLikedBy(postData.likedBy || []); // Real-time update of likedBy array
        setSavedBy(postData.savedBy || []);
      }
      // console.log("loading: ", loading);
      // console.log("postID: ", postID);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [postID]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const { username } = await getUserInfo(userID);

        setUsername(username);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, [userID]);

  // useEffect(() => {
  //   setLoading(true);
  // }, [mediaUrl]);

  const hashtagNames = (hashtags ?? "")
    .split(",")
    .map((id) => {
      const name = hashtagMap[id.trim()];
      return name ? `#${name}` : undefined; // Add "#" to the name if it exists
    })
    .filter(Boolean); // Filter out any undefined values
  const handleImagePress = () => {
    setImageModalVisible(true);
  };

  const handleCloseModalTwo = () => {
    setImageModalVisible(false);
  };
  return (
    <View style={Ustyles.post}>
      <View style={Ustyles.postHeader}>
        <View style={Ustyles.userInfo}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(auth)/UserProfileInfo",
                params: { username: username },
              })
            }
          >
            <ExpoImage
              source={require("../../../assets/placeholders/profile-pic.png")}
              style={Ustyles.avatar}
              placeholder={blurhash}
              transition={200}
            />
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(auth)/UserProfileInfo",
                  params: { username: username },
                })
              }
            >
              <Text style={Ustyles.username}>{username}</Text>
            </TouchableOpacity>
            <Text style={Ustyles.timeAgo}>{formatTimeAgo(timeAgo)}</Text>
          </View>
        </View>
        <View style={Ustyles.engagement}>
          <Animated.View
            style={[
              Ustyles.engagementItem,
              { transform: [{ scale: heartScale }] },
            ]}
          >
            <View style={{ position: "relative" }}>
              <TouchableOpacity onPress={handleLikePress}>
                <Ionicons
                  name={
                    likedBy.includes(auth.currentUser?.uid ?? "")
                      ? "heart"
                      : "heart-outline"
                  }
                  size={27}
                  color={
                    likedBy.includes(auth.currentUser?.uid ?? "")
                      ? "red"
                      : "gray"
                  }
                />
              </TouchableOpacity>
              <Animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: glimmerOpacity,
                  transform: [{ scale: 1.5 }], // Scale the sparkles to fit over the heart
                }}
              >
                <Ionicons name="sparkles" size={27} color="gold" />
              </Animated.View>
            </View>
            <Text style={Ustyles.engagementText}>{likesCount}</Text>
          </Animated.View>
          <View style={Ustyles.engagementItem}>
            {/* Comment Icon */}
            <Ionicons
              name={userHasCommented ? "chatbox" : "chatbox-outline"} // Filled icon when user has commented
              size={27}
              color={userHasCommented ? "green" : "gray"} // Filled green when user has commented
              onPress={handleCommentsPress} // Opens the comment modal
            />
            <Text style={Ustyles.engagementText}>{commentsCount}</Text>
          </View>
          <View style={Ustyles.engagementItem}>
            <Ionicons
              name={
                savedBy.includes(auth.currentUser?.uid ?? "")
                  ? "bookmark"
                  : "bookmark-outline"
              }
              size={27}
              color={
                savedBy.includes(auth.currentUser?.uid ?? "")
                  ? "#FBC02D"
                  : "gray"
              }
              onPress={handleSavePress}
            />
          </View>
          {/* Modal for adding a comment */}
          <Modal
            visible={commentVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCloseComments}
          >
            <TouchableWithoutFeedback onPress={handleCloseComments}>
              <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                  <Animated.View
                    style={[
                      styles.commentContainer,
                      { transform: [{ translateY: modalPosition }] },
                    ]} // TODO: figure out why lineargradient not applying to borders
                  >
                    <LinearGradient
                      colors={["#BCD5AC", "#FFF9E6"]}
                      style={styles.gradient_container}
                    >
                      <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
                      >
                        <View style={styles.commentContent}>
                          <View style={styles.header}>
                            <Text style={styles.header_2}>Comments</Text>
                          </View>

                          {isLoadingComments ? (
                            <Text style={Ustyles.text}>
                              Loading comments...
                            </Text>
                          ) : commentError ? (
                            <Text style={Ustyles.text}>{commentError}</Text>
                          ) : (
                            <FlatList
                              data={postComments}
                              keyExtractor={(item) => item.id}
                              renderItem={({ item }) => (
                                <TouchableWithoutFeedback onPress={() => {}}>
                                  <View style={styles.commentItem}>
                                    <Image
                                      source={{ uri: item.profilePic }}
                                      style={Ustyles.avatar}
                                    />
                                    <View style={styles.commentTextContent}>
                                      <View>
                                        <Text style={styles.username}>
                                          {item.username?.trim() ||
                                            "Unknown User"}
                                        </Text>

                                        <Text style={Ustyles.timeAgo}>
                                          {formatTimeAgo(
                                            item.createdAt instanceof Date
                                              ? item.createdAt
                                              : item.createdAt.toDate()
                                          )}
                                        </Text>
                                      </View>

                                      <View>
                                        <Text style={styles.commentText}>
                                          {item.text?.trim() ||
                                            "No comment text available"}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                </TouchableWithoutFeedback>
                              )}
                              ListEmptyComponent={
                                <Text style={styles.emptyComments}>
                                  No comments yet. Be the first!
                                </Text>
                              }
                              contentContainerStyle={styles.commentsList}
                            />
                          )}

                          <View style={styles.inputContainer}>
                            <TextInput
                              style={styles.textInput}
                              value={newComment}
                              onChangeText={setNewComment}
                              placeholder="Add a comment..."
                              placeholderTextColor="#0D5F13"
                              multiline
                            />
                            <TouchableOpacity
                              style={styles.button}
                              onPress={onSubmitComment}
                            >
                              <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </KeyboardAvoidingView>
                    </LinearGradient>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </View>
      <View style={Ustyles.recipeContent}>
        <View style={Ustyles.leftColumn}>
          <TouchableOpacity onPress={handleImagePress}>
            <View style={Ustyles.imageContainer}>
              {loadingStates[postID] && (
                <View style={styles.spinnerContainer}>
                  <ActivityIndicator size="large" color="#0D5F13" />
                </View>
              )}
              <ExpoImage
                source={
                  mediaUrl
                    ? { uri: mediaUrl }
                    : require("../../../assets/placeholders/recipe-image.png")
                }
                style={Ustyles.recipeImage}
                placeholder={blurhash}
                transition={200}
                onLoad={() => handleImageLoad(postID)} // Updates loading state to false
                onError={() => handleImageError(postID)} // Handles errors
              />
            </View>
          </TouchableOpacity>
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
            <View style={styles.notesOverlay}>
              <View style={styles.notesContent}>
                <ImageBackground
                  source={require("../../../assets/images/background-lineart.png")}
                  style={styles.backgroundImage}
                  imageStyle={styles.backgroundImageStyle}
                >
                  {" "}
                  <View style={styles.notesInnerContent}>
                    <Text style={styles.notesHeader}>Chef's Notes:</Text>
                    <ScrollView contentContainerStyle={styles.notesScroll}>
                      <Text style={styles.notesText}>{caption}</Text>
                    </ScrollView>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleCloseModal}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
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
                  { width: `${(price / 100) * 100}%` },
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
          </View>
        </View>
      </View>
      <View style={Ustyles.captionContainer}>
        {/* <Text style={Ustyles.caption}>{caption}</Text> */}
        <Text style={Ustyles.hashtags}>{hashtagNames.join(", ")}</Text>
      </View>
      {imageModalVisible && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={true}
          onRequestClose={handleCloseModalTwo}
        >
          <View style={styles.modalContainer2}>
            <TouchableOpacity
              style={styles.closeButton2}
              onPress={handleCloseModalTwo}
            >
              <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
            <ExpoImage
              source={{ uri: mediaUrl }}
              style={styles.fullScreenImage}
              placeholder={blurhash}
              transition={200}
              contentFit="contain"
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

// Component definition
const Home: React.FC = () => {
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const postsArrRef = useRef<DocumentData[]>([]);
  //record notification count using state
  // const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [notification, setNotification] = useState<
    { id: string; [key: string]: any }[]
  >([]);
  const router = useRouter();
  const friendsList = useRef<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const setResetScroll = useContext(ScrollResetContext);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPostAvail, setNewPostAvail] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const lastCreatedAt = useRef(null);
  const [friendsListChange, setFriendsListChange] = useState(false);
  const POSTS_PER_PAGE = 3;

  const onRefresh = React.useCallback(async () => {
    setNewPostAvail(false);
    setRefreshing(true);
    console.log("Trying to refresh");
    lastCreatedAt.current = null;
    setHasMorePosts(true);
    await fetchPostsWithCommentsFlag();
    setRefreshing(false);
    console.log("Done w refresh");
  }, []);

  const fetchPostsWithCommentsFlag = async (doomScroll = false) => {
    if (loading || loadingMore || !hasMorePosts) return;
    const loadingState = doomScroll ? setLoadingMore : setLoading;

    if (friendsList.current.length == 0) {
      postsArrRef.current = [];
      return;
    }

    loadingState(true);
    const postsRef = collection(db, "Posts");
    let postsQuery = query(
      postsRef,
      where("userId", "in", friendsList.current),
      orderBy("createdAt", "desc"),
      limit(POSTS_PER_PAGE)
    );

    if (doomScroll && lastCreatedAt.current) {
      postsQuery = query(
        postsQuery,
        where("createdAt", "<", lastCreatedAt.current)
      );
    }

    try {
      const querySnapshot = await getDocs(postsQuery);
      const currentUserId = auth.currentUser?.uid;

      const newPosts = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const postData = doc.data();
          const postId = doc.id;

          // Check if the current user has commented on this post
          const commentsRef = collection(db, "Comments");
          const commentsQuery = query(
            commentsRef,
            where("postId", "==", postId),
            where("userId", "==", currentUserId)
          );

          const userHasCommentedSnapshot = await getDocs(commentsQuery);
          const userHasCommented = !userHasCommentedSnapshot.empty;

          return {
            ...postData,
            postID: postId,
            userHasCommented,
          };
        })
      );

      if (doomScroll) {
        postsArrRef.current = [...postsArrRef.current, ...newPosts];
      } else {
        postsArrRef.current = newPosts;
      }

      if (!querySnapshot.empty) {
        const lastCreated = querySnapshot.docs[querySnapshot.docs.length - 1];
        lastCreatedAt.current = lastCreated.data().createdAt;
      }
      setHasMorePosts(querySnapshot.docs.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      loadingState(false);
    }
  };

  useEffect(() => {
    const resetScroll = () => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    };

    if (setResetScroll) {
      setResetScroll(() => resetScroll);
    }
  }, [setResetScroll]);

  // Use `useEffect` to fetch posts when the component mounts, listening for latest post as well
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await fetchPostsWithCommentsFlag();

        if (friendsList.current.length === 0) return;

        const postsRef = collection(db, "Posts");
        const postsQuery = query(
          postsRef,
          where("userId", "in", friendsList.current),
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const latestPostID = querySnapshot.docs[0].id;
            if (
              postsArrRef.current.length > 0 &&
              latestPostID === postsArrRef.current[0].postID
            ) {
              console.log("Up to date on posts.");
              setNewPostAvail(false);
            } else {
              console.log("Can refresh for more.");
              console.log(postsArrRef.current);
              console.log(querySnapshot.docs[0].data());
              setNewPostAvail(true);
            }
          } else {
            console.log("No posts found.");
          }
        });

        return () => unsubscribe();
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [friendsListChange]);

  useEffect(() => {
    const subscribeToFriendsList = async () => {
      if (!user) return;

      const userDocRef = doc(db, "RemiUsers", user.uid);

      const unsubscribe = onSnapshot(
        userDocRef,
        async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            const friendsEmails = userData.friends_list || [];
            if (friendsEmails.length > 0) {
              const q = query(
                collection(db, "RemiUsers"),
                where("email", "in", friendsEmails)
              );
              const friendsSnapshot = await getDocs(q);
              const friendsIds = friendsSnapshot.docs.map((doc) => doc.id);
              friendsList.current = friendsIds;
              setFriendsListChange(!friendsListChange);
              console.log("Updated friendsList:", friendsIds);
            }
          } else {
            console.log("No such document!");
          }
        },
        (error) => {
          console.error("Error listening to document:", error);
        }
      );

      return () => unsubscribe();
    };

    subscribeToFriendsList();
  }, [user]);

  useEffect(() => {
    // Set up real-time listener for notifications
    if (user) {
      const q = query(
        collection(db, "Notifications"),
        where("to", "in", [user.uid, user.email]),
        where("read_flag", "==", true)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotification(requests);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleLoadMore = async () => {
    if (!loading && !loadingMore && hasMorePosts) {
      await fetchPostsWithCommentsFlag(true);
    }
  };

  const handleNewPostsBannerPress = () => {
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    onRefresh();
  };

  return (
    <SafeAreaView style={Ustyles.background} edges={["top"]}>
      <View style={Ustyles.background}>
        <ScrollView
          ref={scrollViewRef}
          stickyHeaderIndices={[0]}
          style={Ustyles.feed}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onMomentumScrollEnd={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;
            const paddingToBottom = layoutMeasurement.height * 0.1;
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={100}
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: "#FFF9E6",
              },
            ]}
          >
            <View style={styles.headerContent}>
              <Text style={styles.logoText}>remi</Text>
              <TouchableOpacity
                onPress={() => router.push("../../notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={27}
                  color="#0D5F13"
                />
                {notification.length > 0 && (
                  <View style={Ustyles.notificationBadge}>
                    <Text style={Ustyles.notificationText}>
                      {notification.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {newPostAvail && (
            <NewPostBanner onPress={handleNewPostsBannerPress} />
          )}
          {postsArrRef.current.map((post, index) => (
            <View key={post.postID}>
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
                userHasCommented={post.userHasCommented}
              />
              <View style={Ustyles.separator} />
            </View>
          ))}
          {loadingMore && (
            <ActivityIndicator
              size="large"
              color="#0D5F13"
              style={{ marginVertical: 20 }}
            />
          )}
        </ScrollView>
        {/* <Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" /> */}
      </View>
    </SafeAreaView>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalContainer2: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  closeButton2: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  gradient_container: {
    flex: 1,
    borderTopLeftRadius: 20, // Match the parent's border radius
    borderTopRightRadius: 20,
    overflow: "hidden", // Clip content to match rounded corners
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
    paddingBottom: 10,
    paddingHorizontal: 16,
    position: "relative", // Add this to allow absolute positioning of children
  },
  logoText: {
    fontFamily: "OrelegaOne_400Regular",
    fontSize: 24,
    color: "#0D5F13",
  },
  iconContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  contentText: {
    fontSize: 16,
  },
  commentContainer: {
    height: "50%",
    backgroundColor: "#BCD5AC", // Background is handled by LinearGradient
    borderTopLeftRadius: 20, // Rounded top-left corner
    borderTopRightRadius: 20, // Rounded top-right corner
    borderColor: "rgba(13,95,19,0.7)", // Border color
    borderWidth: 4, // Border thickness
    borderBottomWidth: 0, // No border at the bottom
    overflow: "hidden", // Ensures child content respects rounded corners
  },
  commentContent: {
    flex: 1,
    padding: 20,
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
  modalContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "rgba(0,0,0,0)",
  },
  notesText: {
    fontSize: 16,
    marginBottom: 20,
    color: "#0D5F13",
    fontFamily: "Nunito_400Regular",
    textAlign: "left",
  },
  notesHeader: {
    fontSize: 24,
    marginBottom: 10,
    color: "#0D5F13",
    fontFamily: "Nunito_700Bold",
    textAlign: "left",
    alignSelf: "center",
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  notesOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  notesContent: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.8,
    backgroundColor: "#FFF9E6",
    borderRadius: 20,
    //padding: 20,
    //alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 3,
    borderColor: "#0D5F13",
  },
  notesInnerContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  notesScroll: {
    flexGrow: 0.8,
    justifyContent: "flex-start",
    //alignItems: "center",
    paddingBottom: 0,
  },
  container: {
    flex: 1,

    backgroundColor: "#fff",
  },
  commentsList: {
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Nunito_700Bold",
  },

  inputContainer: {
    flexDirection: "row",

    alignItems: "center",

    borderTopWidth: 1,

    borderTopColor: "#ddd",

    paddingTop: 10,

    marginTop: 10,

    marginBottom: 20,
  },
  textInput: {
    flex: 1,

    borderWidth: 1,

    borderColor: "#0D5F13",

    borderRadius: 4,

    paddingHorizontal: 15,

    paddingVertical: 8,

    marginRight: 10,

    color: "#0D5F13",

    fontFamily: "Nunito_600SemiBold",
  },
  commentItem: {
    flex: 1,

    marginVertical: 10,
    marginTop: 0,
    paddingBottom: 10,

    borderBottomWidth: 1,

    borderBottomColor: "#BCD5AC",

    flexDirection: "row",
  },
  commentUser: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  commentText: {
    marginTop: 5,

    color: "#0D5F13",

    fontFamily: "Nunito_400Regular",
    fontSize: 17,
    flexWrap: "wrap",
  },
  emptyComments: {
    textAlign: "center",
    marginVertical: 10,
    color: "#666",
  },
  engagementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  engagementText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#555",
  },
  spinnerContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
    alignItems: "center",
    alignSelf: "center",
    zIndex: 1,
  },
  buttonContainer: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-evenly",
  },
  button: {
    backgroundColor: "#0D5F13",

    borderRadius: 20,

    paddingVertical: 8,

    paddingHorizontal: 15,
  },

  buttonText: {
    color: "#FFF",

    fontSize: 15,

    fontWeight: "bold",

    fontFamily: "Nunito_600SemiBold",
  },

  commentTextContent: {
    flex: 1,
    gap: 5,
    marginLeft: 10,
  },
  header_2: {
    fontFamily: "Nunito_700Bold",
    fontSize: 22,
    color: "#0D5F13",
    padding: 0,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
    alignSelf: "center",
  },
  username: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    color: "#0D5F13",
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.2,
  },
});

export default Home;
