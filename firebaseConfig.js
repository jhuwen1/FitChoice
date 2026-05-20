import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCug_ctFs7fqrcyEtcHz_h763CVX3dyfj4",
  authDomain: "fitchoice-64b19.firebaseapp.com",
  projectId: "fitchoice-64b19",
  storageBucket: "fitchoice-64b19.firebasestorage.app",
  messagingSenderId: "734471567720",
  appId: "1:734471567720:web:233e9376b8c0f1b037bedd",
  measurementId: "G-X5DLJBP5B6",
};

// 1. Initialize the Firebase App instance
const app = initializeApp(firebaseConfig);

// 2. Initialize Auth with native React Native AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 3. Initialize Storage
export const storage = getStorage(app);

// 4. Initialize Firestore
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
