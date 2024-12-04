// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router"; // Correct imports for routing
// import {
//   collection,
//   query,
//   onSnapshot,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import { db } from "../firebaseConfig"; // Adjust the path based on your project structure

// const Friends = () => {
//   const router = useRouter();
//   const { friendsEmails } = useLocalSearchParams(); // Get params passed from profile.tsx
//   const [friends, setFriends] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!friendsEmails) {
//       // console.log("No friendsEmails provided.");
//       setFriends([]);
//       setLoading(false);
//       return;
//     }

//     const emails =
//       typeof friendsEmails === "string"
//         ? friendsEmails.split(",").map((email) => email.trim())
//         : friendsEmails;

//     // console.log("Emails to query:", emails);

//     const q = query(
//       collection(db, "RemiUsers"),
//       where("email", "in", emails) // Query users with emails in the list
//     );

//     // Set up real-time listener
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const friendsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       // console.log("Real-time fetched friends:", friendsData);
//       setFriends(friendsData);
//       setLoading(false);
//     });

//     return () => unsubscribe(); // Cleanup listener on unmount
//   }, [friendsEmails]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0D5F13" />
//       </View>
//     );
//   }

//   if (friends.length === 0) {
//     return (
//       <View style={styles.noFriendsContainer}>
//         <Text style={styles.noFriendsText}>No friends found</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Friends List */}
//       <FlatList
//         data={friends}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.friendItem}>
//             <Image
//               source={
//                 item.profilePic
//                   ? { uri: item.profilePic }
//                   : require("../assets/placeholders/user-avatar.png") // Adjust the path as per your project structure
//               }
//               style={styles.profilePic}
//             />
//             <View style={styles.friendInfo}>
//               <Text style={styles.friendName}>
//                 {item.username || "No Name"}
//               </Text>
//               <Text style={styles.friendEmail}>{item.email || "No Email"}</Text>
//             </View>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFF9E6",
//     padding: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   noFriendsContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   noFriendsText: {
//     fontSize: 16,
//     color: "#666",
//   },
//   friendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#DDD",
//     paddingBottom: 8,
//   },
//   profilePic: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 16,
//   },
//   friendInfo: {
//     flex: 1,
//   },
//   friendName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   friendEmail: {
//     fontSize: 14,
//     color: "#666",
//   },
// });

// export default Friends;

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router"; // Correct imports for routing
// import {
//   collection,
//   query,
//   onSnapshot,
//   where,
//   getDocs,
//   updateDoc,
//   arrayRemove,
//   doc,
// } from "firebase/firestore";
// import { db, auth } from "../firebaseConfig"; // Adjust the path based on your project structure
// import { onAuthStateChanged } from "firebase/auth";

// const Friends = () => {
//   const router = useRouter();
//   const { friendsEmails } = useLocalSearchParams(); // Get params passed from profile.tsx
//   const [friends, setFriends] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   useEffect(() => {
//     // Fetch current userId using onAuthStateChanged for reliability
//     const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setCurrentUserId(user.uid);
//       } else {
//         setCurrentUserId(null);
//         router.replace("/"); // Redirect to login if unauthenticated
//       }
//     });

//     return () => unsubscribeAuth(); // Cleanup listener
//   }, []);

//   useEffect(() => {
//     if (!friendsEmails) {
//       setFriends([]);
//       setLoading(false);
//       return;
//     }

//     const emails =
//       typeof friendsEmails === "string"
//         ? friendsEmails.split(",").map((email) => email.trim())
//         : friendsEmails;

//     const q = query(
//       collection(db, "RemiUsers"),
//       where("email", "in", emails) // Query users with emails in the list
//     );

//     // Set up real-time listener
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const friendsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setFriends(friendsData);
//       setLoading(false);
//     });

//     return () => unsubscribe(); // Cleanup listener on unmount
//   }, [friendsEmails]);

//   const removeFriend = async (friendEmail: string) => {
//     const currentUserEmail = auth.currentUser?.email;
//     if (!currentUserEmail) {
//       console.error("Current user email not available");
//       return;
//     }

//     try {
//       console.log(
//         `Attempting to remove friend relationship between ${currentUserEmail} and ${friendEmail}`
//       );

//       // Remove friend from current user's `friends_list`
//       const currentUserRef = query(
//         collection(db, "RemiUsers"),
//         where("email", "==", currentUserEmail)
//       );

//       const currentUserSnapshot = await getDocs(currentUserRef);
//       if (!currentUserSnapshot.empty) {
//         const currentUserDoc = currentUserSnapshot.docs[0].ref;
//         console.log("Current user document reference:", currentUserDoc.path);

//         await updateDoc(currentUserDoc, {
//           friends_list: arrayRemove(friendEmail),
//         });
//         console.log(
//           `Successfully removed ${friendEmail} from ${currentUserEmail}'s friends_list`
//         );
//       } else {
//         console.error("Current user document not found");
//       }

//       // Remove current user from friend's `friends_list`
//       const friendUserRef = query(
//         collection(db, "RemiUsers"),
//         where("email", "==", friendEmail)
//       );

//       const friendUserSnapshot = await getDocs(friendUserRef);
//       if (!friendUserSnapshot.empty) {
//         const friendUserDoc = friendUserSnapshot.docs[0].ref;
//         console.log("Friend user document reference:", friendUserDoc.path);

//         await updateDoc(friendUserDoc, {
//           friends_list: arrayRemove(currentUserEmail),
//         });
//         console.log(
//           `Successfully removed ${currentUserEmail} from ${friendEmail}'s friends_list`
//         );
//       } else {
//         console.error("Friend user document not found");
//       }

//       alert("Friend removed successfully");
//     } catch (error) {
//       console.error("Error removing friend:", error);
//       alert("Failed to remove friend");
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0D5F13" />
//       </View>
//     );
//   }

//   if (friends.length === 0) {
//     return (
//       <View style={styles.noFriendsContainer}>
//         <Text style={styles.noFriendsText}>No friends found</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={friends}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.friendItem}>
//             <Image
//               source={
//                 item.profilePic
//                   ? { uri: item.profilePic }
//                   : require("../assets/placeholders/user-avatar.png") // Adjust the path as per your project structure
//               }
//               style={styles.profilePic}
//             />
//             <View style={styles.friendInfo}>
//               <Text style={styles.friendName}>
//                 {item.username || "No Name"}
//               </Text>
//               <Text style={styles.friendEmail}>{item.email || "No Email"}</Text>
//             </View>
//             {/* Add the Remove Button */}
//             <TouchableOpacity
//               style={styles.removeButton}
//               onPress={() => removeFriend(item.email)} // Pass the correct email
//             >
//               <Text style={styles.removeButtonText}>Remove</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFF9E6",
//     padding: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   noFriendsContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   noFriendsText: {
//     fontSize: 16,
//     color: "#666",
//   },
//   friendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#DDD",
//     paddingBottom: 8,
//   },
//   profilePic: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 16,
//   },
//   friendInfo: {
//     flex: 1,
//   },
//   friendName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   friendEmail: {
//     fontSize: 14,
//     color: "#666",
//   },
//   removeButton: {
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     backgroundColor: "#FF4D4D",
//     borderRadius: 5,
//   },
//   removeButtonText: {
//     color: "#FFF",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
// });

// export default Friends;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; // Correct imports for routing
import {
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  updateDoc,
  arrayRemove,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig"; // Adjust the path based on your project structure

export const Friends = () => {
  const router = useRouter();
  const { friendsEmails } = useLocalSearchParams(); // Get params passed from profile.tsx
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserEmailTwo = auth.currentUser?.email;

  useEffect(() => {
    const currentUserEmail = auth.currentUser?.email;

    if (!currentUserEmail) {
      console.error("Current user email not available");
      setFriends([]);
      setLoading(false);
      return;
    }

    console.log("Setting up real-time listener for friends list");

    // Listen for changes to the current user's `friends_list`
    const currentUserQuery = query(
      collection(db, "RemiUsers"),
      where("email", "==", currentUserEmail)
    );

    const unsubscribe = onSnapshot(currentUserQuery, (snapshot) => {
      if (snapshot.empty) {
        console.log("No matching user found in Firestore");
        setFriends([]);
        setLoading(false);
        return;
      }

      const currentUserDoc = snapshot.docs[0];
      const userData = currentUserDoc.data();
      const friendsList = userData.friends_list || [];
      console.log("Real-time updated friends list:", friendsList);

      if (friendsList.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Query the `RemiUsers` collection to fetch friend details
      const friendsQuery = query(
        collection(db, "RemiUsers"),
        where("email", "in", friendsList) // Query users based on the updated `friends_list`
      );

      getDocs(friendsQuery)
        .then((friendsSnapshot) => {
          const friendsData = friendsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Real-time fetched friends data:", friendsData);
          setFriends(friendsData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching friends data:", error);
          setLoading(false);
        });
    });

    return () => {
      console.log("Cleaning up real-time listener");
      unsubscribe(); // Cleanup the listener on unmount
    };
  }, []);

  const removeFriend = async (friendEmail: string) => {
    const currentUserEmail = auth.currentUser?.email;

    if (!currentUserEmail) {
      console.error("Current user email not available");
      return;
    }

    try {
      console.log(
        `Removing friend relationship between ${currentUserEmail} and ${friendEmail}`
      );

      // Remove friend from current user's `friends_list`
      const currentUserQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", currentUserEmail)
      );

      const currentUserSnapshot = await getDocs(currentUserQuery);
      if (!currentUserSnapshot.empty) {
        const currentUserDoc = currentUserSnapshot.docs[0].ref;
        console.log("Current user document reference:", currentUserDoc.path);

        await updateDoc(currentUserDoc, {
          friends_list: arrayRemove(friendEmail),
        });
        console.log(
          `Successfully removed ${friendEmail} from ${currentUserEmail}'s friends_list`
        );
      }

      // Remove current user from friend's `friends_list`
      const friendQuery = query(
        collection(db, "RemiUsers"),
        where("email", "==", friendEmail)
      );

      const friendSnapshot = await getDocs(friendQuery);
      if (!friendSnapshot.empty) {
        const friendDoc = friendSnapshot.docs[0].ref;
        console.log("Friend document reference:", friendDoc.path);

        await updateDoc(friendDoc, {
          friends_list: arrayRemove(currentUserEmail),
        });
        console.log(
          `Successfully removed ${currentUserEmail} from ${friendEmail}'s friends_list`
        );
      }

      alert("Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Failed to remove friend");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D5F13" />
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View style={styles.noFriendsContainer}>
        <Text style={styles.noFriendsText}>No friends found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Friends List */}
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(auth)/UserProfileInfo",
                  params: { username: item.username },
                })
              }
            >
              <Image
                source={
                  item.profilePic
                    ? { uri: item.profilePic }
                    : require("../assets/placeholders/user-avatar.png") // Adjust the path as per your project structure
                }
                style={styles.profilePic}
              />
            </TouchableOpacity>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>
                {item.username || "No Name"}
              </Text>
              <Text style={styles.friendEmail}>{item.email || "No Email"}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFriend(item.email)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noFriendsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noFriendsText: {
    fontSize: 16,
    color: "#666",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    paddingBottom: 8,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  friendEmail: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    backgroundColor: "#FFCCCC",
    padding: 8,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
});

export default Friends;
