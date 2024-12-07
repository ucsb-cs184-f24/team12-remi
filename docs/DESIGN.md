# System Overview
![Frame 1](https://github.com/user-attachments/assets/7c919080-1f96-4f71-85ee-7c29c405bbd8)

All of our user authentication and other workflows, such as creating posts, comments, likes, and editing the user profile, are stored and retrieved from the Firebase Authentication and Firestore Database. The Firestore Database stores collections, namely: Posts, Comments, Bookmarks, Notifications, RemiUsers. Users are identified in our database through their uuid generated when signing up and stored in the Firebase Authentication, allowing us to keep lists of friends, notifications, etc.

# Important Team Decisions
At Lecture 4, 10/9/24, Our very first important decision was made on which tech stack to use. We believed that making our app as far reaching as possible was for the best, leading us to choose React Native with Expo Go as our tech stack of choice. Firebase and Firestore were also considered for our preferred database, with the decision being finalized in our sprint planning meeting on 10/11/24. 

At Section03, we had our first retro, discussing what we wanted to start for our first MVP and practices we wanted to stop or continue. A new decision was made to actively message and discuss PRs with others via our Discord.

During our 11/2/24 Sprint Planning, we finalized all the features and functionality we wanted for our MVP. We decided on displaying friend and post functionality, while saving profile and explore page options for the future.

At Section06, we held our second retro led by Alex. Our biggest point of discussion was regarding documentation, especially on the Kanban board. We decided that moving forward, it would be best that we keep better track of the changes we made and the functionality we added by creating issues on the Kanban Board as consistently as possible. We also asssessed that our decision from the last retro to create PR updates and request reviews was a great success.

At Lecture 16, 11/25/24, the team assessed what features we wanted before the code freeze deadline. These would include the following list:
- Notify page
- UI Profile pictures everywhere
- Style the pop up modal for see notes
- Fonts in add recipe
- Default stuff for users and hashtags on explore
- Style bookmarks page
- Style tags selecting menu
- Click on users in explore page
- Confirm password on create user delete post functionality notifs when you get a comment and a like make sign in and create account buttons round make back arrows consistent

At Lecture 17, 12/2/24, the team confirmed the status of these features, and documented exactly who was on which feature. In addition, we decided to do intensive testing on main.

Finally on Sec 09, 12/6/24, the team worked on small bug fixes before the code freeze deadline. In addition, to make the UI nicer for newer users we decided to change the default "look" or message on different pages of the app. This would include adding a new default profile picture and message on the home page saying "Add more friends to see some posts."

# Difficulties Encountered
- Uploading Images to Firebase Storage: The team figured out how to get images stored in the Firebase Storage, to allow for persistent image fetching. Previously the team was trying to use packages that require custom native code which can only be done with Expo Dev, so instead the team pivoted to using Expo Image Picker which was compaitable with Expo Go.
- Android Source URI: The way in which source URI was sent for Android vs IOS is different -- gets double encoded for Android. Thus, the team had a hotfix to unencode.
- Design of the Explore Page: Our team struggled in figuring out a unique design for our explore page. At first we considered doing something similar to Instagram's Explore Page in showing large collections of posts, or Tinder's way of having swipable public posts -- in the end, we wanted something to effortlessly search through posts via filter, via hashtags, and for users in general. Thus, we came up with our own design.

# UX Considerations and User Flows
![Remi User Workflows](https://github.com/user-attachments/assets/6894b955-8ead-4750-8424-d51d01f51903)
We wanted to use a consistent theme of beige and green through our components and different page backgrounds. We used Figma to start designing different pages like the home screen, login/create account, and more. Attached below is the link:
<img width="545" alt="Screen Shot 2024-11-20 at 2 38 21 PM" src="https://github.com/user-attachments/assets/35bc9fb0-cc92-40cd-80d2-18a72d7d1913">

# External Resources
https://reactnative.dev/docs/getting-started
StackOverflow
ChatGPT
v0
Youtube
Medium
Reddit
Visual Inspirations: Instagram, Beli

# Testing
Throughout the design and implementation process of Remi, there was a lot of testing and evaluation done to ensure the behavior displayed from our app matched the expected behavior. Much of the testing was done simply through live displaying the app on Expo Go while we were making changes. We would test on both Android and iOS devices to ensure cross-compatibility on all implemented functionality and designs. 

We also documented some Unit and A/B testing we had done in the past. Raina did A/B testing to determine which design choice for the profile page was the most visually appealing and functional. She created a version A and version B of a profile page and allowed the team to vote on which version was the best. Version B ended up being the final design to be implemented. Sunhu did unit testing on the logout functionality to determine if the user was successfully able to log and as a result, not able to do anything that a logged in user could. He created a test script that mocked up a sign out button design that called the sign out function used in the profile page, which successfully passed. Documentation on Raina and Sunhu's testing can be found in https://github.com/ucsb-cs184-f24/team12-remi/tree/main/team/rainakakani21/HW04 and https://github.com/ucsb-cs184-f24/team12-remi/tree/main/team/SunhuChoi.
