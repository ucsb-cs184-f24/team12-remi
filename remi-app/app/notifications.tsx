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
    Alert.alert("Confirmation", "Are you sure you want to do this?", [
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
    <View>
      <Text style={Ustyles.header_text}>Pending Friend Requests</Text>
      {friendRequests.length === 0 ? (
        <Text style={Ustyles.header_text}>No pending friend requests.</Text>
      ) : (
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <View style={styles.container}>
                <Avatar
                  rounded
                  source={{
                    uri: "https://i.ytimg.com/vi/gw7xLqpieRc/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AG-B4AC0AWKAgwIABABGH8gRCgdMA8=&rs=AOn4CLCl6hXsf5TzBTBMZv2OfjYMWa4Rng",
                  }}
                  containerStyle={{ marginLeft: 20, marginTop: 50 }}
                />
                <ChatBubble
                  isOwnMessage={false}
                  bubbleColor="#ffffff"
                  tailColor="#ffffff"
                  withTail={false}
                  onPress={() => showConfirmationAlert(item)}
                >
                  <Text>{item.from} wants to add you as a friend.</Text>
                </ChatBubble>
              </View>
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
    flex: 1,
    paddingHorizontal: 0,
  },
  container2: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 1,
    paddingHorizontal: 0,
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
});

export default Notifs;
