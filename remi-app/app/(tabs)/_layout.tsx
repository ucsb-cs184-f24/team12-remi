import {Tabs} from "expo-router"
import { Ionicons } from '@expo/vector-icons'; // For icons
const TabsLayout = () => {
    return <Tabs>
      <Tabs.Screen 
        name="home" options={{
            headerTitle: "Home",
            title: "Home",
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" color={color} size={size} />
            ),
        }}></Tabs.Screen>
      {/* Tab for settings.tsx */}
      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: "Settings",
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
      {/* Tab for profile.tsx */}
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>;
}

export default TabsLayout;