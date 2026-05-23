import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setServerConfig, RootState } from '../store/store';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const config = useSelector((state: RootState) => state);
  
  const [ip, setIp] = useState<string>(config.serverIp);
  const [port, setPort] = useState<string>(config.serverPort);

  const handleConnect = async () => {
    if (!ip.trim() || !port.trim()) {
      Alert.alert("Champs requis", "Veuillez entrer une adresse IP et un Port.");
      return;
    }
    
    try {
      const response = await fetch(`http://${ip}:${port}/`);
      const text = await response.text();
      
      if (response.ok) {
        dispatch(setServerConfig({ ip, port }));
        Alert.alert("Connexion active", `Serveur joint avec succès ! Réponse : "${text}"`);
      }
    } catch (error) {
      Alert.alert("Erreur réseau", "Impossible de joindre le serveur Flask.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.title}>Configuration Serveur RAVE</Text>
      <Text style={styles.label}>Adresse IP du PC :</Text>
      <TextInput style={styles.input} value={ip} onChangeText={setIp} placeholder="Ex: 192.168.1.50" keyboardType="numbers-and-punctuation" autoCapitalize="none" autoCorrect={false} />
      <Text style={styles.label}>Port Flask :</Text>
      <TextInput style={styles.input} value={port} onChangeText={setPort} keyboardType="numeric" />
      <Button title="Tester la connexion" onPress={handleConnect} color="blue" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 25, padding: 10, fontSize: 16, backgroundColor: '#fff', borderRadius: 4 },
  label: { fontWeight: 'bold', color: '#333', marginBottom: 5 }
});