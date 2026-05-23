import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';

interface AudioPlayerProps {
  uri: string;
  title?: string;
  backgroundColor?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ uri, title = "▶️ Écouter", backgroundColor = "#2196F3" }) => {
  const playSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, 
        playsInSilentModeIOS: true, 
      });

    
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true } 
      );

      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });

    } catch (e) {
      console.error("Erreur de lecture AudioPlayer:", e);
      Alert.alert("Erreur de lecture", "Le fichier audio est introuvable ou corrompu.");
    }
  };

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={playSound}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});