import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "@firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
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

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const storage = getStorage(app);

export const db = initializeFirestore(app, {
  forceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager({
      persistenceProvider: getReactNativePersistence(AsyncStorage),
    }),
  }),
});
