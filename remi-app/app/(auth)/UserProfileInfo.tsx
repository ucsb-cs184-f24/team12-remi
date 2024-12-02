import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Switch,
  TextInput,
  Animated,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// import { signOut } from "firebase/auth";
import { auth, db, storage } from "../../firebaseConfig";
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
  deleteDoc,
  arrayRemove,
  Query,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { RecipePost } from "./(tabs)/home";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

const { width, height } = Dimensions.get("window");
const CONTENT_WIDTH = width * 0.94;

const UserProfileInfo = () => {
  const user = auth.currentUser; //This is us right now
  const { username } = useLocalSearchParams(); // Retrieve the username from the URL
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(
    "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [friendCount, setFriendCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [visibility, setVisibility] = useState("private");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [hasBio, setHasBio] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [curr_username, setCurrUsername] = useState("Unknown User");
  const user_email = user?.email;
  const [postsText, setPostsText] = useState("No recent activity found.");
  const [isFriend, setIsFriend] = useState(false);
  const [isMe, setIsMe] = useState(false);
  let content;

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError("");
      setUserInfo(null);
      console.log("fetching user info...");
      try {
        const usersRef = collection(db, "RemiUsers");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("User not found");
        } else {
          const userData = querySnapshot.docs[0].data();
          // console.log(userData);
          setBio(userData.bio || "");
          if (userData.bio) {
            setHasBio(true);
          }
          // console.log(querySnapshot.docs[0].id);
          setProfilePic(userData.profilePic || profilePic);
          setFriendCount(userData.friends_list.length || 0);
          setVisibility(userData.visibility || "private");
          setUserEmail(userData.email || "");
          fetchUsername(user.uid);

          const postsQuery = query(
            collection(db, "Posts"),
            where("userId", "==", querySnapshot.docs[0].id)
          );

          const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
            let newLikesCount = 0;
            snapshot.forEach((doc) => {
              newLikesCount += doc.data().likesCount || 0;
            });
            setLikesCount(newLikesCount);
            setPostCount(snapshot.size);
          });

          if (visibility == "public") {
            setIsPrivate(false);
          }

          if (
            visibility == "public" ||
            userData.friends_list.includes(user_email) ||
            user_email == userData.email // you are the user checking your own profile
          ) {
            fetchUserPosts(postsQuery);
          } else {
            setPostsText("Users's posts are private.");
          }

          if (userData.friends_list.includes(user_email)) {
            // if you're friends
            setIsFriend(true);
          }
          if (user_email == userData.email) {
            setIsMe(true);
          }

          return () => {
            unsubscribePosts();
          };
        }
      } catch (e) {
        setError("An error occurred while fetching user data");
        console.error("Error fetching user profile: ", e);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
      setLoading(false);
    };
    fetchUserProfile();
  }, [username, fadeAnim]);

  const fetchUsername = async (user_id: string) => {
    console.log("fetching username...");
    const usersRef = doc(db, "RemiUsers", user_id);
    const userSnapshot = await getDoc(usersRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      console.log("the username we fetched is: ", userData.username);
      setCurrUsername(userData.username);
    }
    console.log("usersRef: ", usersRef);
  };

  const addFriend = async () => {
    if (!user) return;

    try {
      const notificationsRef = collection(db, "Notifications");
      const existingInviteQuery = query(
        notificationsRef,
        where("from", "==", user.email),
        where("to", "==", user_email),
        where("read_flag", "==", true)
      );
      console.log("user: ", user);

      const querySnapshot = await getDocs(existingInviteQuery);
      console.log("username: ", curr_username);

      if (!querySnapshot.empty) {
        Alert.alert(
          "Info",
          `You have already sent a friend request to ${username}`
        );
        return;
      }
      console.log("user.email: ", user.email);

      await addDoc(notificationsRef, {
        from: user.email,
        to: userEmail,
        read_flag: true,
      });
      Alert.alert("Success", `Friend request sent to ${username}`);
    } catch (error) {
      console.error("Error sending invite:", error);
    }
  };

  const removeFriend = async () => {
    try {
      console.log(
        `Removing friend relationship between ${user_email} and ${userEmail}`
      );

      // Remove friend from current user's `friends_list`
      const currentUserQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", user_email)
      );

      const currentUserSnapshot = await getDocs(currentUserQuery);
      if (!currentUserSnapshot.empty) {
        const currentUserDoc = currentUserSnapshot.docs[0].ref;
        console.log("Current user document reference:", currentUserDoc.path);

        await updateDoc(currentUserDoc, {
          friends_list: arrayRemove(userEmail),
        });
        console.log(
          `Successfully removed ${userEmail} from ${user_email}'s friends_list`
        );
      }

      // Remove current user from friend's `friends_list`
      const friendQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", userEmail)
      );

      const friendSnapshot = await getDocs(friendQuery);
      if (!friendSnapshot.empty) {
        const friendDoc = friendSnapshot.docs[0].ref;
        console.log("Friend document reference:", friendDoc.path);

        await updateDoc(friendDoc, {
          friends_list: arrayRemove(user_email),
        });
        console.log(
          `Successfully removed ${user_email} from ${userEmail}'s friends_list`
        );
      }

      alert("Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Failed to remove friend");
    }
  };

  const fetchUserPosts = async (postsQuery: Query<DocumentData>) => {
    try {
      const querySnapshot = await getDocs(postsQuery);

      if (querySnapshot.empty) {
        console.log("No posts found for this user.");
        setUserPosts([]);
        return;
      }

      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(posts);
      console.log("user posts: ", posts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D5F13" />
      </View>
    );
  }

  if (!isFriend) {
    if (isMe) {
      content = <View></View>;
    } else {
      content = (
        <TouchableOpacity
          style={styles.addFriendButton}
          onPress={() => addFriend()}
        >
          <Text style={styles.addFriendButtonText}>Invite Friend</Text>
        </TouchableOpacity>
      );
    }
  } else {
    // Not friends or yourself
    content = (
      <TouchableOpacity
        style={styles.removeFriendButton}
        onPress={() => removeFriend()}
      >
        <Text style={styles.removeFriendButtonText}>Remove Friend</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={["#FFF9E6", "#BCD5AC"]}
        style={styles.backgroundGradient}
      >
        <ImageBackground
          source={require("../../assets/images/background-lineart.png")}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.header}>
            <Text style={styles.username}>{username}</Text>
            {content}
          </View>

          <FlatList
            data={userPosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.postContainer}>
                <RecipePost
                  postID={item.id}
                  userID={item.userId}
                  timeAgo={new Date(item.createdAt)}
                  mediaUrl={item.mediaUrl}
                  likes={item.likesCount}
                  comments={item.comments}
                  recipeName={item.title || "Untitled"}
                  price={item.Price || 0.0}
                  difficulty={item.Difficulty || 0}
                  time={item.Time || 0}
                  caption={item.caption || ""}
                  hashtags={item.hashtags || ""}
                  userHasCommented={item.userHasCommented || false}
                />
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{postsText}</Text>
            }
            ListHeaderComponent={
              <View>
                <View style={styles.profileSection}>
                  <View style={styles.profileTopSection}>
                    <Image
                      source={{ uri: profilePic }}
                      style={styles.profileImage}
                    />
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{friendCount}</Text>
                        <Text style={styles.statLabel}>friends</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{postCount}</Text>
                        <Text style={styles.statLabel}>posts</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{likesCount}</Text>
                        <Text style={styles.statLabel}>likes</Text>
                      </View>
                    </View>
                  </View>
                  {hasBio ? (
                    <View style={styles.bioContainer}>
                      <Text style={styles.bioText}>{bio}</Text>
                    </View>
                  ) : (
                    <View></View>
                  )}
                </View>
                <View style={styles.recentActivityTitleContainer}>
                  <Ionicons
                    name="file-tray-full-outline"
                    size={24}
                    color="#0D5F13"
                    style={styles.recentActivityIcon}
                  />
                  <Text style={styles.recentActivityTitle}>
                    Recent Activity
                  </Text>
                </View>
              </View>
            }
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            snapToInterval={CONTENT_WIDTH}
            decelerationRate="fast"
            snapToAlignment="center"
          />
        </ImageBackground>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 30,
  },
  username: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0D5F13",
    fontFamily: "Nunito_700Bold",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#0D5F13",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
  },
  postContainer: {
    marginBottom: 20,
    width: CONTENT_WIDTH,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    fontFamily: "Nunito_700Bold",
  },
  profileSection: {
    backgroundColor: "rgba(255, 249, 230, 0.9)",
    borderRadius: 20,
    marginVertical: 5,
    padding: 20,
    width: CONTENT_WIDTH * 0.96,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#FFF9E6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileTopSection: {
    flexDirection: "row",
    marginBottom: 20,
  },
  profileImageContainer: {
    marginRight: 20,
    position: "relative",
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D5F13",
    fontFamily: "Nunito_700Bold",
  },
  statLabel: {
    fontSize: 17,
    color: "#0D5F13",
    // fontFamily: "Nunito_700Bold",
  },
  bioContainer: {
    backgroundColor: "rgba(188, 213, 172, 0.8)",
    borderRadius: 15,
    padding: 15,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
    color: "#333",
    // fontFamily: "Nunito_500Bold",
  },
  recentActivityTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  recentActivityTitle: {
    marginTop: 15,
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D5F13",
    textAlign: "center",
    fontFamily: "Nunito_700Bold",
  },
  recentActivityIcon: {
    marginTop: 15,
    marginRight: 8,
  },
  flatListContent: {
    alignItems: "center",
  },
  addFriendButton: {
    backgroundColor: "rgba(188, 213, 172, 0.8)",
    padding: 8,
    borderRadius: 5,
  },
  addFriendButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  removeFriendButton: {
    backgroundColor: "#FFCCCC",
    padding: 8,
    borderRadius: 5,
  },
  removeFriendButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
});

export default UserProfileInfo;
