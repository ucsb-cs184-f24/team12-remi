// import {
// 	Text,
// 	View,
// 	StyleSheet,
// 	Button,
// 	ImageBackground
// } from 'react-native';
// import {signOut} from 'firebase/auth';
// import {auth} from '../../firebaseConfig';
// import Ustyles from '../../components/UniversalStyles';
// import Spacer from '../../components/Spacer'

// const Page = () => {
// 	const user = auth.currentUser;

// 	return (
// 		<View style={Ustyles.background}>
// 			<Spacer size={20}/>
// 			<Text style={styles.text}>
// 				Welcome page Welcome 
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

import {
	Text,
	View,
	StyleSheet,
	Button,
	ImageBackground
} from 'react-native';
import {signOut} from 'firebase/auth';
import Ustyles from '../../components/UniversalStyles';
import Spacer from '../../components/Spacer'

const Page = () => {
	const user = auth.currentUser;
}

import React, { useState } from 'react';
import {TextInput, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../../firebaseConfig'; // Assuming you have set up Firestore in firebaseConfig
import { doc, setDoc } from 'firebase/firestore';

export default function Welcome() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user info (username) in Firestore
      await setDoc(doc(db, 'RemiUsers', user.uid), {
        username: username,
        email: email
      });

      alert('Account created successfully!');
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor='#BCD5AC'
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor='#BCD5AC'
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor='#BCD5AC'
      />

      {loading ? (
        <ActivityIndicator size={'small'} style={{ margin: 28 }} />
      ) : (
        <Button title="Create Account" onPress={signUp} color="#0D5F13" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center'
  },
  input: {
    marginVertical: 10,
    height: 50,
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#0D5F13',
  }
});

// export default Welcome;
