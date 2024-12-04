import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  PanResponder,
  Animated,
  ImageBackground,
} from "react-native";
import {
  collection,
  getDocs,
  getDoc,
  writeBatch,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import Ustyles from "../components/UniversalStyles";
import Spacer from "../components/Spacer";
import { Avatar } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Define the type for FriendRequest
interface FriendRequest {
  id: string;
  from: string;
  to: string;
  read_flag: boolean;
  username: string;
  profilePic: string | null;
}

const Separator = () => {
  return <View style={{ height: 10 }} />;
};

const Notifs = () => {
  const router = useRouter();
  const user = auth.currentUser;
  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
    onPanResponderGrant: () => {
      let xValue = 0;

      // Access the current animated value using addListener
      const listenerId = pan.x.addListener((value) => {
        xValue = value.value;
      });

      pan.setOffset({
        x: xValue,
        y: 0,
      });

      // Clean up the listener
      pan.x.removeListener(listenerId);
    },
  });

  const getUserInfo = async (email) => {
    const q = query(collection(db, "RemiUsers"), where("email", "==", email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return {
        username: userDoc.data().username,
        profilePic: userDoc.data().profilePic,
      };
    }
    return { username: "Unknown User", profilePic: null };
  };

  useEffect(() => {
    if (user) {
      const notificationsQuery = query(
        collection(db, "Notifications"),
        where("to", "in", [user.uid, user.email]),
        where("read_flag", "==", true)
      );

      const unsubscribe = onSnapshot(notificationsQuery, async (snapshot) => {
        const notificationsWithDetails = await Promise.all(
          snapshot.docs.map(async (document) => {
            const notification = document.data();
            const isFriendRequest = notification.from.includes("@");
            let userInfo = { username: "Unknown User", profilePic: null };

            if (!isFriendRequest) {
              // Fetch user info for non-friend request notifications
              const userDocRef = doc(db, "RemiUsers", notification.from);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                userInfo = {
                  username: userDoc.data().username,
                  profilePic: userDoc.data().profilePic,
                };
              }
            } else {
              // Friend requests use email directly
              userInfo.username = notification.from;
            }

            return {
              id: document.id,
              ...notification,
              ...userInfo,
              isFriendRequest,
            };
          })
        );

        setNotifications(notificationsWithDetails);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleAction = async (notification, accepted = false) => {
    try {
      if (notification.isFriendRequest && accepted) {
        const senderRef = query(
          collection(db, "RemiUsers"),
          where("email", "==", notification.from)
        );
        const receiverRef = doc(db, "RemiUsers", user.uid);

        const senderSnapshot = await getDocs(senderRef);
        senderSnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            friends_list: arrayUnion(user.email),
          });
        });

        await updateDoc(receiverRef, {
          friends_list: arrayUnion(notification.from),
        });
      }

      await updateDoc(doc(db, "Notifications", notification.id), {
        read_flag: false,
      });

      Alert.alert(
        accepted ? "Accepted" : "Rejected",
        `You have ${accepted ? "accepted" : "rejected"} the ${
          notification.isFriendRequest ? "friend request" : "notification"
        }.`
      );
    } catch (error) {
      console.error("Error handling action:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#FFF9E6", "#FFF9E6"]}
      style={styles.backgroundGradient}
    >
      <ImageBackground
        source={require("../assets/images/background-lineart.png")}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={30} color="#0D5F13" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notifications</Text>
        {notifications.length === 0 ? (
          <Text style={[styles.noRequestsText]}>No notifications.</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.requestContainer}>
                <View style={styles.container}>
                  <Animated.View
                    style={{
                      transform: [{ translateX: pan.x }],
                    }}
                    {...panResponder.panHandlers}
                  >
                    <Avatar
                      size={55}
                      rounded
                      source={{ uri: item.profilePic || undefined }}
                      containerStyle={styles.avatar}
                    />
                  </Animated.View>
                  <View style={styles.chatBubbleContainer}>
                    <View style={styles.notifButton}>
                      <Text style={styles.notifText}>
                        {item.isFriendRequest
                          ? `${item.username} wants to add you as a friend!`
                          : `${item.username} ${item.action} your post '${item.title}'`}
                      </Text>
                    </View>
                    {item.isFriendRequest && (
                      <View style={styles.actionContainer}>
                        <TouchableOpacity
                          onPress={() => handleAction(item, true)}
                          style={styles.acceptButton}
                        >
                          <Text style={styles.acceptText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleAction(item, false)}
                          style={styles.rejectButton}
                        >
                          <Text style={styles.rejectText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </ImageBackground>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0D5F13",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Nunito-Bold",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  requestContainer: {
    marginBottom: 20,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
  },
  notifButton: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#0D5F13",
    backgroundColor: "#BCD5AC",
    width: "90%",
  },
  chatBubbleContainer: {
    alignItems: "center",
    flex: 1,
    paddingRight: 50, 
  },
  acceptButton: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#0D5F13",
    backgroundColor: "#E8F5E9",
  },
  rejectButton: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#871717",
    backgroundColor: "#FFEBEE",
  },
  notifText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "#0D5F13",
    textAlign: "center",
  },
  acceptText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "#0D5F13",
    alignSelf: "center",
  },
  rejectText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "#871717",
    alignSelf: "center",
  },
  avatar: {
    marginRight: -2,
    marginLeft: 15,
    marginTop: -50,
    borderWidth: 3,
    borderColor: "#0D5F13",
  },
  noRequestsText: {
    textAlign: "center",
    marginTop: 20,
    color: "#0D5F13",
  },
  backgroundGradient: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 25,
    zIndex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.25,
  },
});


export default Notifs;
