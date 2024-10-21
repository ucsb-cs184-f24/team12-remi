import React, { useState } from 'react';
import { View, TextInput, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../../firebaseConfig'; 
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';

export default function Welcome() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const checkIfUsernameExists = async (username: string) => {
    const usersRef = collection(db, 'RemiUsers');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;  // Returns true if the username exists
  };

  const signUp = async () => {
    setLoading(true);
    try {
      const usernameExists = await checkIfUsernameExists(username);
      if (usernameExists) {
        alert('Username is already taken. Please choose a different one.');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'RemiUsers', user.uid), {
        username: username,
        email: email,
        friend_list: []
      });

      alert('Account created successfully!');
    } catch (e: any) {
      const err = e as FirebaseError;
      if (err.code === 'auth/email-already-in-use') {
        alert('This email is already associated with an account. Please use a different email or login with this existing email.');
      } else {
        alert('Registration failed: ' + err.message);
      }
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
