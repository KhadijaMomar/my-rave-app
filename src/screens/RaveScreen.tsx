import React, { useState, useCallback } from 'react'; 
import { View, Button, ActivityIndicator, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setAvailableModels, setSelectedModel } from '../store/store';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from '@react-navigation/native'; 
import { ModelSelector } from '../components/ModelSelector';
import { AudioPlayer } from '../components/AudioPlayer';

export default function RaveScreen() {
  const dispatch = useDispatch();
  const { serverIp, serverPort, recordings, availableModels, selectedModel } = useSelector((state: RootState) => state);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [resultUri, setResultUri] = useState<string | null>(null);

  const baseUrl = `http://${serverIp}:${serverPort}`;

 
  useFocusEffect(
    useCallback(() => {
      if (serverIp && serverPort) {
        console.log("Tentative de récupération des modèles sur :", `${baseUrl}/getmodels`);
        fetch(`${baseUrl}/getmodels`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              dispatch(setAvailableModels(data));
            }
          })
          .catch(err => console.log("Erreur de récupération des modèles:", err));
      }
    }, [serverIp, serverPort])
  );

  const changeModelOnServer = async (modelName: string) => {
    try {
      const response = await fetch(`${baseUrl}/selectModel/${modelName}`);
      if (response.ok) {
        dispatch(setSelectedModel(modelName));
        Alert.alert("Modèle changé", `Le modèle ${modelName} est maintenant actif.`);
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible de changer de modèle.");
    }
  };

const startRaveTransformation = async (sourceUri: string) => {
    if (!serverIp) return Alert.alert("Erreur", "Configurez l'IP d'abord sur Home.");
    if (!selectedModel) return Alert.alert("Modèle manquant", "Sélectionnez un modèle.");

    setLoading(true);
    setResultUri(null);

    try {
     
      await FileSystem.uploadAsync(`${baseUrl}/upload`, sourceUri, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      });

     
      const baseDir = FileSystem.documentDirectory || '';
      
    
      const targetPath = `${baseDir}rave_output_${Date.now()}.wav`;
      
     
      const safeTargetPath = targetPath.startsWith('file://') ? targetPath : `file://${targetPath}`;

      const downloadResult = await FileSystem.downloadAsync(
        `${baseUrl}/download`, 
        safeTargetPath
      );
      
     
      if (downloadResult.status === 200) {
        setResultUri(downloadResult.uri);
        Alert.alert("Succès", "Audio transformé prêt !");
      } else {
        Alert.alert("Échec", "Le serveur n'a pas pu renvoyer le fichier correctement.");
      }
    } catch (error) {
      console.error("Erreur de transformation:", error);
      Alert.alert("Échec", "Le serveur a rencontré un problème lors du calcul.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>1. Sélectionnez un modèle RAVE :</Text>
      
      <ModelSelector 
        models={availableModels} 
        selectedModel={selectedModel} 
        onSelectModel={changeModelOnServer} 
      />

      <Text style={styles.title}>2. Choisissez un clip à transformer :</Text>
      <FlatList
        data={recordings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ flex: 1 }} numberOfLines={1}>{item.name}</Text>
            <Button title="Appliquer RAVE" onPress={() => startRaveTransformation(item.uri)} disabled={loading} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.info}>Aucun clip. Enregistrez d'abord un son au micro.</Text>}
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="blue" />
          <Text style={styles.loaderText}>Traitement neuronal RAVE en cours...</Text>
        </View>
      )}

      {resultUri && !loading && (
        <View style={styles.outputBox}>
          <AudioPlayer uri={resultUri} title="🔊 ÉCOUTER LE SON TRANSFORMÉ" backgroundColor="green" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 15, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  info: { color: 'gray', fontStyle: 'italic', marginTop: 10, textAlign: 'center' },
  loader: { marginVertical: 30, alignItems: 'center' },
  loaderText: { marginTop: 10, color: 'blue', fontWeight: 'bold' },
  outputBox: { marginTop: 25, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 20 }
});