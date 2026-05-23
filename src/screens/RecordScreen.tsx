import React, { useState } from 'react';
import { View, Button, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy'; 
import { useDispatch, useSelector } from 'react-redux';
import { addRecording, removeRecording, RootState } from '../store/store';
import { AudioPlayer } from '../components/AudioPlayer'; 

export default function RecordScreen() {
  const dispatch = useDispatch();
  const recordings = useSelector((state: RootState) => state.recordings);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return Alert.alert("Refusé", "Permission requise.");

      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true 
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY
      );
      setRecording(newRecording);
    } catch (err) {
      console.error("Erreur startRecording:", err);
      Alert.alert("Échec", "Démarrage du micro impossible.");
    }
  }

  async function stopRecording() {
    if (!recording) return;
    
    try {
     
      await recording.stopAndUnloadAsync();
      
     
      let uri = recording.getURI();
      setRecording(null);
      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: false, 
        playsInSilentModeIOS: true,
      });

      if (uri) {
        const fileName = `audio-${Date.now()}.m4a`;
        
        
        const baseDir = FileSystem.documentDirectory || '';
        const permanentUri = `${baseDir}${fileName}`;
        
        const safeSourceUri = uri.startsWith('file://') ? uri : `file://${uri}`;
        const safeTargetUri = permanentUri.startsWith('file://') ? permanentUri : `file://${permanentUri}`;

       
        await FileSystem.copyAsync({
          from: safeSourceUri,
          to: safeTargetUri
        });

       
        try {
          await FileSystem.deleteAsync(safeSourceUri, { idempotent: true });
        } catch (e) {}
        
       
        dispatch(addRecording({ 
          id: Date.now().toString(), 
          name: fileName, 
          uri: safeTargetUri 
        }));

      } else {
        Alert.alert("Erreur", "Impossible de localiser le fichier temporaire.");
      }
    } catch (error: any) {
      setRecording(null);
      console.error("Erreur complète stopRecording:", error);
      Alert.alert("Erreur", `Sauvegarde impossible. Details: ${error?.message || error}`);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.recordButton, recording && styles.recordingActive]} 
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>{recording ? "🔴 STOP" : "🎙️ REC"}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Enregistrements sauvegardés :</Text>

      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.actions}>
              <AudioPlayer uri={item.uri} title="Play" /> 
              <TouchableOpacity style={styles.deleteBtn} onPress={async () => {
                await FileSystem.deleteAsync(item.uri, { idempotent: true });
                dispatch(removeRecording(item.id));
              }}>
                <Text style={{ color: '#fff' }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun enregistrement trouvé.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  recordButton: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginVertical: 20 },
  recordingActive: { backgroundColor: 'red' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#333' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  fileName: { flex: 1, fontSize: 14, color: '#444' },
  actions: { flexDirection: 'row', gap: 10 },
  deleteBtn: { backgroundColor: '#F44336', paddingHorizontal: 12, borderRadius: 5, justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: 'gray', marginTop: 20, fontStyle: 'italic' }
});