import { useRouter } from 'expo-router'; // Add this import
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
	import Ustyles from '../components/UniversalStyles';
	// export var isCreateAccount = useState(false);
export default function Index() {
  const router = useRouter(); // Initialize router
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <View style={Ustyles.background}>
      <ImageBackground source={require('../assets/images/background-lineart.png')} style={Ustyles.backgroundImage}>
        <View style={styles.container}>
          <ImageBackground source={require('../assets/images/bg-ellipse.png')} style={{ justifyContent: 'center' }} resizeMode="contain">
            <Text style={Ustyles.logotext}>remi</Text>
          </ImageBackground>
          <KeyboardAvoidingView behavior="padding">
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#BCD5AC"
              placeholder="Email"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Password"
              placeholderTextColor="#BCD5AC"
            />

            {loading ? (
              <ActivityIndicator size={'small'} style={{ margin: 28 }} />
            ) : (
              <>
                <Button onPress={signIn} title="Login" color="#0D5F13" />
                {/* Navigate to Register Page */}
                <Button
                  onPress={() => router.push('./(auth)/welcome')} // Navigate to the registration page
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

	}
});
