import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../../../firebaseConfig'; // Assuming you have set up Firestore in firebaseConfig 
import { doc, setDoc } from 'firebase/firestore';
import RNPickerSelect from 'react-native-picker-select';
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
        <View style={Ustyles.background}> 
            <Spacer size={60}/>
            <View style={styles.justifytop_container}>
                <Text style={Ustyles.header_text}>
                    Add Recipe
                </Text>
                <Text style={Ustyles.header_2}>
                    What did you make today?
                </Text>
				<TouchableOpacity onPress={pickImage} style={styles.iconContainer}>
                    <View style={styles.iconBackground}>
                        <Ionicons name="camera-outline" size={100} color="#0D5F13" />
                    </View>
				</TouchableOpacity>
                {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
                <TextInput
                    style={styles.input}
                    placeholder="Caption"
                    value={caption}
                    onChangeText={setCaption}
                    placeholderTextColor='#BCD5AC'
                />
                <TextInput
                    style={styles.input}
                    placeholder="Select Tags"
                    value={hashtags}
                    onChangeText={setHashtags}
                    placeholderTextColor='#BCD5AC'
                />
				<TouchableOpacity style={styles.buttonContainer} onPress={handleSubmit} >
                    <View style={styles.button}>
                        <Text style={Ustyles.text}>Next</Text>
                    </View>
				</TouchableOpacity>
                {loading && <ActivityIndicator size="large" color="#0D5F13" />}
            </View>
        </View>
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
        alignSelf: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 6,
		borderWidth: 2,
		borderColor: '#0D5F13',
        backgroundColor: '#FFF9E6',
	},
    buttonContainer: {
        alignItems: 'center', // This centers the button horizontally
        marginVertical: 20, // Optional: Adjust spacing around the button
    },
    justifytop_container: {
        flex: 1,
		backgroundColor: '#FFF9E6', // Background color behind the ImageBackground
        padding: 20,
        justifyContent: 'flex-start',
        alignContent: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    iconBackground: {
        backgroundColor: '#BCD5AC', // Light green background color
        padding: 35, // Space between the icon and the edge of the rectangle
        borderRadius: 200, // Rounded corners
        justifyContent: 'center',
        alignItems: 'center',
    }, 
    iconText: {
        marginLeft: 10, // Space between icon and text
        fontSize: 18,
        color: '#0D5F13',
    },
});

export default App;
