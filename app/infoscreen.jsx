import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";

const { width } = Dimensions.get("window");

const bodyImages = [
  require("../assets/images/body1.png"),
  require("../assets/images/body2.png"),
  require("../assets/images/body3.png"),
];

export default function InfoScreen() {
  const router = useRouter();
  const scrollRef = useRef();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);

  const [heightUnit, setHeightUnit] = useState("ft");
  const [weightUnit, setWeightUnit] = useState("lbs");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weight, setWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("PH");
  const [carouselIndex, setCarouselIndex] = useState(0);

  const runPos = useSharedValue(-20);

  useEffect(() => {
    if (isFinishing) {
      runPos.value = withRepeat(
        withSequence(
          withTiming(30, { duration: 400 }),
          withTiming(-30, { duration: 400 }),
        ),
        -1,
        true,
      );
    }
  }, [isFinishing]);

  const runStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: runPos.value }],
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (carouselIndex + 1) % bodyImages.length;
      setCarouselIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, 2500);
    return () => clearInterval(interval);
  }, [carouselIndex]);

  useEffect(() => {
    if (heightUnit === "ft") { if (heightFt && heightIn) setStep(2); } 
    else { if (heightCm) setStep(2); }
  }, [heightFt, heightIn, heightCm]);
  useEffect(() => { if (weight) setStep(3); }, [weight]);
  useEffect(() => { if (goalWeight) setStep(4); }, [goalWeight]);
  useEffect(() => { if (age) setStep(5); }, [age]);

  const handleFinish = async () => {
    if (!user) return;
    setIsFinishing(true);

    try {
      await setDoc(doc(db, "users", user.uid), {
        height: heightUnit === "ft" ? `${heightFt}'${heightIn}"` : `${heightCm}cm`,
        currentWeight: parseFloat(weight),
        goalWeight: parseFloat(goalWeight),
        age: age,
        country: country,
        weightUnit: weightUnit,
        setupComplete: true,
        lastUpdated: Date.now()
      }, { merge: true });

      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);
    } catch (e) {
      console.error("Error saving profile:", e);
      setIsFinishing(false);
    }
  };

  if (isFinishing) {
    return (
      <View style={styles.loadingOverlay}>
        <Text style={styles.loadingLogo}>Fit<Text style={{ color: "#f97316" }}>Choice</Text></Text>
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Finalizing your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.logo}>Fit<Text style={{ color: "#f97316" }}>Choice</Text></Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} />
      </View>

      {step > 1 && (
        <Pressable onPress={() => setStep(step - 1)}>
          <Text style={styles.backText}>❮ Back</Text>
        </Pressable>
      )}

      <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {bodyImages.map((img, idx) => (
          <View key={idx} style={styles.imageWrapper}><Image source={img} style={styles.image} /></View>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Just a few questions</Text>

      <Animated.View entering={FadeInDown} style={styles.inputSection}>
        <Text style={styles.label}>How tall are you?</Text>
        <View style={styles.row}>
          {heightUnit === "ft" ? (
            <><TextInput placeholder="Ft" placeholderTextColor="#64748b" value={heightFt} onChangeText={setHeightFt} keyboardType="numeric" style={styles.inputSmall} />
              <TextInput placeholder="In" placeholderTextColor="#64748b" value={heightIn} onChangeText={setHeightIn} keyboardType="numeric" style={styles.inputSmall} /></>
          ) : (
            <TextInput placeholder="Cm" placeholderTextColor="#64748b" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" style={styles.inputLarge} />
          )}
          <Pressable onPress={() => setHeightUnit(heightUnit === "ft" ? "cm" : "ft")} style={styles.toggle}><Text style={styles.toggleText}>{heightUnit}</Text></Pressable>
        </View>
      </Animated.View>

      {step >= 2 && (
        <Animated.View entering={FadeInDown} style={styles.inputSection}>
          <Text style={styles.label}>Current Weight</Text>
          <View style={styles.row}>
            <TextInput placeholder="Weight" placeholderTextColor="#64748b" value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.inputLarge} />
            <Pressable onPress={() => setWeightUnit(weightUnit === "lbs" ? "kg" : "lbs")} style={styles.toggle}><Text style={styles.toggleText}>{weightUnit}</Text></Pressable>
          </View>
        </Animated.View>
      )}

      {step >= 3 && (
        <Animated.View entering={FadeInDown} style={styles.inputSection}>
          <Text style={styles.label}>Goal Weight</Text>
          <View style={styles.row}>
            <TextInput placeholder="Target" placeholderTextColor="#64748b" value={goalWeight} onChangeText={setGoalWeight} keyboardType="numeric" style={styles.inputLarge} />
            <View style={styles.toggleDisabled}><Text style={styles.toggleText}>{weightUnit}</Text></View>
          </View>
        </Animated.View>
      )}

      {step >= 4 && (
        <Animated.View entering={FadeInDown} style={styles.inputSection}>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Age</Text>
              <TextInput placeholder="Years" placeholderTextColor="#64748b" value={age} onChangeText={setAge} keyboardType="numeric" style={styles.inputFull} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Country</Text>
              <View style={styles.pickerBg}>
                <Picker selectedValue={country} onValueChange={(v) => setCountry(v)} dropdownIconColor="#fff" style={{ color: "#fff" }}>
                  <Picker.Item label="Philippines" value="PH" /><Picker.Item label="USA" value="US" />
                </Picker>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {step >= 5 && (
        <Pressable onPress={handleFinish} style={styles.confirmBtn}><Text style={styles.confirmBtnText}>Finish Setup</Text></Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0f172a" 
  },
  scrollContent: { 
    padding: 25, 
    paddingBottom: 60 
  },
  loadingOverlay: { 
    flex: 1, 
    backgroundColor: "#0f172a", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingLogo: { 
    fontSize: 40, 
    fontWeight: "bold", 
    color: "#fff", 
    marginBottom: 20 
  },
  loadingText: { 
    color: "#94a3b8", 
    marginTop: 20, 
    fontSize: 16 
  },
  logo: { 
    color: "#fff", 
    fontSize: 28, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginTop: 40, 
    marginBottom: 20 
  },
  progressBar: { 
    height: 8, 
    backgroundColor: "#1e293b", 
    borderRadius: 10, 
    marginBottom: 20, 
    overflow: "hidden" 
  },
  progressFill: { 
    height: "100%", 
    backgroundColor: "#f97316" 
  },
  backText: { 
    color: "#94a3b8", 
    fontSize: 14, 
    marginBottom: 10 
  },
  carousel: { 
    height: 180, 
    marginBottom: 25 
  },
  imageWrapper: { 
    width: width - 50, 
    alignItems: "center" 
  },
  image: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "contain" 
  },
  sectionTitle: { 
    color: "#fff", 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  inputSection: { 
    marginBottom: 25 
  },
  label: { 
    color: "#94a3b8", 
    fontSize: 14, 
    marginBottom: 8 
  },
  row: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  inputSmall: { 
    backgroundColor: "#1e293b", 
    color: "#fff", 
    padding: 15, 
    borderRadius: 15, 
    flex: 1, 
    marginRight: 10, 
    fontSize: 16 
  },
  inputLarge: { 
    backgroundColor: "#1e293b", 
    color: "#fff", 
    padding: 15, 
    borderRadius: 15, 
    flex: 3, 
    marginRight: 10, 
    fontSize: 16 
  },
  inputFull: { 
    backgroundColor: "#1e293b", 
    color: "#fff", 
    padding: 15, 
    borderRadius: 15, 
    fontSize: 16 
  },
  toggle: { 
    backgroundColor: "#f97316", 
    paddingVertical: 15, 
    paddingHorizontal: 15, 
    borderRadius: 15, 
    minWidth: 60, 
    alignItems: "center" 
  },
  toggleDisabled: { 
    backgroundColor: "#334155", 
    paddingVertical: 15, 
    paddingHorizontal: 15, 
    borderRadius: 15, 
    minWidth: 60, 
    alignItems: "center" 
  },
  toggleText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  pickerBg: { 
    backgroundColor: "#1e293b", 
    borderRadius: 15, 
    overflow: "hidden" 
  },
  confirmBtn: { 
    backgroundColor: "#f97316", 
    padding: 20, borderRadius: 18, 
    alignItems: "center", 
    marginTop: 20
   },
  confirmBtnText: { 
    color: "#fff",
     fontSize: 18, 
     fontWeight: "bold" 
    },
});