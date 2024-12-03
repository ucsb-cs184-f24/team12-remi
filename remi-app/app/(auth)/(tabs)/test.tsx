import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PostsTab from "../PostsTab";
import UsersTab from "../UsersTab";
import HashtagsTab from "../HashtagsTab";
import BookmarksTab from "../BookmarksTab";
import Spacer from "../../../components/Spacer";

type SearchTab = "posts" | "users" | "hashtags" | "bookmarks";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState<{
    price: [number, number];
    difficulty: [number, number];
    time: [number, number];
  }>({
    price: [1, 100],
    difficulty: [0, 5],
    time: [1, 120],
  });
  const [errorMessage, setErrorMessage] = useState("");

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
      case "bookmarks":
        return "Search your bookmarks...";
      default:
        return "Search here";
    }
  };

  const tabs: SearchTab[] = ["posts", "users", "hashtags"];

  const renderItem = ({ item }: { item: TagItem }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Text style={styles.suggestionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9E6" />
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
          {activeTab === "posts" && (
            <TouchableOpacity
              style={styles.filtersButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.filtersButtonText}>+ Filters</Text>
            </TouchableOpacity>
          )}
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
              size={28}
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
          <FlatList
            data={suggestions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.suggestionsContainer}
          />
        )}
        {activeTab === "posts" && (
          <PostsTab searchQuery={searchQuery} filters={filters} />
        )}
        {activeTab === "users" && <UsersTab searchQuery={searchQuery} />}
        {activeTab === "hashtags" && (
          <HashtagsTab selectedTags={selectedTags} />
        )}
        {activeTab === "bookmarks" && (
          <BookmarksTab searchQuery={searchQuery} />
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adjust Filters</Text>

              {errorMessage !== "" && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              <Text style={styles.filterLabel}>Price Range ($/serving):</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={filters.price[0].toString()}
                  onChangeText={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      price: [Number(value), prev.price[1]],
                    }))
                  }
                />
                <Text style={styles.filterText}>to</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={filters.price[1].toString()}
                  onChangeText={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      price: [prev.price[0], Number(value)],
                    }))
                  }
                />
              </View>

              <Text style={styles.filterLabel}>Difficulty (0-5):</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={filters.difficulty[0].toString()}
                  onChangeText={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      difficulty: [Number(value), prev.difficulty[1]],
                    }))
                  }
                />
                <Text style={styles.filterText}>to</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={filters.difficulty[1].toString()}
                  onChangeText={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      difficulty: [prev.difficulty[0], Number(value)],
                    }))
                  }
                />
              </View>

              <Text style={styles.filterLabel}>Time (mins):</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={filters.time[0].toString()}
                  onChangeText={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      time: [Number(value), prev.time[1]],
                    }))
                  }
                />
                <Text style={styles.filterText}>to</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={filters.time[1].toString()}
                  onChangeText={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      time: [prev.time[0], Number(value)],
                    }))
                  }
                />
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  // Validate inputs
                  if (
                    filters.price[0] < 1 ||
                    filters.price[1] > 100 ||
                    filters.price[0] > filters.price[1]
                  ) {
                    setErrorMessage(
                      "Price must be between $1 and $100, and min cannot exceed max."
                    );
                    return;
                  }
                  if (
                    filters.difficulty[0] < 0 ||
                    filters.difficulty[1] > 5 ||
                    filters.difficulty[0] > filters.difficulty[1]
                  ) {
                    setErrorMessage(
                      "Difficulty must be between 0 and 5, and min cannot exceed max."
                    );
                    return;
                  }
                  if (
                    filters.time[0] < 1 ||
                    filters.time[1] > 120 ||
                    filters.time[0] > filters.time[1]
                  ) {
                    setErrorMessage(
                      "Time must be between 1 and 120 minutes, and min cannot exceed max."
                    );
                    return;
                  }

                  setErrorMessage("");
                  setModalVisible(false);
                }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 12,
    color: "#006400",
    fontFamily: "Nunito-Bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#BCD5AC",
    borderRadius: 25,
    height: 55, //comment heigth and width out and just use padding vertical and horizontal if this is causing problems 
    width: 385,
    paddingHorizontal: 15,
    // paddingVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontFamily: "Nunito-Regular",
  },
  filtersButton: {
    backgroundColor: "#006400",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  filtersButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Nunito-Regular",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    alignItems: "center",
    paddingBottom: 12,
    width: "33.33%",
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
  },
  activeTabText: {
    fontSize: 16,
    color: "#006400",
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  content: {
    flex: 1,
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    margin: 16,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF9E6",
    borderRadius: 10,
    padding: 20,
    alignItems: "stretch",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Nunito-Bold",
    color: "#006400",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "Nunito-Bold",
    color: "#333",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    padding: 8,
    width: 80,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Nunito-Regular",
  },
  applyButton: {
    backgroundColor: "#006400",
    borderRadius: 25,
    padding: 12,
    alignItems: "center",
    marginTop: 20,
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Nunito-Bold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Nunito-Regular",
  },
});

