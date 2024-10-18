// import {
// 	Text,
// 	View,
// 	StyleSheet,
// 	Button,
// 	ImageBackground
// } from 'react-native';
// import {signOut} from 'firebase/auth';
// import {auth} from '../../../firebaseConfig';
// import Ustyles from '../../../components/UniversalStyles';
// import Spacer from '../../../components/Spacer'

// const Page = () => {
// 	const user = auth.currentUser;

// 	return (
// 		<View style={Ustyles.background}>
// 			<Spacer size={80}/>
// 			<Text style={styles.text}>
// 				Welcome to home
// 			</Text>
// 			<Text style={Ustyles.logotext}>
// 				remi
// 			</Text>
// 			<Text style={styles.text}>
// 				{user?.email}
// 			</Text>
// 			<Spacer size={50}/>
// 			<Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" />
// 		</View>
// 	);
// };

// const styles = StyleSheet.create({
// 	container: {
// 		marginHorizontal: 20,
// 		flex: 1,
// 		justifyContent: 'space-evenly'
// 	},
// 	input: {
// 		marginVertical: 4,
// 		height: 50,
// 		borderWidth: 2,
// 		borderRadius: 4,
// 		padding: 10,
// 		backgroundColor: '#fff',
// 		borderColor: '#0D5F13',

// 	},
// 	text: {
// 		fontFamily: 'Roboto',
// 		fontSize: 20,
// 		lineHeight: 0,
// 		color: '#0D5F13',
// 		paddingTop: 0,
// 		justifyContent: 'center',
// 		alignSelf: 'center',
// 		paddingBottom: 0,
		
// 	}
// });


// export default Page;
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebaseConfig'; // Ensure correct imports
import { signOut } from 'firebase/auth';
import Ustyles from '../../../components/UniversalStyles';
import Spacer from '../../../components/Spacer';

// Component definition
const Page: React.FC = () => {
  const user = auth.currentUser;

  // Add a post with hardcoded data
  const addPost = async () => {
    try {
      const postRef = collection(db, 'Posts');
      await addDoc(postRef, {
        userId: user?.uid || 'guest123',
        mediaUrl: 'https://cdn.com/post.jpg',
        caption: 'Enjoying the sunset!',
        hashtags: ['#sunset', '#photography'],
        likesCount: 0,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Post added successfully!');
    } catch (error) {
      // Type guard to handle unknown errors properly
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to add post: ${error.message}`);
      } else {
        Alert.alert('Error', 'An unknown error occurred.');
      }
    }
  };

  return (
    <View style={Ustyles.background}>
      <Spacer size={80} />
      <Text style={styles.text}>Welcome to home</Text>
      <Text style={Ustyles.logotext}>remi</Text>
      <Text style={styles.text}>{user?.email}</Text>
      <Spacer size={50} />
      <Button title="Add Post" onPress={addPost} color="#0D5F13" />
      <Spacer size={20} />
      <Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'space-evenly',
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#0D5F13',
  },
  text: {
    fontFamily: 'Roboto',
    fontSize: 20,
    color: '#0D5F13',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default Page;
