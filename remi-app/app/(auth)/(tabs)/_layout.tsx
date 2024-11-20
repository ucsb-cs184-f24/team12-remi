import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For icons
import React from "react";

// Create a context to share the resetScroll function
export const ScrollResetContext = React.createContext<(fn: () => void) => void>(
  () => {}
);

const TabsLayout = () => {
  const [resetScroll, setResetScroll] = React.useState<() => void>(() => {});
  const pathname = usePathname();

  return (
    <ScrollResetContext.Provider value={setResetScroll}>
      <Tabs>
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: "Home",
            headerShown: false, // This hides the header
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
          listeners={{
            tabPress: () => {
              if (pathname.includes("home")) {
                resetScroll?.();
              }
            },
          }}
        />
        {/* <Tabs.Screen 
        name="home" options={{
            //headerTitle: "Home",
            headerShown: false,
            title: "Home",
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" color={color} size={size} />
            ),
        }}></Tabs.Screen> */}
        {/* Tab for settings.tsx */}
        <Tabs.Screen
          name="add-recipe"
          options={{
            headerTitle: "Add Recipe",
            headerShown: false,
            title: "Add Recipe",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" color={color} size={size} />
            ),
          }}
        />
        {/* Tab for profile.tsx */}
        <Tabs.Screen
          name="search"
          options={{
            headerTitle: "Search",
            headerShown: false,
            title: "Search",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerTitle: "Profile",
            headerShown: false,
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="test"
          options={{
            headerTitle: "Profile",
            headerShown: false,
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </ScrollResetContext.Provider>
  );
};

export default TabsLayout;
