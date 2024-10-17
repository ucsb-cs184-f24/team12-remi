import {
	Text,
	View,
	StyleSheet,
	Button,
	ImageBackground
} from 'react-native';
import {signOut} from 'firebase/auth';
import {auth} from '../../firebaseConfig';
import Ustyles from '../../components/UniversalStyles';
import Spacer from '../../components/Spacer'

const Page = () => {
	const user = auth.currentUser;

	return (
		<View style={Ustyles.background}>
			<Spacer size={20}/>
			<Text style={styles.text}>
				Welcome to
			</Text>
			<Text style={Ustyles.logotext}>
				remi
			</Text>
			<Text style={styles.text}>
				{user?.email}
			</Text>
			<Spacer size={50}/>
			<Button title="Sign out" onPress={() => signOut(auth)} color="#0D5F13" />
		</View>
	);
};

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
	text: {
		fontFamily: 'Roboto',
		fontSize: 20,
		lineHeight: 0,
		color: '#0D5F13',
		paddingTop: 0,
		justifyContent: 'center',
		alignSelf: 'center',
		paddingBottom: 0,
		
	}
});


export default Page;