# Remi
Remi is a social media app where you can post the recipes you make, react to what your friends have been cooking, and bookmark recipes for the future.

## Group Members
- Anushka Vijay         @anushkavijay
- Alex Chau             @chauAlex
- Qi Wu (Helen)         @Helen123
- Peter (Hongye) Liang  @hongye-liang
- Kavi Iyer             @iyerkaveri
- Raina Kakani          @rainakakani21
- Sunhu Choi            @SunhuChoi

## Tech Stack
We will be using React Native, and using Expo Go as our deployment platform. We believe that React Native is the best tech stack option, as it allows for us to deploy an app on different platforms, allowing not only for all our team members to stay involved, but to reach a greater market. We wish to service all users who want to find recipes, post recipes, and more, without being blocked by the OS they are using. 

We believe that Remi is a recipe sharer app that has at minimum, two types of users:
- Logged in users that can look at public recipes, post recipes, and follow other users to see their private recipes
- Unauthenticated users that can look at public recipes

# Installation
## Prerequisites
Make sure you have the latest Node.js installed, as well as the Expo Go app on your phone. 

https://nodejs.org/en/download/package-manager

https://expo.dev/go

## Dependencies
Once you are inside the respository and under the remi-app folder, please run "npm install" to install all the dependencies necessary for this app. Libraries and components such as firebase/auth got user authentication cannot be run without being installed before the app is launched. 

## Installation Steps
Make sure all the applications mentioned under Prerequisites are installed first. Once that is done, clone the repository under the main branch.

SSH: git@github.com:ucsb-cs184-f24/team12-remi.git

HTTPS: https://github.com/ucsb-cs184-f24/team12-remi.git

Once cloned, make sure you cd into the remi-app folder, where you will run:

npm install

This will install all the dependencies needed to run the app. This may take a couple minutes. Once everything has been installed, run:

npx expo start

This will eventually build the app and provide a QR code, which you can then scan via your phone camera or on the Expo Go app itself. You should now be able to see the Remi app!

## Functionality
Login: Users begin with the login page, where they can either login with their existing account or create a new account. Any form of e-mail type is viable!

Home Page: Once logged in, users can access their home page, where they can see posts made by their friends. At the top right corner is a notification icon which will show they user if they have any friend requests pending

Add Recipes: Users can add a recipe post that friends can see. Add a dish name, comments about the recipe such as ingredients used, and tags such as the culture the dish is from! Click the next button to set the price, difficulty, and amount of time it took to make the dish. Then click submit recipe!

Search: Users can search for other users on the app and send friend requests! Hopefully in the future you can also see posts from public users, like an explore page.

Profile Page: Users can set their profile visibility(private or public), recent activity, change their profile picture and bio, and a sign out option! Not all of this functionality has been completed yet, but it's almost there!

## Known Problems
There is some changes we would like to deal with, such as moving all styles under a UniversalStyles component to avoid cluttering some pages up. We also understand that post rendering is a bit slow, which is something we hope to address in the near future.

## Contributing
Fork it!
Create your feature branch: git checkout -b my-new-feature
Commit your changes: git commit -am 'Add some feature'
Push to the branch: git push origin my-new-feature
Submit a pull request :D

## License
You can find our MIT license under our LICENSE.md: https://github.com/ucsb-cs184-f24/team12-remi/blob/main/LICENSE.md

## Deployment
https://github.com/ucsb-cs184-f24/team12-remi/releases/tag/v1.5.0
