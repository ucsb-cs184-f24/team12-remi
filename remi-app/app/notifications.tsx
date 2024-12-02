import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  FlatList,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  writeBatch,
  doc,
  query,
  QuerySnapshot,
  DocumentData,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig"; // Ensure correct imports
import { signOut } from "firebase/auth";
import Ustyles from "../components/UniversalStyles";
import Spacer from "../components/Spacer";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import ChatBubble from "react-native-chat-bubble";
import { Avatar } from "react-native-elements";

const Separator = () => {
  return <View style={{ height: 10 }} />;
};

const Notifs = () => {
  const user = auth.currentUser;
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const notificationsQuery = query(
        collection(db, "Notifications"),
        where("read_flag", "==", true),
        where("to", "in", [user.uid, user.email])
      );

      const unsubscribe = onSnapshot(notificationsQuery, async (snapshot) => {
        const notificationsWithUsernames = await Promise.all(
          snapshot.docs.map(async (document) => {
            const notification = document.data();

            const isFriendRequest = notification.from.includes("@");
            let username = "Unknown User"; // Default username

            if (!isFriendRequest) {
              // Fetch the user document only if not a friend request
              const userRef = doc(db, "RemiUsers", notification.from);
              const userDoc = await getDoc(userRef).catch((error) => {
                console.error("Failed to fetch user document:", error);
                return null; // Handle the promise gracefully on error
              });

              if (userDoc && userDoc.exists()) {
                username = userDoc.data().username;
              } else {
                console.log(
                  "User document does not exist for ID:",
                  notification.from
                );
              }
            } else {
              // Handle friend requests differently if needed
              username = notification.from; // Directly use the email as username for friend requests
            }

            console.log(
              "Fetched username for",
              notification.from,
              ":",
              username
            );

            return {
              id: document.id,
              ...notification,
              fromUsername: username, // Replace user ID with username
              isFriendRequest, // Add flag to the notification object
            };
          })
        );

        console.log("Processed notifications:", notificationsWithUsernames);
        setNotifications(notificationsWithUsernames);
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
        `You have ${accepted ? "accepted" : "rejected"} the ${notification.isFriendRequest ? "friend request" : "notification"}.`
      );
    } catch (error) {
      console.error("Error handling action:", error);
    }
  };

  return (
    <View style={Ustyles.background}>
      <Spacer size={20} />
      {notifications.length === 0 ? (
        <Text style={Ustyles.text}>No notifications.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.container}>
              <Avatar
                size={50}
                rounded
                source={require("../assets/placeholders/user-avatar.png")}
                containerStyle={styles.avatarStyle}
              />

              <View style={styles.chatBubbleContainer}>
                <View style={styles.notifButton}>
                  <Text style={Ustyles.notif_text}>
                    {item.isFriendRequest
                      ? `${item.from} wants to add you as a friend!`
                      : `${item.fromUsername} ${item.action} your post '${item.title}'`}
                  </Text>

                  {item.isFriendRequest && (
                    <View style={styles.container2}>
                      <TouchableOpacity
                        onPress={() => handleAction(item, true)}
                        style={styles.acceptButton}
                      >
                        <Text style={styles.green_text}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleAction(item, false)}
                        style={styles.rejectButton}
                      >
                        <Text style={styles.red_text}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
          ItemSeparatorComponent={Separator}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 0,
  },
  container2: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    flex: 0.8,
    marginTop: 10,
  },
  notifButton: {
    textAlignVertical: "center",
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#0D5F13",
    backgroundColor: "#BCD5AC",
    flexWrap: "wrap",
    width: "90%",
  },
  chatBubble: {
    padding: 10,
  },
  text: {
    color: "black",
  },
  textOwn: {
    color: "white",
  },
  chatBubbleContainer: {
    alignItems: "center",
    paddingRight: 50,
    flex: 1,
  },
  acceptButton: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#0D5F13",
    marginHorizontal: 5,
  },
  rejectButton: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#871717",
    marginHorizontal: 5,
  },
  green_text: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: "#0D5F13",
    alignSelf: "center",
  },
  red_text: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: "#871717",
    alignSelf: "center",
  },
});

export default Notifs;
