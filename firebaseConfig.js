import AsyncStorage from "@react-native-async-storage/async-storage";

import { initializeApp } from "firebase/app";

import { getReactNativePersistence, initializeAuth } from "firebase/auth";

import { getStorage } from "firebase/storage";

// Explicit modular engine targeting to bypass environment context injection

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCug_ctFs7fqrcyEtcHz_h763CVX3dyfj4",

  authDomain: "fitchoice-64b19.firebaseapp.com",

  projectId: "fitchoice-64b19",

  storageBucket: "fitchoice-64b19.firebasestorage.app",

  messagingSenderId: "734471567720",

  appId: "1:734471567720:web:233e9376b8c0f1b037bedd",

  measurementId: "G-X5DLJBP5B6",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const storage = getStorage(app);

// FIXED: Strict long-polling setup + native cache persistence layer

export const db = initializeFirestore(app, {
  forceLongPolling: true, // Force standard HTTP long-polling channels safely

  experimentalAutoDetectLongPolling: false, // Turn off auto-detection to prevent fallback to WebChannel blobs

  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager({
      persistenceProvider: getReactNativePersistence(AsyncStorage),
    }),
  }),
});
