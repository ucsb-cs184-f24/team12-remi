import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import Spacer from "../components/Spacer";
import { Avatar } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

interface Notification {
  id: string;
  from: string;
  to: string;
  read_flag: boolean;
  username: string;
  profilePic: string | null;
  isFriendRequest: boolean;
  action?: string;
  title?: string;
}

const Notifs = () => {
  const router = useRouter();
  const user = auth.currentUser;
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
            const notification = document.data() as Notification;
            const isFriendRequest = notification.from.includes("@");
            let userInfo = { username: "Unknown User", profilePic: null };

            if (isFriendRequest) {
              const userQuery = query(
                collection(db, "RemiUsers"),
                where("email", "==", notification.from)
              );
              const userSnapshot = await getDocs(userQuery);
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                userInfo = {
                  username: userData.username || notification.from,
                  profilePic: userData.profilePic,
                };
              }
            } else {
              const userDocRef = doc(db, "RemiUsers", notification.from);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                userInfo = {
                  username: userDoc.data().username,
                  profilePic: userDoc.data().profilePic,
                };
              }
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

  const handleAction = async (notification: Notification, accepted = false) => {
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

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => (
    <View style={[styles.requestContainer, { marginTop: index === 0 ? 20 : 10 }]}>
      <View style={styles.container}>
        <View style={[styles.avatarContainer, { marginTop: item.isFriendRequest ? 0 : 0 }]}>
          <Avatar
            size={55} 
            rounded
            source={{ uri: item.profilePic || undefined }}
            containerStyle={styles.avatar}
          />
        </View>
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
  );

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
          <Spacer size={26} />
          <Ionicons name="arrow-back" size={30} color="#0D5F13" />
        </TouchableOpacity>
        <Spacer size={60} />
        <Text style={styles.headerText}>Notifications</Text>
        {notifications.length === 0 ? (
          <Text style={[styles.noRequestsText]}>No Notifications.</Text>
        ) : (
          <FlatList 
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            contentContainerStyle={styles.notificationList}
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
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },
  requestContainer: {
    marginBottom: 10,
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
    width: "100%",
  },
  chatBubbleContainer: {
    alignItems: "center",
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
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
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
  avatar: {
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
  notificationList: {
    paddingHorizontal: 10,
  },
});

export default Notifs;

