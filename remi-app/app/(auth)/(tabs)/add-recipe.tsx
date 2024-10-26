import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { FirebaseError } from 'firebase/app';
import RNPickerSelect from 'react-native-picker-select';
import { auth, db, storage} from '../../../firebaseConfig'; // Assuming you have set up Firestore in firebaseConfig 
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
} from 'react-native';
import Ustyles from '@/components/UniversalStyles';
import Spacer from '@/components/Spacer';
import { Ionicons } from '@expo/vector-icons';

const App = () => {
    const [image, setImage] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        try {
            // Request permission to access the media library
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
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
                console.log('Selected Image URI:', result.assets[0].uri); // Log URI for debugging
                setImage(result.assets[0].uri); // Set image URI state
            }
        } catch (error) {
            console.error('Error picking image:', error); // Log the error for debugging
            alert('An error occurred while selecting an image. Please try again.');
        }
    };
    
    const uploadImageToStorage = async (uri: string): Promise<string> => {
        try {
            console.log("Image upload started");
    
            // Ensure the URI is not null or undefined
            if (!uri) {
                throw new Error("Image URI is null or undefined.");
            }
    
            console.log("Fetching image from URI:", uri);
            const response = await fetch(uri);
    
            if (!response.ok) {
                throw new Error(`Network response error: ${response.statusText}`);
            }
    
            console.log("Converting response to blob...");
            const blob = await response.blob();
    
            console.log("Creating Firebase Storage reference...");
            const storageRef = ref(storage, `images/${Date.now()}.jpg`);
    
            console.log("Uploading blob to Firebase Storage...");
            await uploadBytes(storageRef, blob);
    
            console.log("Getting download URL...");
            const downloadURL = await getDownloadURL(storageRef);
            console.log("Image successfully uploaded. Download URL:", downloadURL);
    
            return downloadURL;
        } catch (error) {
            console.error("Upload failed:", error);
            alert(`Image upload failed: ${(error as Error).message}`);
            throw error; // Re-throw to be caught by the calling function
        }
    };
    
    


    const handleSubmit = async () => {
        setLoading(true);
        try {
            let mediaUrl = '';

            if (image) {
                console.log("have image")
                mediaUrl = await uploadImageToStorage(image);
                console.log(mediaUrl)
            }
            const docRef = doc(db, 'Posts', `${Date.now()}`); // Use a unique ID for the document
            await setDoc(docRef, {
                caption: caption,
                hashtags: hashtags,
                mediaUrl: mediaUrl,
                userId: auth.currentUser?.uid,
                createdAt: new Date().toISOString(),
                likesCount: 0,
            });
            setCaption('');
            setHashtags('');
            setImage(null);
            alert('Recipe submitted successfully!');
        } catch (error) {
            const errorMessage = (error as FirebaseError).message || (error as Error).message;
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={Ustyles.background}>
                <Spacer size={60} />
                <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        <View style={styles.justifytop_container}>
                            <Text style={Ustyles.header_text}>Add Recipe</Text>
                            <Text style={Ustyles.header_2}>What did you make today?</Text>
                            {image ? (
                                // Render the "Change Image" button if an image is selected
                                <TouchableOpacity onPress={pickImage} style={styles.changeImageButton}>
                                    <Text style={styles.changeImageText}>Change Image</Text>
                                </TouchableOpacity>
                            ) : (
                                // Render the camera button if no image is selected
                                <TouchableOpacity onPress={pickImage} style={styles.iconContainer}>
                                    <Ionicons name="camera-outline" size={100} color="#0D5F13" />
                                </TouchableOpacity>
                            )}

                            {image && <Image source={{ uri: image }} style={styles.imagestyle} />}
                            <Spacer size={20} />
                            <TextInput
                                multiline={true}
                                style={styles.notes_input}
                                placeholder={`ingredients?\nrecipe?\nanything you want your friends to know?`}
                                value={caption}
                                onChangeText={setCaption}
                                placeholderTextColor="#BCD5AC"
                            />
                            <TextInput
                                multiline={true}
                                style={styles.tags_input}
                                placeholder={`select tags`}
                                value={hashtags}
                                onChangeText={setHashtags}
                                placeholderTextColor="#BCD5AC"
                            />
                            <TouchableOpacity style={styles.buttonContainer} onPress={handleSubmit}>
                                <View style={styles.button}>
                                    <Text style={Ustyles.header_2}>Next</Text>
                                </View>
                            </TouchableOpacity>
                            {loading && <ActivityIndicator size="large" color="#0D5F13" />}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    imagestyle: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        borderWidth: 4,
        borderRadius: 4,
        borderColor: '#0D5F13',
        marginVertical: 20,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingBottom: 20,
    },
    notes_input: {
        marginVertical: 4,
        height: 150,
        borderWidth: 2,
        borderRadius: 4,
        padding: 6,
        backgroundColor: '#fff',
        borderColor: '#0D5F13',
        textAlignVertical: 'top',
        //textAlign: 'justify',
        fontSize: 18,
        fontFamily: 'Nunito_600SemiBold',
        width: '100%'
        
    },
    tags_input: {
        marginVertical: 4,
        height: 80,
        borderWidth: 2,
        borderRadius: 4,
        padding: 6,
        backgroundColor: '#fff',
        borderColor: '#0D5F13',
        textAlignVertical: 'top',
        //textAlign: 'justify',
        fontSize: 18,
        fontFamily: 'Nunito_600SemiBold',
        width: '100%'
        
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
        alignItems: 'center',
        marginVertical: 20,
    },
    justifytop_container: {
        flex: 1,
        backgroundColor: '#FFF9E6',
        padding: 20,
        justifyContent: 'flex-start',
    },
    iconContainer: {
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#BCD5AC',
        padding: 35,
        width: 200,
        height: 200,
        borderRadius: 100,
    }, changeImageButton: {
        alignSelf: 'center',
        backgroundColor: '#0D5F13',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    changeImageText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Nunito_600SemiBold',
    },
});

export default App;
