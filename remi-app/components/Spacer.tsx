import React from "react";
import { View } from "react-native";

// Define the props interface
interface SpacerProps {
  size: number; // Specify that size is a number
}

const Spacer: React.FC<SpacerProps> = ({ size }) => {
  return <View style={{ height: size }} />;
};

export default Spacer;
