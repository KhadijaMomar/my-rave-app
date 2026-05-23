import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ModelSelectorProps {
  models: string[];
  selectedModel: string;
  onSelectModel: (modelName: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModel, onSelectModel }) => {
  return (
    <View style={styles.grid}>
      {models.map((model) => {
        const isActive = selectedModel === model;
        return (
          <TouchableOpacity
            key={model}
            style={[styles.badge, isActive && styles.badgeActive]}
            onPress={() => onSelectModel(model)}
          >
            <Text style={isActive ? styles.textWhite : styles.textBlack}>
              {model.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
  badge: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, backgroundColor: '#f9f9f9' },
  badgeActive: { backgroundColor: 'blue', borderColor: 'blue' },
  textWhite: { color: '#fff', fontWeight: 'bold' },
  textBlack: { color: '#333' }
});