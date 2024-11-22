## Folder Structure
- The modal.png is an image of the code that I want to test and make sure is working for iOS. However, at the time of writing this, I have not been able to come up with a unit test that test specifically for iOS, only for behavior as a whole for any OS.
- The signout.jpg is the signout button that I am testing to see if the user is properly being signed out, then sent to a copy of the sign in page
- The unittest.png image shows an example successful execution of the sign out unit test, showing a successful pass meaning that the user was properly signed out and the screen the user was redirected to was the sign in page.
- To run the test, make sure you install the npm dependencies with command "npm install jest @testing-library/react @testing-library/jest-dom ts-jest -D"
- Then run "npx jest __tests__/sign-out.test.tsx.tsx" in terminal
- The test file can be found at this link: https://github.com/ucsb-cs184-f24/team12-remi/tree/Unit-testing-login/remi-app/app/(auth)/(tabs)/__tests__
