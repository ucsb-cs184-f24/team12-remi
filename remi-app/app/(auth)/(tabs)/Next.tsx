// App.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import Slider from '@react-native-community/slider'; 
import { Ionicons } from '@expo/vector-icons';
import Spacer from '@/components/Spacer';

export default function App() {
  const [price, setPrice] = useState<number>(1.5);
  const [difficulty, setDifficulty] = useState<number>(4.5);
  const [time, setTime] = useState<number>(30);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.justifytop_container}>
      <Spacer size={60} />
      <TouchableOpacity  style={styles.iconContainer}>
                                    <Ionicons name="camera-outline" size={100} color="#0D5F13" />
                                </TouchableOpacity>

       

        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Price: ${price.toFixed(2)}/Serving</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={0.1}
            value={price}
            onValueChange={(value) => setPrice(value)}
            minimumTrackTintColor="#0D5F13"
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Difficulty: {difficulty.toFixed(1)}/5</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5}
            step={0.1}
            value={difficulty}
            onValueChange={(value) => setDifficulty(value)}
            minimumTrackTintColor="#0D5F13"
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Time: {time} min</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={120}
            step={5}
            value={time}
            onValueChange={(value) => setTime(value)}
            minimumTrackTintColor="#0D5F13"
          />
          <Text style={styles.subLabel}>
            {Math.floor(time * 0.67)} active minutes +{' '}
            {Math.ceil(time * 0.33)} passive minutes
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ...StyleSheet.flatten({
    imagestyle: {
      width: 200,
      height: 200,
      alignSelf: 'center',
      borderWidth: 4,
      borderRadius: 4,
      borderColor: '#0D5F13',
      marginVertical: 20,
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      paddingBottom: 20,
    },
    buttonContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    justifytop_container: {
      flex: 1,
      backgroundColor: '#FFF9E6',
      padding: 20,
      justifyContent: 'flex-start',
    },
    iconContainer: {
      justifyContent: 'center',
      alignSelf: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: '#BCD5AC',
      padding: 35,
      width: 200,
      height: 200,
      borderRadius: 100,
    },
    changeImageButton: {
      alignSelf: 'center',
      backgroundColor: '#0D5F13',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginBottom: 20,
    },
    changeImageText: {
      color: '#FFF',
      fontSize: 16,
      fontFamily: 'Nunito_600SemiBold',
    },
    sliderContainer: {
      width: '90%',
      marginVertical: 15,
      alignSelf: 'center',
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#2f4f2f',
    },
    slider: {
      width: '100%',
      height: 40,
    },
    subLabel: {
      textAlign: 'center',
      marginTop: 5,
      fontSize: 14,
      color: '#556b2f',
    },
  }),
});
