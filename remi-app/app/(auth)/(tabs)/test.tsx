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
import PostsTab from "../PostsTab";
import UsersTab from "../UsersTab";
import HashtagsTab from "../HashtagsTab";

type SearchTab = "posts" | "users" | "hashtags";

type TagItem = {
  name: string;
  id: number;
};

type RecipeTagItem = TagItem & {
  children?: TagItem[];
};

const recipeTagItems: RecipeTagItem[] = [
  {
    name: "Meal Type",
    id: 0,
    children: [
      { name: "Breakfast", id: 1 },
      { name: "Lunch", id: 2 },
      { name: "Dinner", id: 3 },
      { name: "Snacks", id: 4 },
      { name: "Dessert", id: 5 },
      { name: "Beverages", id: 6 },
    ],
  },
  {
    name: "Diet",
    id: 100,
    children: [
      { name: "Vegetarian", id: 101 },
      { name: "Pescatarian", id: 102 },
      { name: "Halal", id: 103 },
      { name: "Vegan", id: 104 },
      { name: "Jain", id: 105 },
      { name: "Gluten-Free", id: 106 },
      { name: "Dairy-Free", id: 107 },
      { name: "Keto", id: 108 },
      { name: "Paleo", id: 109 },
      { name: "Low Carb", id: 110 },
    ],
  },
  {
    name: "Cuisine",
    id: 200,
    children: [
      { name: "Italian", id: 201 },
      { name: "French", id: 202 },
      { name: "Mexican", id: 203 },
      { name: "Japanese", id: 204 },
      { name: "Chinese", id: 205 },
      { name: "Korean", id: 206 },
      { name: "Thai", id: 207 },
      { name: "Malaysian", id: 208 },
      { name: "Vietnamese", id: 209 },
      { name: "Indian", id: 210 },
      { name: "Pakistani", id: 211 },
      { name: "Mediterranean", id: 212 },
      { name: "American", id: 213 },
      { name: "Southern", id: 214 },
      { name: "Middle Eastern", id: 215 },
      { name: "African", id: 216 },
      { name: "Caribbean", id: 217 },
      { name: "Creole", id: 218 },
      { name: "Cajun", id: 219 },
    ],
  },
  {
    name: "Course",
    id: 300,
    children: [
      { name: "Appetizers", id: 301 },
      { name: "Main Course", id: 302 },
      { name: "Side Dish", id: 303 },
    ],
  },
];

export default function Explore() {
  const [activeTab, setActiveTab] = useState<SearchTab>("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TagItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (activeTab === "hashtags") {
      const filteredItems = recipeTagItems.flatMap(
        (category) =>
          category.children?.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase())
          ) || []
      );

      setSuggestions(filteredItems);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (tag: TagItem) => {
    const alreadySelected = selectedTags.some(
      (selectedTag) => selectedTag.id === tag.id
    );

    if (alreadySelected) {
      setSelectedTags(
        selectedTags.filter((selectedTag) => selectedTag.id !== tag.id)
      );
    } else {
      setSelectedTags([...selectedTags, tag]);
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
      default:
        return "Search here";
    }
  };

  const tabs: SearchTab[] = ["posts", "users", "hashtags"];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="compass-outline" size={28} color="#006400" />
          <Text style={styles.title}>Explore</Text>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#006400"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={getPlaceholder()}
            placeholderTextColor="#636363"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {activeTab === "hashtags" && selectedTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectedTagsContainer}
          contentContainerStyle={styles.selectedTagsContent}
        >
          {selectedTags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={styles.selectedTag}
              onPress={() => handleSelectSuggestion(tag)}
            >
              <Text style={styles.selectedTagText}>{tag.name}</Text>
              <Ionicons
                name="close-circle"
                size={16}
                color="#FFF"
                style={styles.removeTagIcon}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={
                tab === "posts"
                  ? "grid-outline"
                  : tab === "users"
                    ? "people-outline"
                    : "pricetag-outline"
              }
              size={24}
              color={activeTab === tab ? "#006400" : "#666"}
            />
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
      </View>

      <View style={styles.content}>
        {activeTab === "hashtags" && suggestions.length > 0 && (
          <ScrollView style={styles.suggestionsContainer}>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Text style={styles.suggestionText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {activeTab === "posts" && <PostsTab searchQuery={searchQuery} />}
        {activeTab === "users" && <UsersTab searchQuery={searchQuery} />}
        {activeTab === "hashtags" && <HashtagsTab searchQuery={searchQuery} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
  },
  topSection: {
    backgroundColor: "#FFF9E6",
  },
  header: {
    padding: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 8,
    color: "#006400",
    fontFamily: "Nunito-Bold",
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    margin: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#BCD5AC",
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
    color: "#006400",
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "black",
    fontFamily: "Nunito-Regular",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
  },
  tab: {
    alignItems: "center",
    width: "33%",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#006400",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Nunito-Regular",
    marginTop: 4,
    paddingBottom: 8,
  },
  activeTabText: {
    color: "#006400",
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
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
    fontFamily: "Nunito-Regular",
  },
  selectedTagsContainer: {
    maxHeight: 50,
  },
  selectedTagsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedTag: {
    backgroundColor: "#006400",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedTagText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    marginRight: 4,
  },
  removeTagIcon: {
    marginLeft: 4,
  },
});
