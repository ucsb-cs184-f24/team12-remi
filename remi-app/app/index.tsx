import React, { useState } from 'react';
import { View, Button, TextInput, Text } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Adjust the path as necessary

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in successfully
        const user = userCredential.user;
        console.log('Signed in as:', user.email);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        placeholder="Email...."
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={{ width: '80%', padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
        style={{ width: '80%', padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
      />
      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  );
};

export default SignInScreen;
