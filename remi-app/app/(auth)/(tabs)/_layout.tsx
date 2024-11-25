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
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#FFF9E6", // Tan background
            borderTopWidth: 2,
            borderColor: "#0D5F13",
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontFamily: "Nunito_600SemiBold",
          },
          tabBarActiveTintColor: "#BCD5AC", // Light green for selected tabs
          tabBarInactiveTintColor: "#0D5F13", // Dark green for unselected tabs
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: "Home",
            headerShown: false,
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
      </Tabs>
    </ScrollResetContext.Provider>
  );
};

export default TabsLayout;
