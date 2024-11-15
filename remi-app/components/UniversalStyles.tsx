import { StyleSheet } from "react-native";

const Ustyles = StyleSheet.create({
  stickyHeader: {
    height: 50,
    backgroundColor: "#FFF9E6",
  },
  notificationBadge: {
    position: "absolute",
    right: 4,
    top: 1,
    backgroundColor: "red",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 0,
  },
  notificationText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  bellIconContainer2: {
    marginLeft: "auto", // Pushes the icon to the right
    marginRight: 15,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  logo: {
    width: 30,
    height: 30,
  },
  feed: {
    flex: 1,
    backgroundColor: "#FFF9E6",
  },
  post: {
    backgroundColor: "#FFF9E6",
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#BCD5AC", // Adjust color to fit your theme
    marginVertical: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  timeAgo: {
    color: "#888",
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
  },
  engagement: {
    flexDirection: "row",
    alignItems: "center",
  },
  engagementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  engagementText: {
    fontSize: 14,
    marginLeft: 5,
    color: "#8B4513",
    textAlignVertical: "center",
  },
  recipeContent: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "#0D5F13",
    borderRadius: 10,
    overflow: "hidden",
  },
  leftColumn: {
    width: "65%",
    padding: 10,
  },
  imageContainer: {
    aspectRatio: 1,
    borderColor: "#0D5F13",
    borderWidth: 3,
    borderRadius: 10,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  seeNotesButton: {
    paddingVertical: 3,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#0D5F13",
  },
  seeNotesText: {
    color: "#0D5F13",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
  rightColumn: {
    width: "35%",
    backgroundColor: "#BCD5AC",
    padding: 10,
  },
  recipeDetails: {
    justifyContent: "center",
  },
  detailText: {
    marginBottom: 5,
    fontSize: 14,
    color: "#0D5F13",
    fontFamily: "Nunito_700Bold",
    fontWeight: "bold",
  },
  subDetailText: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: "#0D5F13",
    marginTop: 2,
  },
  slider: {
    height: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    marginBottom: 10,
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#0D5F13",
    borderRadius: 2,
  },
  captionContainer: {
    backgroundColor: "#BCD5AC",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  caption: {
    color: "#0D5F13",
    marginBottom: 5,
  },
  hashtags: {
    color: "#0D5F13",
    fontSize: 15,
  },
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
    marginVertical: 5,
  },
  buttonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  username: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#0D5F13",
    padding: 0,
  },
  recipeName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 20,
    color: "#0D5F13",
    padding: 0,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
    alignSelf: "center",
    paddingVertical: 10,
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
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  text: {
    fontFamily: "Nunito_400Regular",
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
