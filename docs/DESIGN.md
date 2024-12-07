# System Overview
![Frame 1](https://github.com/user-attachments/assets/7c919080-1f96-4f71-85ee-7c29c405bbd8)

All of our user authentication and other workflows, such as creating posts, comments, likes, and editing the user profile, are stored and retrieved from the Firebase Authentication and Firestore Database. The Firestore Database stores collections, namely: Posts, Comments, Bookmarks, Notifications, RemiUsers. Users are identified in our database through their uuid generated when signing up and stored in the Firebase Authentication, allowing us to keep lists of friends, notifications, etc.

# Important Team Decisions
At Lecture 4, 10/9/24, Our very first important decision was made on which tech stack to use. We believed that making our app as far reaching as possible was for the best, leading us to choose React Native with Expo Go as our tech stack of choice. Firebase and Firestore were also considered for our preferred database, with the decision being finalized in our sprint planning meeting on 10/11/24. 

At Section03, we had our first retro, discussing what we wanted to start for our first MVP and practices we wanted to stop or continue. A new decision was made to actively message and discuss PRs with others via our Discord.

During our 11/2/24 Sprint Planning, we finalized all the features and functionality we wanted for our MVP. We decided on displaying friend and post functionality, while saving profile and explore page options for the future.

At Section06, we held our second retro led by Alex. Our biggest point of discussion was regarding documentation, especially on the Kanban board. We decided that moving forward, it would be best that we keep better track of the changes we made and the functionality we added by creating issues on the Kanban Board as consistently as possible. We also asssessed that our decision from the last retro to create PR updates and request reviews was a great success.

# Difficulties Encountered
- Uploading Images to Firebase Storage
- Android not working vs. IOS
- Design of the Explore Page
- Refreshing

# UX Considerations and User Flows
![Remi User Workflows](https://github.com/user-attachments/assets/6894b955-8ead-4750-8424-d51d01f51903)
We wanted to use a consistent theme of beige and green through our components and different page backgrounds. We used Figma to start designing different pages like the home screen, login/create account, and more. Attached below is the link:
<img width="545" alt="Screen Shot 2024-11-20 at 2 38 21 PM" src="https://github.com/user-attachments/assets/35bc9fb0-cc92-40cd-80d2-18a72d7d1913">

# External Resources
https://reactnative.dev/docs/getting-started

