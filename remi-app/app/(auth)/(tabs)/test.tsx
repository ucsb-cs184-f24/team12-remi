import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RecipePost from "./home";
import { db, auth } from "../../../firebaseConfig";
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

const items = [
  { name: "Breakfast", id: 1 },
  { name: "Lunch", id: 2 },
  { name: "Dinner", id: 3 },
  { name: "Vegetarian", id: 4 },
  { name: "Vegan", id: 5 },
  { name: "Gluten-Free", id: 6 },
  { name: "Dairy-Free", id: 7 },
  { name: "Keto", id: 8 },
  { name: "Paleo", id: 9 },
  { name: "Low Carb", id: 10 },
  { name: "Mediterranean", id: 11 },
  { name: "Asian", id: 12 },
  { name: "Italian", id: 13 },
  { name: "Mexican", id: 14 },
  { name: "Indian", id: 15 },
  { name: "Middle Eastern", id: 16 },
  { name: "French", id: 17 },
  { name: "American", id: 18 },
  { name: "African", id: 19 },
  { name: "Caribbean", id: 20 },
  { name: "Comfort Food", id: 21 },
  { name: "Dessert", id: 22 },
  { name: "Snacks", id: 23 },
  { name: "Appetizers", id: 24 },
  { name: "BBQ", id: 25 },
  { name: "Seafood", id: 26 },
  { name: "Soups & Stews", id: 27 },
  { name: "Salads", id: 28 },
  { name: "Beverages", id: 29 },
  { name: "Japanese", id: 30 },
];

export default function Explore() {
  const [activeTab, setActiveTab] = useState<SearchTab>("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<
    { id: number; name: string }[]
  >([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (activeTab === "hashtags") {
      const filteredItems = items
        .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
        .map((item) => item.name);

      setSuggestions(filteredItems);
    } else {
      setSuggestions([]);
    }

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
  const handleSelectSuggestion = (tagName: string) => {
    const selectedItem = items.find((item) => item.name === tagName);

    if (selectedItem) {
      const alreadySelected = selectedTags.some(
        (tag) => tag.id === selectedItem.id
      );

      if (alreadySelected) {
        // Remove tag if already selected
        setSelectedTags(
          selectedTags.filter((tag) => tag.id !== selectedItem.id)
        );
      } else {
        // Add tag to selectedTags
        setSelectedTags([...selectedTags, selectedItem]);
      }
    }

    setSearchQuery("");
    setSuggestions([]);
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
      <View style={styles.header}>
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
        {activeTab === "hashtags" && suggestions.length > 0 && (
          <ScrollView style={styles.suggestionsContainer}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}>
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {/* Display Selected Tags */}
        {activeTab === "hashtags" && selectedTags.length > 0 && (
          <View style={styles.selectedTagsContainer}>
            {selectedTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={styles.selectedTag}
                onPress={() => handleSelectSuggestion(tag.name)}>
                <Text style={styles.selectedTagText}>{tag.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {activeTab === "posts" && <PostsTab searchQuery={searchQuery} />}
        {activeTab === "users" && <UsersTab searchQuery={searchQuery} />}
        {activeTab === "hashtags" && <HashtagsTab searchQuery={searchQuery} />}
        {activeTab === "bookmarks" && (
          <BookmarksTab searchQuery={searchQuery} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBF0",
  },
  header: {
    padding: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#006400",
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    marginBottom: 10,
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
  suggestionItem: {
    padding: 10,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedTag: {
    backgroundColor: "#006400",
    borderRadius: 15,
    padding: 8,
    margin: 5,
  },
  selectedTagText: {
    color: "#FFF",
    fontSize: 14,
  },
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
});
