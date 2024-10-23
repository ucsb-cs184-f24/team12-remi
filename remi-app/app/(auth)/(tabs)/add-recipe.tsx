import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../../../firebaseConfig'; // Assuming you have set up Firestore in firebaseConfig 
import { doc, setDoc } from 'firebase/firestore';
import {
    Text,
    View,
    StyleSheet,
    Button,
    TextInput,
    Image,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import Ustyles from '@/components/UniversalStyles';
import Spacer from '@/components/Spacer';
import { Ionicons } from '@expo/vector-icons'; // For icons

const App = () => {
    const [image, setImage] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        // Request permission to access the media library
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert('Permission to access camera roll is required!');
            return;
        }

        // Open the image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'Posts', `${Date.now()}`); // Use a unique ID for the document
            await setDoc(docRef, {
                caption: caption,
                hashtags: hashtags,
                mediaUrl: image,
                userId: auth.currentUser?.uid,
                createdAt: new Date().toISOString(),
                likesCount: 0 // Initial likes count
            });
            // Clear input fields after submission
            setCaption('');
            setHashtags('');
            setImage(null);
            alert('Recipe submitted successfully!');
        } catch (error) {
            // Type assertion to handle the error correctly
            const errorMessage = (error as FirebaseError).message || (error as Error).message;
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Spacer size={80} />
                <View style={styles.justifytop_container}>
                    <Text style={Ustyles.header_text}>
                        What did you make today?
                    </Text>
                    <TouchableOpacity onPress={pickImage} style={styles.iconContainer}>
                        <Ionicons name="camera-outline" size={60} color="#0D5F13" />
                        {/* <Text style={styles.iconText}>Pick an Image</Text> Wrapped in <Text>  */} 
                    </TouchableOpacity>
                    {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
                    <TextInput
                        style={styles.input}
                        placeholder="Caption"
                        value={caption}
                        autoCorrect={false}
                        onChangeText={setCaption}
                        placeholderTextColor='#BCD5AC'
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Hashtags"
                        value={hashtags}
                        autoCorrect={false}
                        onChangeText={setHashtags}
                        placeholderTextColor='#BCD5AC'
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text>Submit</Text> 
                    </TouchableOpacity>
                    {loading && <ActivityIndicator size="large" color="#0D5F13" />}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 2,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
        borderColor: '#0D5F13',
    },
	button: {
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 2,
		borderRadius: 6,
		borderWidth: 4,
		borderColor: '#0D5F13',
		fontFamily: 'Nunito',
		color: '#0D5F13'

	},
    justifytop_container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'flex-start',
		alignContent: 'center'
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    iconText: {
        marginLeft: 10, // Space between icon and text
        fontSize: 18,
        color: '#0D5F13',
    },
});

export default App;
