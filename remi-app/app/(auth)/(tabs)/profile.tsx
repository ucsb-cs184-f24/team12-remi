import {
	Image,
	Text,
	View,
	StyleSheet,
	Button,
	Switch,
	ImageBackground
} from 'react-native';
import {signOut} from 'firebase/auth';
import { auth, db } from '../../../firebaseConfig'; 
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import Ustyles from '../../../components/UniversalStyles';
import Spacer from '../../../components/Spacer'
import React, { useEffect, useState } from 'react';

const DEFAULT_PROFILE_PIC = 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png';

const Page = () => {
    const user = auth.currentUser;
    const [profilePic, setProfilePic] = useState<string>(DEFAULT_PROFILE_PIC); // Default profile pic
	const [username, setUsername] = useState('');
    const [isPublic, setIsPublic] = useState(false); // State for the toggle switch
    const [loading, setLoading] = useState(true);

    // Fetch current visibility from Firestore when the component loads
	useEffect(() => {
		const fetchUserData = async () => {
			if (user) {
				try {
					const userDocRef = doc(db, 'RemiUsers', user.uid);
					const userSnapshot = await getDoc(userDocRef);
					if (userSnapshot.exists()) {
						const userData = userSnapshot.data();
						setIsPublic(userData.visibility === 'public');
						setUsername(userData.username || ''); // Get the username
						// console.log('Username:', userData.username)
					}
				} catch (error) {
					console.error('Error fetching user data:', error);
				} finally {
					setLoading(false);
				}
			}
		};
	
		fetchUserData();
	}, [user]);
	

    // Handle the toggle switch and update the Firestore document
    const toggleSwitch = async () => {
        if (!user) return;
        const newVisibility = !isPublic ? 'public' : 'private'; // Determine the new visibility state
        setIsPublic(!isPublic);

        try {
            const userDocRef = doc(db, 'RemiUsers', user.uid);
            await updateDoc(userDocRef, { visibility: newVisibility }); // Update visibility in Firestore
            alert(`Profile visibility updated to ${newVisibility}`);
        } catch (error) {
            console.error('Error updating visibility:', error);
            alert('Failed to update profile visibility');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={Ustyles.background}>
            <Spacer size={50} />
			<Text style={styles.headerText}>Profile</Text>
            
            {/* Profile picture and email */}
            <View style={styles.profileContainer}>
                <Image
                    source={{ uri: profilePic }}
                    style={styles.profileImage}
                />
                <View style={styles.userContainer}>
                    <Text style={styles.text}>{username}</Text>
                    <Text style={styles.text}>{user?.email}</Text>
                </View>
            </View>

            {/* Visibility Section */}
            <Spacer size={20} />
            <Text style={styles.text}>Visibility</Text>
            <View style={styles.switchContainer}>
                <Text style={styles.visibilityText}>{isPublic ? 'Public' : 'Private'}</Text>
                <Switch
                    style={styles.switch}
                    trackColor={{ false: "#767577", true: "#0D5F13" }}
                    thumbColor={isPublic ? "#0D5F13" : "#f4f3f4"}
                    onValueChange={toggleSwitch}
                    value={isPublic}
                />
            </View>

            <Spacer size={50} />
            <Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" />
        </View>
    );
};

const styles = StyleSheet.create({
	headerText: {
        fontSize: 24,         
        fontWeight: 'bold',   
        textAlign: 'center',  
        color: '#0D5F13',     
    },
    text: {
        fontFamily: 'Roboto',
        fontSize: 20,
        lineHeight: 0,
        color: '#0D5F13',
        paddingTop: 0,
        justifyContent: 'center',
        alignSelf: 'center',
        paddingBottom: 0,
    },
    userContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
		marginLeft: 20,
		alignSelf: 'flex-start'
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
		marginVertical: 20,
		marginLeft: 20,
        marginRight: 20,
		alignSelf: 'flex-start'
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 25,
        marginRight: 10,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
		marginLeft: 20,
		alignSelf: 'flex-start'
    },
    visibilityText: {
        fontSize: 18,
        color: '#0D5F13',
        marginRight: 10,
		marginLeft: 20,
		alignSelf: 'flex-start'
    },
    switch: {
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Page;