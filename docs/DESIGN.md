# System Overview
![Frame 1](https://github.com/user-attachments/assets/7c919080-1f96-4f71-85ee-7c29c405bbd8)

All of our user authentication and other workflows, such as creating posts, comments, likes, and editing the user profile, are stored and retrieved from the Firebase Authentication and Firestore Database. The Firestore Database stores collections, namely: Posts, Comments, Bookmarks, Notifications, RemiUsers. Users are identified in our database through their uuid generated when signing up and stored in the Firebase Authentication, allowing us to keep lists of friends, notifications, etc.

# Important Team Decisions
err insert stuff here

# UX Considerations and User Flows
![Remi User Workflows](https://github.com/user-attachments/assets/6894b955-8ead-4750-8424-d51d01f51903)
We wanted to use a consistent theme of beige and green through our components and different page backgrounds. We used Figma to start designing different pages like the home screen, login/create account, and more. Attached below is the link:
<img width="545" alt="Screen Shot 2024-11-20 at 2 38 21 PM" src="https://github.com/user-attachments/assets/35bc9fb0-cc92-40cd-80d2-18a72d7d1913">
