import React, { useEffect, useState, useRef } from "react";
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
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";
import { signOut } from "firebase/auth";
import Ustyles from "../../../components/UniversalStyles";
import Spacer from "../../../components/Spacer";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

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
  userHasCommented: boolean;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: Date;
  username?: string;
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
  const [username, setUsername] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [likesCount, setLikesCount] = useState(likes);
  const [likedBy, setLikedBy] = useState<string[]>([]);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [newComment, setNewComment] = useState("");
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [userHasCommented, setUserHasCommented] = useState(
    initialUserHasCommented
  );
  const modalPosition = useRef(new Animated.Value(0)).current;

  const postRef = doc(db, "Posts", postID);

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
      const commentsRef = collection(db, "Comments");
      const commentsQuery = query(
        commentsRef,
        where("postId", "==", postID),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(commentsQuery, async (snapshot) => {
        const updatedComments = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const commentData = doc.data() as Omit<Comment, "username" | "id">;
            const username = await getUsername(commentData.userId);
            return {
              ...commentData,
              id: doc.id,
              username,
            } as Comment;
          })
        );
        setPostComments(updatedComments);
      });

      return () => unsubscribe();
    }
  }, [commentVisible, postID]);

  const fetchComments = async () => {
    try {
      const commentsRef = collection(db, "Comments");
      const commentsQuery = query(commentsRef, where("postId", "==", postID));
      const querySnapshot = await getDocs(commentsQuery);

      const mappedComments: Comment[] = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const commentData = doc.data() as Omit<Comment, "username" | "id">;
          const username = await getUsername(commentData.userId);
          return {
            ...commentData,
            id: doc.id,
            username,
          } as Comment;
        })
      );

      setPostComments(mappedComments);
    } catch (error) {
      console.error("Error fetching comments with usernames:", error);
    }
  };

  const handleAddComment = async (commentText: string) => {
    if (!commentText.trim()) return;

    try {
      await addDoc(collection(db, "Comments"), {
        postId: postID,
        text: commentText,
        userId: auth.currentUser?.uid,
        createdAt: new Date(),
      });

      await updateDoc(postRef, {
        comments: commentsCount + 1,
      });

      setCommentsCount((prev) => prev + 1);
      setUserHasCommented(true);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    const postRef = doc(db, "Posts", postID);

    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const postData = doc.data();
        setCommentsCount(postData.comments || 0);
      }
    });

    return () => unsubscribe();
  }, [postID]);

  const onSubmitComment = () => {
    if (newComment.trim() === "") return;
    handleAddComment(newComment);
    setNewComment("");
    Keyboard.dismiss();
  };

  const handleSeeNotesPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

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
          await updateDoc(postRef, {
            likesCount: postData.likesCount - 1,
            likedBy: arrayRemove(userId),
          });
        } else {
          await updateDoc(postRef, {
            likesCount: postData.likesCount + 1,
            likedBy: arrayUnion(userId),
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
        setLikesCount(postData.likesCount || 0);
        setLikedBy(postData.likedBy || []);
      }
    });

    return () => unsubscribe();
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
      return name ? `#${name}` : undefined;
    })
    .filter(Boolean);

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
            <Ionicons
              name={userHasCommented ? "chatbox" : "chatbox-outline"}
              size={27}
              color={userHasCommented ? "green" : "gray"}
              onPress={handleCommentsPress}
            />
            <Text style={Ustyles.engagementText}>{commentsCount}</Text>

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
                      ]}
                    >
                      <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
                      >
                        <View style={styles.header}>
                          <Text style={styles.title}>Comments</Text>
                        </View>

                        <FlatList
                          data={postComments}
                          keyExtractor={(item) => item.id}
                          renderItem={({ item }) => (
                            <TouchableWithoutFeedback onPress={() => {}}>
                              <View style={styles.commentItem}>
                                <Text style={styles.commentText}>
                                  {item.username?.trim() || "Unknown User"}
                                </Text>
                                <Text style={Ustyles.detailText}>
                                  {item.text?.trim() ||
                                    "No comment text available"}
                                </Text>
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

                        <View style={styles.inputContainer}>
                          <TextInput
                            style={styles.textInput}
                            value={newComment}
                            onChangeText={setNewComment}
                            placeholder="Add a comment..."
                            placeholderTextColor="#BCD5AC"
                            multiline
                          />
                          <TouchableOpacity
                            style={styles.button}
                            onPress={onSubmitComment}
                          >
                            <Text style={styles.buttonText}>Submit</Text>
                          </TouchableOpacity>
                        </View>
                      </KeyboardAvoidingView>
                    </Animated.View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
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
            onRequestClose={handleCloseModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>{caption}</Text>
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
          </View>
        </View>
      </View>
      <View style={Ustyles.captionContainer}>
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
  useEffect(() => {
    if (friendsList.length === 0) return;

    const fetchPostsWithCommentsFlag = async () => {
      const postsRef = collection(db, "Posts");
      const postsQuery = query(postsRef, where("userId", "in", friendsList));

      const querySnapshot = await getDocs(postsQuery);
      const currentUserId = auth.currentUser?.uid;

      const postsWithCommentsFlag = await Promise.all(
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

      setPosts(postsWithCommentsFlag);
    };

    fetchPostsWithCommentsFlag();
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
    <SafeAreaView style={Ustyles.background} edges={["top"]}>
      <ScrollView stickyHeaderIndices={[0]}>
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
                userHasCommented={post.userHasCommented}
              />
              <View style={Ustyles.separator} />
            </View>
          ))}
      </ScrollView>
      {/* <Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" /> */}
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
    color: "#0D5F13",
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
    borderBottomColor: "#BCD5AC",
  },
  contentText: {
    fontSize: 16,
  },
  commentContainer: {
    height: "50%",
    backgroundColor: "#FFF9E6",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderColor: "rgba(13,95,19,0.7)",
    borderWidth: 4,
    borderBottomWidth: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0)",
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0)",
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
  },
  commentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#BCD5AC",
  },
  commentUser: {
    fontWeight: "bold",
  },
  commentText: {
    marginTop: 5,
    color: "#0D5F13",
    fontFamily: "Nunito_400Regular",
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
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  engagementText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#555",
  },
  button: {
    backgroundColor: "#0D5F13",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: "#FFF9E6",
    fontWeight: "bold",
  },
});

export default Home;
