import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../firebaseConfig";
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
  Query,
  orderBy,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { RecipePost } from "./(tabs)/home";

const { width } = Dimensions.get("window");
const CONTENT_WIDTH = width * 0.94;

const UserProfileInfo = () => {
  const user = auth.currentUser;
  const { username, isFriendRequest = false } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
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
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const usersRef = collection(db, "RemiUsers");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("User not found");
        } else {
          const userData = querySnapshot.docs[0].data();
          setBio(userData.bio || "");
          setHasBio(!!userData.bio);
          setProfilePic(userData.profilePic || profilePic);
          setFriendCount(userData.friends_list.length || 0);
          setVisibility(userData.visibility || "private");
          setUserEmail(userData.email || "");
          fetchUsername(user.uid);

          const postsQuery = query(
            collection(db, "Posts"),
            where("userId", "==", querySnapshot.docs[0].id),
            orderBy("createdAt", "desc")
          );

          const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
            let newLikesCount = 0;
            snapshot.forEach((doc) => {
              newLikesCount += doc.data().likesCount || 0;
            });
            setLikesCount(newLikesCount);
            setPostCount(snapshot.size);
          });

          setIsPrivate(visibility !== "public");

          if (
            visibility === "public" ||
            userData.friends_list.includes(user_email) ||
            user_email === userData.email
          ) {
            fetchUserPosts(postsQuery);
          } else {
            setPostsText("User's posts are private.");
          }

          setIsFriend(userData.friends_list.includes(user_email));
          setIsMe(user_email === userData.email);

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
    };
    fetchUserProfile();
  }, [username, fadeAnim]);

  const fetchUsername = async (user_id: string) => {
    const usersRef = doc(db, "RemiUsers", user_id);
    const userSnapshot = await getDoc(usersRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      setCurrUsername(userData.username);
    }
  };

  const addFriend = async () => {
    if (!user) return;

    try {
      const notificationsRef = collection(db, "Notifications");
      const existingInviteQuery = query(
        notificationsRef,
        where("from", "==", user.email),
        where("to", "==", userEmail),
        where("read_flag", "==", true)
      );
      const querySnapshot = await getDocs(existingInviteQuery);

      if (!querySnapshot.empty) {
        Alert.alert(
          "Info",
          `You have already sent a friend request to ${username}`
        );
        return;
      }

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
    Alert.alert(
      "Confirm Remove",
      "Are you sure you want to remove this friend?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            deleteFriend();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteFriend = async () => {
    try {
      const currentUserQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", user_email)
      );

      const currentUserSnapshot = await getDocs(currentUserQuery);
      if (!currentUserSnapshot.empty) {
        const currentUserDoc = currentUserSnapshot.docs[0].ref;
        await updateDoc(currentUserDoc, {
          friends_list: arrayRemove(userEmail),
        });
      }

      const friendQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", userEmail)
      );

      const friendSnapshot = await getDocs(friendQuery);
      if (!friendSnapshot.empty) {
        const friendDoc = friendSnapshot.docs[0].ref;
        await updateDoc(friendDoc, {
          friends_list: arrayRemove(user_email),
        });
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
        setUserPosts([]);
        return;
      }

      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(posts);
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

  const renderActionButton = () => {
    if (isFriendRequest || isMe) {
      return null;
    }
    if (!isFriend) {
      return (
        <TouchableOpacity style={styles.addFriendButton} onPress={addFriend}>
          <Ionicons
            name="person-add"
            size={16}
            color="#0D5F13"
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, { color: "#0D5F13" }]}>
            Add Friend
          </Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity style={styles.removeFriendButton} onPress={removeFriend}>
        <Text style={[styles.buttonText, { color: "#871717" }]}>
          Remove Friend
        </Text>
      </TouchableOpacity>
    );
  };

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
          <View style={styles.headerRow}>
            <View style={styles.header1}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#0D5F13" />
              </TouchableOpacity>
              <Text style={styles.username}>{username}</Text>
            </View>
            {renderActionButton()}
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
                        <Text style={styles.statLabel}>{friendCount}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{postCount}</Text>
                        <Text style={styles.statLabel}>{postCount}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{likesCount}</Text>
                        <Text style={styles.statLabel}>{likesCount}</Text>
                      </View>
                    </View>
                  </View>
                  {hasBio && (
                    <View style={styles.bioContainer}>
                      <Text style={styles.bioText}>{bio}</Text>
                    </View>
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
  username: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0D5F13",
    fontFamily: "Nunito_700Bold",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
    marginLeft: 15,
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
    fontSize: 16,
    color: "#0D5F13",
    fontFamily: "Nunito_400Regular",
  },
  bioContainer: {
    backgroundColor: "rgba(188, 213, 172, 0.8)",
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
    fontFamily: "Nunito_400Regular",
  },
  recentActivityTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  buttonIcon: {
    marginRight: 4,
  },
  recentActivityTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D5F13",
    textAlign: "center",
    fontFamily: "Nunito_700Bold",
  },
  recentActivityIcon: {
    marginRight: 8,
  },
  flatListContent: {
    alignItems: "center",
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#0D5F13",
    backgroundColor: "#e0f2d5",
  },
  removeFriendButton: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#871717",
    backgroundColor: "#FFEBEE",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: "Nunito-Bold",
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  headerText: {
    fontFamily: "Nunito_700Bold",
    fontWeight: "bold",
    fontSize: 30,
    color: "#0D5F13",
  },
  header1: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    padding: 5,
  },
});

export default UserProfileInfo;

