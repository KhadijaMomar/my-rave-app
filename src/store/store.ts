import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, RecordingItem } from '../types';

const initialState: AppState = {
  serverIp: '',
  serverPort: '5000',
  recordings: [],
  availableModels: [],
  selectedModel: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setServerConfig: (state, action: PayloadAction<{ ip: string; port: string }>) => {
      state.serverIp = action.payload.ip;
      state.serverPort = action.payload.port;
    },
    addRecording: (state, action: PayloadAction<RecordingItem>) => {
      state.recordings.push(action.payload);
    },
    removeRecording: (state, action: PayloadAction<string>) => {
      state.recordings = state.recordings.filter(r => r.id !== action.payload);
    },
    setAvailableModels: (state, action: PayloadAction<string[]>) => {
      state.availableModels = action.payload;
      if (action.payload.length > 0 && !state.selectedModel) {
        state.selectedModel = action.payload[0];
      }
    },
    setSelectedModel: (state, action: PayloadAction<string>) => {
      state.selectedModel = action.payload;
    }
  }
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['serverIp', 'serverPort', 'recordings']
};

const persistedReducer = persistReducer(persistConfig, appSlice.reducer);

export const { setServerConfig, addRecording, removeRecording, setAvailableModels, setSelectedModel } = appSlice.actions;
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;