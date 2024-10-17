import { useEffect, useState } from 'react';
import {
	Text,
	View,
	StyleSheet,
	KeyboardAvoidingView,
	TextInput,
	Button,
	ActivityIndicator,
	ImageBackground
} from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebaseConfig';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import { useFonts, OrelegaOne_400Regular } from '@expo-google-fonts/orelega-one';



export default function Index() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const signUp = async () => {
		setLoading(true);
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			alert('Check your emails!');
		} catch (e: any) {
			const err = e as FirebaseError;
			alert('Registration failed: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const signIn = async () => {
		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (e: any) {
			const err = e as FirebaseError;
			alert('Sign in failed: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	let [fontsLoaded] = useFonts({
		OrelegaOne_400Regular,
	});

	if (!fontsLoaded) {
		return <AppLoading />;
	}

	return (
		<View style={styles.background}>
			<ImageBackground source = {require('../assets/images/background-lineart.png')} style={styles.backgroundImage}>
				<View style={styles.container}>
					<ImageBackground source = {require('../assets/images/bg-ellipse.png')} style={{ justifyContent: 'center'}} resizeMode='contain'>
						<Text style={styles.logotext}>
							remi
						</Text>
					</ImageBackground>
					<KeyboardAvoidingView behavior="padding">
						<TextInput
							style={styles.input}
							value={email}
							onChangeText={setEmail}
							autoCapitalize="none"
							keyboardType="email-address"
							placeholderTextColor='#BCD5AC'
							placeholder="Email"
						/>
						<TextInput
							style={styles.input}
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							placeholder="Password"
							placeholderTextColor='#BCD5AC'
						/>

						{loading ? (
							<ActivityIndicator size={'small'} style={{ margin: 28 }} />
						) : (
							<>
								<Button
									onPress={signIn}
									title="Login" 
									color="#0D5F13"
							
								/>
								<Button
									onPress={signUp}
									title="Create account" 
									color="#0D5F13"
								/>
							</>
						)}
					</KeyboardAvoidingView>
				</View>
			</ImageBackground>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 20,
		flex: 1,
		justifyContent: 'space-evenly'
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
	backgroundImage: {
		flex: 1,
		resizeMode: 'contain', // Or 'contain' depending on how you want the image to fit
		justifyContent: 'center',
	},
	background: {
		flex: 1,
		backgroundColor: '#FFF9E6', // Background color behind the ImageBackground
	
	},
	bgimage: {
		flex: 1,
		justifyContent: 'center'
	},
	logotext: {
		fontFamily: 'OrelegaOne_400Regular',
		fontSize: 50,
		lineHeight: 100,
		color: '#0D5F13',
		padding: 0,
		justifyContent: 'center',
		alignSelf: 'center',
		paddingBottom: 10
	  }
});