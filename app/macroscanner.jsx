import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";

const THEME = {
  bg: "#090d16",
  surface: "#18253a",
  primary: "#F97316",
  text: "#FFFFFF",
  muted: "#7E7A93",
  border: "#1e293b",
  errorBg: "#2D191E",
  errorText: "#FF6B6B",
  success: "#10B981",
  overlayBg: "rgba(9, 13, 22, 0.95)",
};

const EDAMAM_CONFIG = {
  APP_ID: '5a3afdaa',
  APP_KEY: '904218539f69b4353b6eac1a12259364',
};

const CAROUSEL_IMAGES = [
  require("../assets/images/body5.png"),
  require("../assets/images/body1.png"), 
  require("../assets/images/body2.png"),
  require("../assets/images/body3.png"),
  require("../assets/images/body4.png"),
];

const GEMINI_API_KEY = "AQ.Ab8RN6K_nSlLI9UPT5-S0SDDHtpQhuOVOlr5rhXbpLPQbyAgdA"; 

export default function MacroScanner() {
  const { user } = useAuth();
  const router = useRouter();
  const cameraRef = useRef(null);

  const flatListRef = useRef(null);
const [activeIndex, setActiveIndex] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    let nextIndex = (activeIndex + 1) % CAROUSEL_IMAGES.length;
    setActiveIndex(nextIndex);
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  }, 3000);

  return () => clearInterval(timer);
}, [activeIndex]);

  const [permission, requestPermission] = useCameraPermissions();
  const [selectedMode, setSelectedMode] = useState(null);
  
  const [isScanning, setIsScanning] = useState(false);   
  const [isLaunching, setIsLaunching] = useState(false); 
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [nutrition, setNutrition] = useState(null);
  const [foodInput, setFoodInput] = useState('');
  const [error, setError] = useState('');

  const logFoodToDashboard = async () => {
    if (!nutrition) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "users", user.uid, "intakes"), {
        name: nutrition.food,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        sugar: nutrition.sugar,
        date: new Date().toISOString().split("T")[0],
        timestamp: serverTimestamp(),
      });
      
      setShowSuccessModal(true);
    } catch (e) {
      Alert.alert("Database Error", "Failed to commit ingestion payload.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissSuccess = () => {
    setShowSuccessModal(false);
    clearDataMatrix();
    setIsScanning(false);
    setSelectedMode(null);
    router.push("/dashboard");
  };

  const handleBarcodeScan = async ({ data }) => {
    if (scanned || loading) return; 

    setScanned(true);
    setLoading(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}.json`);
      const json = await res.json();
      
      if (json.status === 1) {
        const p = json.product;
        const nuts = p.nutriments;
        
        const barcodeResult = {
          food: p.product_name || "Unknown Item",
          calories: Math.round(nuts["energy-kcal_serving"] || nuts["energy-kcal_100g"] || 0),
          protein: Math.round(nuts["proteins_serving"] || nuts["proteins_100g"] || 0),
          carbs: Math.round(nuts["carbohydrates_serving"] || nuts["carbohydrates_100g"] || 0),
          fat: Math.round(nuts["脂肪_serving"] || nuts["fat_serving"] || nuts["fat_100g"] || 0),
          fiber: Math.round(nuts["fiber_serving"] || nuts["fiber_100g"] || 0),
          sugar: Math.round(nuts["sugars_serving"] || nuts["sugars_100g"] || 0),
        };

        setNutrition(barcodeResult);
      } else {
        Alert.alert("Ecosystem Miss", "Barcode signature not found.");
        setScanned(false);
      }
    } catch (e) {
      Alert.alert("Pipeline Error", "Network dropped during scanning pass.");
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const executeVisionAnalysis = async () => {
    if (!cameraRef.current || loading) {
      Alert.alert("Camera Error", "Viewfinder device layout is still initializing.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const photoOptions = {
        quality: 0.35,
        base64: true,
      };
      
      const photo = await cameraRef.current.takePictureAsync(photoOptions);

      if (!photo || !photo.base64) {
        throw new Error("Viewfinder frame asset string collection dropped.");
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const payload = {
        contents: [
          {
            parts: [
              {
                text: "You are a professional expert nutritionist engine. Analyze the meal plate or food shown in this image. Estimate its weights/portions and compute cumulative macronutrients. You must answer ONLY with a raw single JSON object. No markdown, no backticks. Schema structure: {\"food\": \"string name of dish\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number, \"fiber\": number, \"sugar\": number}."
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: photo.base64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const jsonResult = await response.json();

      if (jsonResult.error) {
        throw new Error(jsonResult.error.message || "API Gateway Rejected Pass.");
      }

      const rawTextResponse = jsonResult.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawTextResponse) {
        throw new Error("AI core output format empty or unreadable.");
      }

      const parsedNutrition = JSON.parse(rawTextResponse.trim());
      
      setNutrition({
        food: parsedNutrition.food || "Custom Sample Combo",
        calories: Math.round(parsedNutrition.calories || 0),
        protein: Math.round(parsedNutrition.protein || 0),
        carbs: Math.round(parsedNutrition.carbs || 0),
        fat: Math.round(parsedNutrition.fat || 0),
        fiber: Math.round(parsedNutrition.fiber || 0),
        sugar: Math.round(parsedNutrition.sugar || 0),
      });

    } catch (err) {
      console.error(err);
      setError(err.message || 'AI Core timed out during pixel matrix processing.');
      Alert.alert("Scan Interrupted", "The AI model couldn't map the meal matrix safely. Ensure lighting is clean.");
    } finally {
      setLoading(false);
    }
  };

  const executeManualQuery = async () => {
    if (!foodInput.trim()) {
      Alert.alert('Empty Entry', 'Please state items explicitly (e.g., "100g rice").');
      return;
    }

    setLoading(true);
    setError('');
    setNutrition(null);

    try {
      const url = `https://api.edamam.com/api/nutrition-data?app_id=${EDAMAM_CONFIG.APP_ID}&app_key=${EDAMAM_CONFIG.APP_KEY}&ingr=${encodeURIComponent(
        foodInput
      )}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.ingredients || !data.ingredients[0] || !data.ingredients[0].parsed) {
        Alert.alert('Analysis Failed', 'Could not accurately identify entry item.');
        setLoading(false);
        return;
      }

      const parsed = data.ingredients[0].parsed[0];
      const nutrients = parsed?.nutrients;

      if (!nutrients) {
        Alert.alert('Metrics Absent', 'Nutritional fields unreadable.');
        setLoading(false);
        return;
      }

      setNutrition({
        food: parsed.food || foodInput,
        calories: Math.round(nutrients.ENERC_KCAL?.quantity || 0),
        protein: Math.round(nutrients.PROCNT?.quantity || 0),
        carbs: Math.round(nutrients.CHOCDF?.quantity || 0),
        fat: Math.round(nutrients.FAT?.quantity || 0),
        fiber: Math.round(nutrients.FIBTG?.quantity || 0),
        sugar: Math.round(nutrients.SUGAR?.quantity || 0),
      });
    } catch (err) {
      setError('Edamam API processing timeout.');
    } finally {
      setLoading(false);
    }
  };

  const clearDataMatrix = () => {
    setFoodInput('');
    setNutrition(null);
    setError('');
    setScanned(false);
  };

  const handleActionExecution = () => {
    if (selectedMode === "manual" || selectedMode === "ai_vision") {
      setIsScanning(true);
      return;
    }
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      setIsScanning(true);
    }, 800);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Camera hardware access verification required.</Text>
        <Pressable onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnT}>Enable Permissions</Text>
        </Pressable>
      </View>
    );
  }

if (!isScanning) {
    return (
      <View style={styles.container}>
        <View style={styles.topHeaderWrapper}>
          <View style={styles.inlineHeaderContainer}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={[styles.backArrowText]}>❮</Text>
            </Pressable>
            <Text style={styles.logoQuestStyle}>
              <Text style={{ color: THEME.primary }}>Macro</Text> <Text style={{ color: "#ffffff" }}>Tracker</Text>
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <FlatList
            ref={flatListRef}
            data={CAROUSEL_IMAGES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image 
                source={item} 
                style={[styles.headerFeatureImage, { width: 342 }]} 
                resizeMode="cover"
              />
            )}
          />
        </View>

        <View style={styles.centerModule}>
          <View style={styles.headerCentered}>
            <Text style={styles.titleCentered}>Select Tracking Methodology</Text>
            
            <MetricDisclaimer />
          </View>

          <View style={styles.menu}>
            <Pressable
              style={[styles.menuCard, selectedMode === "barcode" && { borderColor: THEME.primary }]}
              onPress={() => { setSelectedMode("barcode"); clearDataMatrix(); }}
            >
              <View style={[styles.iconBox, { backgroundColor: selectedMode === "barcode" ? THEME.primary : THEME.border }]}>
                 <MaterialCommunityIcons name="barcode-scan" size={22} color={selectedMode === "barcode" ? "#fff" : THEME.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuT, selectedMode === "barcode" && {color: THEME.primary}]}>Barcode Scanner</Text>
                <Text style={styles.menuS}>Extract full nutrition details instantly via barcode tracking</Text>
              </View>
            </Pressable>

            <Pressable
              style={[styles.menuCard, selectedMode === "ai_vision" && { borderColor: THEME.primary }]}
              onPress={() => { setSelectedMode("ai_vision"); clearDataMatrix(); }}
            >
              <View style={[styles.iconBox, { backgroundColor: selectedMode === "ai_vision" ? THEME.primary : THEME.border }]}>
                 <MaterialCommunityIcons name="eye-circle" size={22} color={selectedMode === "ai_vision" ? "#fff" : THEME.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuT, selectedMode === "ai_vision" && {color: THEME.primary}]}>AI Vision Engine</Text>
                <Text style={styles.menuS}>Take a snap of your custom meal plate to estimate macros</Text>
              </View>
            </Pressable>

            <Pressable
              style={[styles.menuCard, selectedMode === "manual" && { borderColor: THEME.primary }]}
              onPress={() => { setSelectedMode("manual"); clearDataMatrix(); }}
            >
              <View style={[styles.iconBox, { backgroundColor: selectedMode === "manual" ? THEME.primary : THEME.border }]}>
                 <MaterialCommunityIcons name="notebook-edit" size={22} color={selectedMode === "manual" ? "#fff" : THEME.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuT, selectedMode === "manual" && {color: THEME.primary}]}>Manual logging</Text>
                <Text style={styles.menuS}>Directly type foods & custom amounts to logs</Text>
              </View>
            </Pressable>
          </View>

          <Pressable 
            disabled={!selectedMode || isLaunching}
            onPress={handleActionExecution}
            style={[styles.startBtn, { opacity: selectedMode ? 1 : 0.4 }]}
          >
            {isLaunching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnT}>
                {selectedMode === "manual" ? "Open Manual Terminal" : selectedMode === "ai_vision" ? "Launch Vision Core" : "Initialize Hardware Camera"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  if (selectedMode === "manual") {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: 40 }]}>
          <Pressable 
            onPress={() => { setIsScanning(false); clearDataMatrix(); }} 
            style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 15 }}
          >
            <Ionicons name="chevron-back" size={14} color={THEME.muted} style={{ marginRight: 4 }} />
            <Text style={styles.subHeader}>Back to Selector Matrix</Text>
          </Pressable>
          <Text style={styles.logo}>Manual Ingestion Terminal</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.searchSection}>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150g chicken breast, 2 eggs..."
              placeholderTextColor="#545066"
              value={foodInput}
              onChangeText={setFoodInput}
              editable={!loading}
            />
            <Pressable
              style={[styles.startBtn, { marginTop: 0, height: 50 }, loading && { backgroundColor: THEME.border }]}
              onPress={executeManualQuery}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnT}>Analyze Food Matrix</Text>}
            </Pressable>
          </View>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          {nutrition && <MacroNutritionDisplay nutrition={nutrition} onClear={clearDataMatrix} onLog={logFoodToDashboard} actionLoading={loading} />}

          {!nutrition && !loading && (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 45, marginBottom: 12 }}>🥗</Text>
              <Text style={styles.menuT}>Awaiting Text Inputs</Text>
              <Text style={[styles.menuS, { textAlign: 'center', marginTop: 5 }]}>Include units like grams or cups for precise calculations.</Text>
            </View>
          )}
        </ScrollView>

        <SuccessFeedbackModal 
          visible={showSuccessModal} 
          foodName={nutrition?.food} 
          onDismiss={handleDismissSuccess} 
        />
      </View>
    );
  }

  if (selectedMode === "ai_vision") {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        {!nutrition ? (
          <View style={StyleSheet.absoluteFillObject}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.overlay}>
              <View style={[styles.header, { position: 'absolute', top: 60, left: 24, right: 24, zIndex: 10 }]}>
                <Pressable 
                  onPress={() => { setIsScanning(false); setSelectedMode(null); clearDataMatrix(); }} 
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Ionicons name="chevron-back" size={14} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={[styles.subHeader, { color: '#FFF' }]}>Abort Vision Session</Text>
                </Pressable>
              </View>

              <View style={[styles.reticle, { borderRadius: 32 }]} />
              <Text style={[styles.title, { color: '#FFF', marginTop: 24, textAlign: 'center', paddingHorizontal: 20 }]}>
                Center Target Food Portion on Viewfinder
              </Text>

              {error ? <View style={[styles.errorBox, { marginHorizontal: 24, marginTop: 10 }]}><Text style={styles.errorText}>{error}</Text></View> : null}

              <Pressable
                style={[styles.startBtn, { width: '75%', backgroundColor: THEME.primary }]}
                onPress={executeVisionAnalysis}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnT}>Capture & Analyze</Text>}
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[styles.container, { paddingTop: 60 }]}>
            <View style={styles.header}>
              <Pressable 
                onPress={clearDataMatrix} 
                style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 15 }}
              >
                <Ionicons name="chevron-back" size={14} color={THEME.muted} style={{ marginRight: 4 }} />
                <Text style={styles.subHeader}>Rescan Another Item</Text>
              </Pressable>
              <Text style={styles.logo}>AI Vision Diagnostics</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <MacroNutritionDisplay nutrition={nutrition} onClear={clearDataMatrix} onLog={logFoodToDashboard} actionLoading={loading} />
            </ScrollView>
          </View>
        )}

        <SuccessFeedbackModal 
          visible={showSuccessModal} 
          foodName={nutrition?.food} 
          onDismiss={handleDismissSuccess} 
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      {!nutrition ? (
        <View style={StyleSheet.absoluteFillObject}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "upc_a"],
            }}
          />
          <View style={styles.overlay}>
            <View style={[styles.header, { position: 'absolute', top: 60, left: 24, right: 24, zIndex: 10 }]}>
              <Pressable 
                onPress={() => { setIsScanning(false); setSelectedMode(null); }} 
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="chevron-back" size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={[styles.subHeader, { color: '#FFF' }]}>Abort Scanning</Text>
              </Pressable>
            </View>

            <View style={styles.reticle} />
            <Text style={[styles.title, { color: '#FFF', marginTop: 24, textAlign: 'center', paddingHorizontal: 20 }]}>
              Align Product Barcode Within Frame
            </Text>
            {loading && <ActivityIndicator color={THEME.primary} size="large" style={{ marginTop: 20 }} />}
          </View>
        </View>
      ) : (
        <View style={[styles.container, { paddingTop: 60 }]}>
          <View style={styles.header}>
            <Pressable 
              onPress={clearDataMatrix} 
              style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 15 }}
            >
              <Ionicons name="chevron-back" size={14} color={THEME.muted} style={{ marginRight: 4 }} />
              <Text style={styles.subHeader}>Rescan Another Item</Text>
            </Pressable>
            <Text style={styles.logo}>Barcode Analysis Factsheet</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <MacroNutritionDisplay nutrition={nutrition} onClear={clearDataMatrix} onLog={logFoodToDashboard} actionLoading={loading} />
          </ScrollView>
        </View>
      )}

      <SuccessFeedbackModal 
        visible={showSuccessModal} 
        foodName={nutrition?.food} 
        onDismiss={handleDismissSuccess} 
      />
    </View>
  );
}

function MetricDisclaimer() {
  return (
    <View style={styles.disclaimerContainer}>
      <MaterialCommunityIcons name="information-outline" size={13} color={THEME.muted} />
      <Text style={styles.disclaimerText}>
        AI metrics are predictive models. Exact serving yields are approximations only.
      </Text>
    </View>
  );
}

function SuccessFeedbackModal({ visible, foodName, onDismiss }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.successCard}>
          <View style={styles.successIconRing}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={44} color={THEME.success} />
          </View>
          
          <Text style={styles.successTitle}>Ingestion Successful</Text>
          <Text style={styles.successSubtitle}>
            <Text style={styles.highlightedFood}>{foodName || "Item"}</Text> has been committed directly to your fitness mainframe logs.
          </Text>

          <Pressable onPress={onDismiss} style={styles.successDismissBtn}>
            <Text style={styles.successDismissBtnText}>Return to Dashboard</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function MacroNutritionDisplay({ nutrition, onClear, onLog, actionLoading }) {
  return (
    <View style={styles.resultsContainer}>
      <View style={styles.foodHeader}>
        <Text style={styles.foodName}>{nutrition.food}</Text>
        <Pressable onPress={onClear}>
          <Text style={{ color: THEME.muted, fontWeight: '700', fontSize: 13 }}>Clear Facts</Text>
        </Pressable>
      </View>

      <View style={styles.macrosGrid}>
        <View style={styles.statCard}>
          <Text style={[styles.macroValue, { color: '#FBBF24' }]}>{nutrition.calories}</Text>
          <Text style={styles.macroLabel}>Energy</Text>
          <Text style={styles.macroUnit}>kcal</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.macroValue, { color: '#3B82F6' }]}>{nutrition.protein}</Text>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroUnit}>grams</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.macroValue, { color: '#A855F7' }]}>{nutrition.carbs}</Text>
          <Text style={styles.macroLabel}>Carbohydrates</Text>
          <Text style={styles.macroUnit}>grams</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.macroValue, { color: '#F97316' }]}>{nutrition.fat}</Text>
          <Text style={styles.macroLabel}>Lipids / Fat</Text>
          <Text style={styles.macroUnit}>grams</Text>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.detailsTitle}>Trace Elements</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Dietary Plant Fiber</Text>
          <Text style={styles.detailValue}>{nutrition.fiber} g</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Refined Organic Sugars</Text>
          <Text style={styles.detailValue}>{nutrition.sugar} g</Text>
        </View>
      </View>

      <Pressable 
        style={[styles.startBtn, { backgroundColor: THEME.success, flexDirection: 'row', gap: 8 }]} 
        onPress={onLog}
        disabled={actionLoading}
      >
        {actionLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons name="database-plus" size={20} color="#fff" />
            <Text style={styles.btnT}>Log Intake to Dashboard</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
    paddingHorizontal: 24,
    justifyContent: "center", 
  },
  topHeaderWrapper: {
    position: "absolute",
    top: 60,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  inlineHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 48,
  },
  headerFeatureImage: {
    width: "100%",
    height: 120,
    borderRadius: 20,
    marginTop: 16,
  },
  questRowBackBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoQuestStyle: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  centerModule: {
    width: "100%",
    marginTop: 160, 
  },
  headerCentered: {
    alignItems: "center",
    marginBottom: 20,
  },
  titleCentered: {
    color: THEME.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: "center",
  },
  header: {
    marginBottom: 20,
  },
  subHeader: { 
    color: THEME.muted, 
    fontSize: 13, 
    fontWeight: "500" 
  },
  logo: {
    fontSize: 26,
    color: THEME.text,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: THEME.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  backArrowText: {
    color: '#ffffff',
    fontSize: 22,   
    fontWeight: "bold",
  },
  menu: {
    marginBottom: 10,
  },
  menuCard: {
    flexDirection: "row",
    backgroundColor: THEME.surface,
    padding: 16,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: THEME.border,
    marginBottom: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuT: {
    color: THEME.text,
    fontSize: 15,
    fontWeight: "700",
  },
  menuS: {
    color: THEME.muted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  startBtn: {
    backgroundColor: THEME.primary,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(19, 17, 28, 0.88)",
    justifyContent: "center",
    alignItems: "center",
  },
  reticle: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: THEME.primary,
    borderRadius: 40,
  },
  btn: {
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  btnT: {
    color: THEME.text,
    fontWeight: "bold",
    fontSize: 15,
  },
  msg: {
    color: THEME.primary,
    marginBottom: 20,
    fontSize: 14,
  },
  searchSection: {
    marginBottom: 20,
    gap: 10,
  },
  input: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: THEME.border,
    color: THEME.text,
  },
  errorBox: {
    backgroundColor: THEME.errorBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: THEME.errorText,
  },
  errorText: {
    color: THEME.errorText,
    fontSize: 13,
    fontWeight: "600",
  },
  resultsContainer: {
    marginTop: 10,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  foodName: {
    fontSize: 19,
    fontWeight: '700',
    color: THEME.text,
    textTransform: 'capitalize',
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  macroValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macroUnit: {
    fontSize: 11,
    color: THEME.muted,
    marginTop: 1,
  },
  detailsSection: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.bg,
  },
  detailLabel: {
    fontSize: 13,
    color: THEME.muted,
  },
  detailValue: {
    fontSize: 13,
    color: THEME.text,
    fontWeight: '600',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  disclaimerText: {
    color: THEME.muted,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: THEME.overlayBg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  successCard: {
    backgroundColor: THEME.surface,
    width: '100%',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.border,
    shadowColor: THEME.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  successIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    color: THEME.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  successSubtitle: {
    color: THEME.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  highlightedFood: {
    color: THEME.text,
    fontWeight: '700',
    textTransform: 'capitalize'
  },
  successDismissBtn: {
    backgroundColor: THEME.success,
    height: 52,
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  successDismissBtnText: {
    color: THEME.text,
    fontWeight: '700',
    fontSize: 15,
  }
});
