export interface RecordingItem {
  id: string;
  name: string;
  uri: string;
}

export interface AppState {
  serverIp: string;
  serverPort: string;
  recordings: RecordingItem[];
  availableModels: string[];
  selectedModel: string;
}