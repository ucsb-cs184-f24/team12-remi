## Overview

This application allows users to:

1. Log in to access the authenticated section of the app (`auth` page).
2. Save posts to a database by clicking a bookmark button.
3. View saved posts on the `bookmarks.tsx` page through the profile section.

### Flow:
- Before logging in, users are on the unauthenticated view.
- Once logged in, users are navigated to the authenticated section (`auth`).
- Clicking the bookmark button saves a post to the database.
- In the profile (`profile.tsx`), users can access the hamburger menu to navigate to the bookmarks page (`bookmarks.tsx`).
- The `BookmarksTab.tsx` component dynamically renders saved posts on the bookmarks page.
