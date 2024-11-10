import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RecipePost from "./home";
import { db, auth } from "../../../firebaseConfig"; // Ensure correct imports
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  QuerySnapshot,
  DocumentData,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import PostsTab from "../PostsTab";
import UsersTab from "../UsersTab";
import HashtagsTab from "../HashtagsTab";
import BookmarksTab from "../BookmarksTab";

type SearchTab = "posts" | "users" | "hashtags" | "bookmarks";

export default function Explore() {
  const [activeTab, setActiveTab] = useState<SearchTab>("posts");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    switch (activeTab) {
      case "posts":
        console.log("Searching top results for:", query);
        break;
      case "users":
        console.log("Searching users for:", query);
        break;
      case "hashtags":
        console.log("Searching hashtags for:", query);
        break;
      case "posts":
        console.log("Searching posts for:", query);
        break;
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case "posts":
        return "Search across all categories...";
      case "users":
        return "Search for users...";
      case "hashtags":
        return "Search for hashtags...";
      case "posts":
        return "Search for recipes and posts...";
      default:
        return "Search here";
    }
  };

  const tabs: SearchTab[] = ["posts", "users", "hashtags", "bookmarks"];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Explore</Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={getPlaceholder()}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {
          //Put if statements here to check which kind of tab this is
          //Show different stuff
        }
        <View style={styles.resultsContainer}>
          {activeTab === "posts" && <PostsTab searchQuery={searchQuery} />}
          {activeTab === "users" && <UsersTab searchQuery={searchQuery} />}
          {activeTab === "hashtags" && (
            <HashtagsTab searchQuery={searchQuery} />
          )}
          {activeTab === "bookmarks" && (
            <BookmarksTab searchQuery={searchQuery} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBF0",
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#006400",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F3E6",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#006400",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#006400",
    fontWeight: "bold",
  },
  resultsContainer: {
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
