# 🎙️ MyRaveApp (RAVE Voice Transformer)

Une application mobile moderne d'inférence audio et de transformation de voix en temps réel. Ce projet couple une application mobile performante avec un serveur d'inférence neuronal exécutant des modèles RAVE (Realtime Audio Variational Electra) au format ONNX.

## 🎯 Objectif du Projet

Ce projet a pour but de concevoir une architecture distribuée Client-Serveur complète :
1. **Un client mobile léger** capable de s'interfacer avec le matériel natif (microphone, stockage, haut-parleurs).
2. **Un serveur de calcul IA** déporté, résolvant les limitations de puissance des smartphones en exécutant des modèles neuronaux lourds.

---

## ✨ Fonctionnalités

- **Configuration Réseau Dynamique** : Liaison fluide et sécurisée via protocole HTTP/REST avec détection de l'adresse IP de la machine hôte.
- **Enregistrement Audio Natif** : Capture audio haute qualité à la volée directement depuis le microphone du smartphone.
- **Inférence Neuronale RAVE** : Menu interactif pour sélectionner et charger à la volée différents modèles IA (`cats.onnx`, `darbouka.onnx`, etc.) présents sur le serveur.
- **Transformation Distribuée** : Upload du signal vocal, traitement par le réseau de neurones sur la machine hôte, puis téléchargement instantané du signal modifié.
- **Lecteur Audio Avancé** : Système de lecture intégré forçant le routage vers les haut-parleurs principaux matériels d'iOS/Android, ignorant le mode silencieux.
- **Gestion Locale Persistante** : Bibliothèque d'enregistrements intégrée avec sauvegarde Redux et synchronisation des fichiers d'archive.

---

## 📂 Structure du Projet Dupliqué

L'architecture est scindée en deux dépôts indépendants pour isoler l'interface utilisateur de la logique d'inférence lourde :

### 📱 1. Client Mobile (`MyRaveApp/`)

```plaintext
MyRaveApp/
├── src/
│   ├── components/           # Composants UI réutilisables
│   │   ├── AudioPlayer.tsx   # Lecteur audio (gestion forcée des haut-parleurs)
│   │   └── ModelSelector.tsx # Sélecteur graphique pour les modèles ONNX
│   ├── navigation/           # Configuration des routes
│   │   └── AppNavigator.tsx  # Configuration du Top Tab Navigator (Swipe fluide)
│   ├── screens/              # Les 3 écrans principaux (vues)
│   │   ├── HomeScreen.tsx    # Connexion IP/Port & Clavier adapté
│   │   ├── RecordScreen.tsx  # Capture micro, gestion /legacy & stockage sécurisé
│   │   └── RaveScreen.tsx    # Vue d'inférence, gestion du focus & anti-cache
│   ├── store/                # Logique globale (State Management)
│   │   └── store.ts          # Config du store Redux Toolkit + Types associés
│   ├── types/                # Définitions strictes TypeScript
│   │   └── index.ts          # Interfaces (Recording, ServerState, etc.)
├── App.tsx                   # Point d'entrée (Wrapper des Providers Redux & Navigation)
├── app.json                  # Configuration Expo (Permissions système micro/stockage)
├── tsconfig.json             # Configuration TypeScript
└── package.json              # Dépendances et scripts du projet
```
### 📱 2. Serveur d'Inférence (RAVE-ONNX-Server/)

```Plaintext

RAVE-ONNX-Server/
├── models/                 # Banque de modèles de réseaux de neurones (.onnx)
├── server.py               # Serveur Flask, routage REST, processing Librosa & ONNX Runtime
└── received_audio.m4a      # Fichier d'échange temporaire reçu du mobile
```
### 🛠️ Technologies Utilisées
#### Application Mobile (Client)

    - React Native & Expo (SDK 52+) : Framework principal pour l'interface cross-platform.

    - Expo AV : API native de gestion du microphone et du lecteur audio.

    - Expo FileSystem (Legacy API) : Gestion du stockage binaire persistant local.

    - Redux Toolkit : Gestionnaire d'état global pour conserver la liste des clips d'un onglet à l'autre.

    - TypeScript : Typage statique pour sécuriser le code et les structures de données.

#### Serveur d'Inférence

    - Flask & Flask-CORS : Micro-framework Python pour exposer les routes d'API REST.

    - ONNX Runtime : Moteur d'exécution optimisé pour les modèles d'apprentissage profond (Deep Learning).

    - Librosa : Bibliothèque d'analyse et de traitement de signaux audio.

    - SoundFile : Gestionnaire d'écriture des matrices audio au format WAV.

 ### ⚙️ Adaptations & Correctifs Clés (server.py)

Pour interconnecter l'écosystème d'Apple (iOS) avec l'environnement de calcul Python sur macOS, plusieurs adaptations majeures ont été programmées au cœur du serveur :
1. Stabilisation CPU contre l'accélération CoreML

Sur macOS, onnxruntime sollicite nativement l'accélérateur matériel d'Apple (CoreMLExecutionProvider). Cette implémentation générait un crash immédiat lors de la construction des tenseurs audio du modèle RAVE (Error in building plan), empêchant la finalisation du fichier.

    Correction : Forçage de l'allocation des processus sur le processeur générique (CPUExecutionProvider).
```bash
    # Mode sécurisé et stable sur Mac pour RAVE
    sess = rt.InferenceSession(
    os.path.join(model_path, CURRENT_MODEL),
    providers=['CPUExecutionProvider']
)
```

2. Standardisation de l'encodage WAV (PCM 16-bit)

La bibliothèque de traitement soundfile génère par défaut des fichiers WAV encodés en Float 32/64-bit. iOS bloque et considère ces flux comme corrompus ou de structure inconnue (Error: An unknown).

    Correction : Conversion stricte du signal audio de sortie au format standardisé PCM 16-bit entier.

```bash
  # Exportation audio validée pour le décodeur matériel iOS
sf.write('transformed_audio.wav', res[0].squeeze(), 44100, subtype='PCM_16')
```
### 🚀 Installation et Lancement
1. Lancement du Serveur IA (Sur le Mac)
```bash
cd RAVE-ONNX-Server
```
#### Installer les dépendances Python requises
pip install flask flask-cors onnxruntime librosa soundfile
python server.py

Note l'IP s'affichant dans la console (ex: 192.168.1.65:8000).
2. Lancement du Client Mobile (Sur le Téléphone)
```bash
cd MyRaveApp
npm install
npx expo start
```
Scanne le QR Code généré via ton application Expo Go (iOS/Android).

### Mode d'Emploi

1. Onglet Home : Renseigne l'adresse IP et le port de ton Mac, puis clique sur Tester la connexion.

2. Onglet Micro : Clique sur 🎙️ REC, parle, puis clique sur 🔴 STOP. Ton enregistrement apparaît instantanément dans ta liste locale.

3. Onglet RAVE : Sélectionne ton style neuronal (ex: darbouka.onnx), puis appuie sur Appliquer RAVE en face de ta piste vocale.

4. Une fois le calcul achevé, le bouton vert 🔊 ÉCOUTER LE SON TRANSFORMÉ apparaît pour écouter la métamorphose de ta voix !