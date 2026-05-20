import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";

const THEME = {
  bg: "#0f172a",
  surface: "#1e293b",
  primary: "#f97316",
  text: "#ffffff",
  muted: "#94a3b8",
  border: "#334155",
};

export default function MacroScanner() {
  const { user } = useAuth();
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [selectedMode, setSelectedMode] = useState(null); 
  const [isScanning, setIsScanning] = useState(false);   
  const [isLaunching, setIsLaunching] = useState(false); 
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScan = async ({ data }) => {
    setScanned(true);
    setLoading(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}.json`);
      const json = await res.json();
      if (json.status === 1) {
        const p = json.product;
        const nuts = p.nutriments;
        const food = {
          name: p.product_name || "Unknown Item",
          calories: Math.round(nuts["energy-kcal_serving"] || nuts["energy-kcal_100g"] || 0),
        };

        if (selectedMode === "intake") {
          await addDoc(collection(db, "users", user.uid, "intakes"), {
            ...food,
            date: new Date().toISOString().split("T")[0],
            timestamp: serverTimestamp(),
          });
          Alert.alert("Logged!", `${food.name} added.`);
          router.push("/dashboard");
        } else {
          Alert.alert(food.name, `Calories: ${food.calories}kcal`);
          setScanned(false);
        }
      } else {
        Alert.alert("Not Found", "Item not in database.");
        setScanned(false);
      }
    } catch (e) {
      Alert.alert("Network Error", "Please try again.");
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const startCameraSequence = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      setIsScanning(true);
    }, 800);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Camera access required.</Text>
        <Pressable onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnT}>Enable</Text>
        </Pressable>
      </View>
    );
  }

  if (!isScanning) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>
            Fit<Text style={{ color: THEME.primary }}>Choice</Text>
          </Text>
        </View>

        <View style={styles.main}>
          <Text style={styles.title}>Select Scan Mode</Text>

          <View style={styles.menu}>
            <Pressable
              style={({ pressed }) => [
                styles.menuCard,
                { 
                  borderColor: selectedMode === "intake" ? THEME.primary : THEME.border,
                  transform: [{ scale: pressed ? 0.96 : 1 }] 
                },
              ]}
              onPress={() => setSelectedMode("intake")}
            >
              <View style={[
                  styles.iconBox, 
                  { backgroundColor: selectedMode === "intake" ? THEME.primary : THEME.border }
              ]}>
                 <MaterialCommunityIcons 
                    name="food-apple" 
                    size={28} 
                    color={selectedMode === "intake" ? "#fff" : THEME.muted} 
                 />
              </View>
              <View>
                <Text style={[styles.menuT, selectedMode === "intake" && {color: THEME.primary}]}>Scan for Intake</Text>
                <Text style={styles.menuS}>Log to dashboard</Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuCard,
                { 
                  borderColor: selectedMode === "info" ? THEME.primary : THEME.border,
                  transform: [{ scale: pressed ? 0.96 : 1 }]
                },
              ]}
              onPress={() => setSelectedMode("info")}
            >
              <View style={[
                  styles.iconBox, 
                  { backgroundColor: selectedMode === "info" ? THEME.primary : THEME.border }
              ]}>
                 <MaterialCommunityIcons 
                    name="magnify-plus" 
                    size={28} 
                    color={selectedMode === "info" ? "#fff" : THEME.muted} 
                 />
              </View>
              <View>
                <Text style={[styles.menuT, selectedMode === "info" && {color: THEME.primary}]}>Nutrition Info</Text>
                <Text style={styles.menuS}>Quick check</Text>
              </View>
            </Pressable>
          </View>

          <Pressable 
            disabled={!selectedMode || isLaunching}
            onPress={startCameraSequence}
            style={({ pressed }) => [
              styles.startBtn, 
              { 
                  opacity: selectedMode ? 1 : 0.4,
                  transform: [{ scale: pressed && !isLaunching ? 0.98 : 1 }] 
              }
            ]}
          >
            {isLaunching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnT}>Open Camera</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Text style={styles.backT}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleScan}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "upc_a"] }}
      >
        <View style={styles.overlay}>
          <View style={styles.reticle} />
          {loading && <ActivityIndicator color={THEME.primary} size="large" style={{ marginTop: 20 }} />}
          <Pressable onPress={() => setIsScanning(false)} style={styles.cancelBtn}>
            <Text style={styles.btnT}>Back to Menu</Text>
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 35,
    color: "#fff",
    fontWeight: "bold",
  },
  main: {
    flex: 1, 
    justifyContent: "center",
  },
  center: {
    flex: 1,
    backgroundColor: THEME.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: THEME.muted,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  menu: {
    marginBottom: 15,
  },
  menuCard: {
    flexDirection: "row",
    backgroundColor: THEME.surface,
    padding: 20,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuT: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  menuS: {
    color: THEME.muted,
    fontSize: 13,
  },
  startBtn: {
    backgroundColor: THEME.primary,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  reticle: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: THEME.primary,
    borderRadius: 40,
  },
  cancelBtn: {
    marginTop: 60,
    backgroundColor: THEME.surface,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
  },
  btn: {
    backgroundColor: THEME.primary,
    padding: 15,
    borderRadius: 12,
  },
  btnT: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backT: {
    color: THEME.muted,
    textAlign: "center",
    marginTop: 30,
    fontSize: 15,
  },
  msg: {
    color: "#fff",
    marginBottom: 20,
  },
});