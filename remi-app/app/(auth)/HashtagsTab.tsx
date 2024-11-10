import React from "react";
import { Text, View } from "react-native";
interface HashtagsTabProps {
  searchQuery: string;
}

const HashtagsTab: React.FC<HashtagsTabProps> = ({ searchQuery }) => {
  return (
    <View>
      <Text>Display hashtags results here</Text>
    </View>
  );
};

export default HashtagsTab;
