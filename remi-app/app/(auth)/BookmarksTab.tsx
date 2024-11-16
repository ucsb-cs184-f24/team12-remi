import React from "react";
import { Text, View } from "react-native";

interface Bookmark {
  title: string;
  description: string;
}

interface BookmarksTabProps {
  searchQuery: string;
}

const BookmarksTab: React.FC<BookmarksTabProps> = ({ searchQuery }) => {
  return (
    <View>
      <Text>Display bookmark here</Text>
    </View>
  );
};

export default BookmarksTab;
