import React, { useState } from "react";
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import Slider from "@react-native-community/slider";
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
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedTags, setSelectedTags] = useState<
    { id: number; name: string }[]
  >([]);
  const [filters, setFilters] = useState<{
    price: [number, number];
    difficulty: [number, number];
    time: [number, number];
  }>({
    price: [1, 100], // Initialize as tuple
    difficulty: [0, 5], // Initialize as tuple
    time: [1, 120], // Initialize as tuple
  });
  const [modalVisible, setModalVisible] = useState(false);

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

        {/* Search Bar with Filters Button */}
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
            onChangeText={setSearchQuery}
          />
          {activeTab === "posts" && (
            <TouchableOpacity
              style={styles.filtersButton}
              onPress={() => setModalVisible(true)}>
              <Text style={styles.filtersButtonText}>+ Filters</Text>
            </TouchableOpacity>
          )}
        </View>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          {/* Dismiss keyboard on click outside */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Adjust Filters</Text>

                {/* Error Message */}
                {errorMessage !== "" && (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                )}

                {/* Price Filter */}
                <Text>Price Range ($/serving):</Text>
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
                  <Text>to</Text>
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

                {/* Difficulty Filter */}
                <Text>Difficulty (0-5):</Text>
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
                  <Text>to</Text>
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

                {/* Time Filter */}
                <Text>Time (mins):</Text>
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
                  <Text>to</Text>
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

                {/* Apply Button */}
                <TouchableOpacity
                  style={styles.closeButton}
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

                    // Clear error message and apply filters
                    setErrorMessage("");
                    setModalVisible(false);
                  }}>
                  <Text style={styles.closeButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
        {/* Display Applied Filters */}
        {activeTab === "posts" && (
          <View style={styles.appliedFiltersContainer}>
            <Text style={styles.appliedFilterText}>
              Price: ${filters.price[0]} - ${filters.price[1]}
            </Text>
            <Text style={styles.appliedFilterText}>
              Difficulty: {filters.difficulty[0]} - {filters.difficulty[1]}
            </Text>
            <Text style={styles.appliedFilterText}>
              Time: {filters.time[0]} - {filters.time[1]} mins
            </Text>
          </View>
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
        {activeTab === "posts" && (
          <PostsTab
            searchQuery={searchQuery}
            filters={filters} // Pass filters as props to PostsTab
          />
        )}
        {activeTab === "users" && <UsersTab searchQuery={searchQuery} />}
        {activeTab === "hashtags" && (
          <HashtagsTab selectedTags={selectedTags} />
        )}
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
  filtersContainer: {
    flexDirection: "column",
    marginVertical: 10,
  },
  filterButton: {
    backgroundColor: "#E6F3E6",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  filterText: {
    fontSize: 14,
    color: "#333",
  },
  filtersButton: {
    backgroundColor: "#006400",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  filtersButtonText: {
    color: "#FFF",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    padding: 8,
    width: 60,
    textAlign: "center",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#006400",
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  appliedFiltersContainer: {
    padding: 10,
    backgroundColor: "#E6F3E6",
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  appliedFilterText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
});
