import {StyleSheet} from 'react-native';

const Ustyles = StyleSheet.create({
    container: {
		marginHorizontal: 20,
		flex: 1,
		justifyContent: 'space-evenly'
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

export default Ustyles;