import { StyleSheet } from "react-native";

const Ustyles = StyleSheet.create({
  header_text: {
    fontFamily: "Nunito_700Bold",
    fontWeight: "bold",
    fontSize: 30,
    color: "#0D5F13",
    padding: 0,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
    alignSelf: "center",
    paddingBottom: 10,
  },
  button: {
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0D5F13",
    backgroundColor: "#FFF9E6",
  },
  buttonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  header_2: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 20,
    color: "#0D5F13",
    padding: 0,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
    alignSelf: "center",
    paddingBottom: 10,
  },
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: "space-evenly",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "contain", // Or 'contain' depending on how you want the image to fit
    justifyContent: "center",
  },
  background: {
    flex: 1,
    backgroundColor: "#FFF9E6", // Background color behind the ImageBackground
  },
  bgimage: {
    flex: 1,
    justifyContent: "center",
  },
  logotext: {
    fontFamily: "OrelegaOne_400Regular",
    fontSize: 50,
    lineHeight: 100,
    color: "#0D5F13", // Dark Green
    padding: 0,
    justifyContent: "center",
    alignSelf: "center",
    paddingBottom: 10,
  },
  notif_text: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    alignSelf: "center",
    paddingBottom: 0,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  text: {
    fontFamily: "Nunito",
    fontSize: 20,
    lineHeight: 0,
    color: "#0D5F13",
    paddingTop: 0,
    justifyContent: "center",
    alignSelf: "center",
    paddingBottom: 0,
  },
});

export default Ustyles;
