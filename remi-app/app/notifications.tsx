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

const Notifs = () => {
  const user = auth.currentUser;
  const [friendRequests, setFriendRequests] = useState([]); // Friend requests data
  const router = useRouter();

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

  const handleAccept = async (request) => {
    const senderEmail = request.from;
    const receiverEmail = user?.email;

    try {
      const senderRef = query(
        collection(db, "RemiUsers"),
        where("email", "==", senderEmail)
      );
      const receiverRef = doc(db, "RemiUsers", user?.uid);

      const snapshot = await getDocs(senderRef);
      snapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          friends_list: arrayUnion(receiverEmail),
        });
      });

      await updateDoc(receiverRef, {
        friends_list: arrayUnion(senderEmail),
      });

      await updateDoc(doc(db, "Notifications", request.id), {
        read_flag: false,
      });

      Alert.alert("Success", `You are now friends with ${senderEmail}`);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleReject = async (request) => {
    try {
      await updateDoc(doc(db, "Notifications", request.id), {
        read_flag: false,
      });
      Alert.alert("Friend Request Rejected");
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const showConfirmationAlert = async (request) => {
    Alert.alert("Confirmation", "Accept friend request?", [
      {
        text: "Yes",
        onPress: () => handleAccept(request),
      },
      {
        text: "No",
        onPress: () => handleReject(request),
      },
    ]);
  };

  return (
    <View style={Ustyles.background}>
      <Spacer size={20} />
      <Text style={Ustyles.header}>Pending Friend Requests</Text>
      <Spacer size={20} />
      {friendRequests.length === 0 ? (
        <Text style={Ustyles.text}>No friend requests.</Text>
      ) : (
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <View style={styles.container}>
                <Avatar
                  size={50}
                  rounded
                  source={require("../assets/placeholders/user-avatar.png")}
                  containerStyle={{
                    marginLeft: 20,
                    marginRight: 10,
                    marginTop: 5,
                    borderWidth: 3,
                    borderColor: "#0D5F13",
                  }}
                />
                <View style={styles.chatBubbleContainer}>
                  <View style={styles.notifButton}>
                    <Text style={Ustyles.notif_text}>
                      {item.from} wants to add you as a friend!
                    </Text>
                  </View>

                  <View style={styles.container2}>
                    <TouchableOpacity
                      onPress={() => handleAccept(item)}
                      style={styles.acceptButton}
                    >
                      <Text style={styles.green_text}>Accept</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleReject(item)}
                      style={styles.rejectButton}
                    >
                      <Text style={styles.red_text}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <Spacer size={40} />
            </View>
          )}
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
    paddingHorizontal: 15,
    paddingVertical: 15,
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
    //paddingBottom: 0,
  },
  red_text: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: "#871717",
    alignSelf: "center",
    //paddingBottom: 0,
  },
});

export default Notifs;
