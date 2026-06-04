import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { Rect } from 'react-native-svg';

import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";
import { useStepTracker } from "../hooks/useStepTracker";

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

function ShimmerWaveEffect() {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, { duration: 2500 }),
      -1,
      false
    );
  }, []);

  return null;
}

export default function Dashboard() {
const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,  
      true  
    );
  }, []);

  const animatedGradientStyle = useAnimatedStyle(() => {
    const tx = interpolate(animationProgress.value, [0, 1], [-15, 15]);
    const ty = interpolate(animationProgress.value, [0, 1], [-10, 10]);
    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
        { scale: 1.4 }
      ],
    };
  });
  
  const { user, logout } = useAuth();
  const router = useRouter();
  const { selectedSplit } = useLocalSearchParams();
  const [steps, setSteps] = useState(0);
  const [xp, setXP] = useState(0);
  const [dailyXpEarned, setDailyXpEarned] = useState(0);
  const [exercisesFinishedToday, setExercisesFinishedToday] = useState(0);

  const [userProfile, setUserProfile] = useState({ 
    currentWeight: 0, 
    goalWeight: 0,
    height: "5'11",     
    age: 20, 
    gender: "Male",     
    weightUnit: "kg"    
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [localPhotoURI, setLocalPhotoURI] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [metricUnits, setMetricUnits] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [useGifBackground, setUseGifBackground] = useState(true);
  const [fitCoins, setFitCoins] = useState(500);
  const [activeSplitPreference, setActiveSplitPreference] = useState(null);
  const [nutritionIntakes, setNutritionIntakes] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [exerciseBurnedCalories, setExerciseBurnedCalories] = useState(0);

  const lastStepTime = useRef(0);
  const dbSyncTimeoutRef = useRef(null);
  const [coins, setCoins] = useState(0);
  const [rank, setRank] = useState("Bronze");
  const [unlockedTitles, setUnlockedTitles] = useState([]);
  const [equippedTitle, setEquippedTitle] = useState("Rookie");
  const [unlockedBorders, setUnlockedBorders] = useState(["default"]);
  const [equippedBorder, setEquippedBorder] = useState("default");
  const [unlockedBackgrounds, setUnlockedBackgrounds] = useState(["default"]);
  const [equippedBackground, setEquippedBackground] = useState("default");

  const [badges, setBadges] = useState([]);
  const [xpMultiplier, setXpMultiplier] = useState(1);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [latestRewards, setLatestRewards] = useState([]);
  
  const previousLevelRef = useRef(null);

  const parseHeightToCm = (heightStr) => {
    if (!heightStr) return 170;
    if (typeof heightStr === 'number' || !isNaN(heightStr)) {
      return Number(heightStr);
    }
    try {
      const cleanStr = String(heightStr).replace(/"/g, '').trim(); 
      if (cleanStr.includes("'")) {
        const parts = cleanStr.split("'");
        const feet = parseInt(parts[0], 10) || 0;
        const inches = parseInt(parts[1], 10) || 0;
        const totalInches = (feet * 12) + inches;
        return Math.round(totalInches * 2.54); 
      }
    } catch (err) {
      console.warn("[Height String Parser Exception]: ", err);
    }
    return 170; 
  };

  const rawWeightValue = userProfile.currentWeight || 0;
  const weightInKg = userProfile.weightUnit?.toLowerCase() === "lbs" 
    ? rawWeightValue * 0.45359237 
    : rawWeightValue;

  const heightInCm = parseHeightToCm(userProfile.height);
  const userAge = userProfile.age || 20;
  const userGender = userProfile.gender || "Male";

  const calculatedBMR = userGender.toLowerCase() === "female"
    ? (10 * weightInKg) + (6.25 * heightInCm) - (5 * userAge) - 161
    : (10 * weightInKg) + (6.25 * heightInCm) - (5 * userAge) + 5;

  const baseTDEE = Math.floor(calculatedBMR * 1.25);

  let calorieGoalAdjustment = 0;
  let detectedGoalString = "Maintenance";

  if (userProfile.goalWeight > 0 && userProfile.currentWeight > 0) {
    if (userProfile.goalWeight < userProfile.currentWeight) {
      calorieGoalAdjustment = -500;
      detectedGoalString = "Fat Loss";
    } else if (userProfile.goalWeight > userProfile.currentWeight) {
      calorieGoalAdjustment = 300;
      detectedGoalString = "Muscle Gain";
    }
  }

  const calorieGoal = Math.max(1200, baseTDEE + calorieGoalAdjustment);

  const proteinGoal = Math.floor(weightInKg * 2);
  const fatGoal = Math.floor((calorieGoal * 0.25) / 9);
  const carbsGoal = Math.floor((calorieGoal - (proteinGoal * 4) - (fatGoal * 9)) / 4);

  const stepGoal = 5000;
  const stepCaloriesBurned = Math.floor(steps * 0.04);
  const totalCaloriesBurned = stepCaloriesBurned + exerciseBurnedCalories;


  const level = Math.floor(xp / 100) + 1;
  const xpProgress = (xp % 100);

  const highestWeightRef = Math.max(userProfile.currentWeight, userProfile.goalWeight, 100);
  const lowestWeightRef = Math.min(userProfile.currentWeight, userProfile.goalWeight, 40);
  const graphRange = highestWeightRef - lowestWeightRef || 20;

  const getWarriorLeague = (lvl) => {
  if (lvl >= 40) return { 
    name: "Immortal Ascendant League", 
    badge: "⚜️🔥", 
    color: "#f43f5e", 
    bg: "#3b0a2a" 
  };

  if (lvl >= 30) return { 
    name: "Mythic Platinum Rank", 
    badge: "💠⚡", 
    color: "#38bdf8", 
    bg: "#0a2a3b" 
  };

  if (lvl >= 20) return { 
    name: "Golden Elite Division", 
    badge: "✨🟡", 
    color: "#f59e0b", 
    bg: "#3b2400" 
  };

  if (lvl >= 10) return { 
    name: "Silver Vanguard Tier", 
    badge: "⚔️💠", 
    color: "#cbd5e1", 
    bg: "#1f2a3a" 
  };

  if (lvl >= 5) return { 
    name: "Bronze Warrior Class", 
    badge: "🛡️🟤", 
    color: "#b45309", 
    bg: "#2a1a12" 
  };

  return { 
    name: "Novice Adventurer", 
    badge: "🗡️", 
    color: "#a16207", 
    bg: "#1c1917" 
  };
};

  const currentLeague = getWarriorLeague(level);

  const getDropdownBackground = () => {
    if (!isDarkMode) return "#ffffff";
    if (level >= 40) return "#1e1b4b"; 
    if (level >= 30) return "#0f172a"; 
    if (level >= 20) return "#1c1917"; 
    if (level >= 10) return "#111827"; 
    return "#1e293b"; 
  };

  const giveLevelRewards = async (newLevel) => {
    let rewards = [];
    const earnedCoins = newLevel * 100;
    
    setCoins(prev => prev + earnedCoins);
    rewards.push(`+${earnedCoins} Coins`);

    if (newLevel === 3) {
      rewards.push("Beginner Badge");
      setBadges(prev => [...prev, "Beginner"]);
    }
    if (newLevel === 5) {
      rewards.push("Warrior Title");
      rewards.push("Neon Background");
      setUnlockedTitles(prev => [...prev, "Warrior"]);
      setUnlockedBackgrounds(prev => [...prev, "neon"]);
    }
    if (newLevel === 7) {
      rewards.push("2X XP Boost");
      setXpMultiplier(2);
    }
    if (newLevel === 10) {
      rewards.push("Fire Border");
      setUnlockedBorders(prev => [...prev, "fire"]);
    }
    if (newLevel === 15) {
      rewards.push("Fire Background");
      setUnlockedBackgrounds(prev => [...prev, "fire"]);
    }

    let newRank = "Bronze";
    if (newLevel >= 10) newRank = "Silver";
    if (newLevel >= 20) newRank = "Gold";
    if (newLevel >= 40) newRank = "Platinum";
    setRank(newRank);

    setLatestRewards(rewards);
    if (rewards.length > 0) {
      setShowLevelUpModal(true);
    }

    try {
      await setDoc(doc(db, "users", user.uid), {
        coins: coins + earnedCoins,
        rank: newRank,
        unlockedTitles,
        unlockedBorders,
        unlockedBackgrounds,
        badges
      }, { merge: true });
    } catch (e) {
      console.warn(e);
    }
  };

  const graphScaleSegments = [
    Math.round(highestWeightRef),
    Math.round(highestWeightRef - graphRange * 0.33),
    Math.round(highestWeightRef - graphRange * 0.66),
    Math.round(lowestWeightRef)
  ];

  const currentWeightTopPercent = `${Math.min(90, Math.max(10, ((highestWeightRef - userProfile.currentWeight) / graphRange) * 100))}%`;
  const goalWeightTopPercent = `${Math.min(90, Math.max(10, ((highestWeightRef - userProfile.goalWeight) / graphRange) * 100))}%`;

  const [todayStr, setTodayStr] = useState(new Date().toISOString().split("T")[0]);
  const [currentDateDisplay, setCurrentDateDisplay] = useState(
    new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  );

  const generateGraphTimelineLabels = () => {
    const labels = [];
    for (let i = 3; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - (i * 7)); 
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      labels.push(`${month}/${day}`);
    }
    return labels;
  };

  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      const checkString = now.toISOString().split("T")[0];
      if (checkString !== todayStr) {
        setTodayStr(checkString);
        setCurrentDateDisplay(
          now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        );
      }
    }, 30000);
    return () => clearInterval(clockInterval);
  }, [todayStr]);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          currentWeight: Number(data.currentWeight || 0),
          goalWeight: Number(data.goalWeight || 0),
          height: data.height || "5'11", 
          age: Number(data.age || 20),
          gender: data.gender || "Male",
          weightUnit: data.weightUnit || "kg"
        });
        setDisplayName(data.displayName || user.displayName || "FitChoice Athlete");
        
        const loadedXp = Number(data.xp || 0);
        const calculatedLevel = Math.floor(loadedXp / 100) + 1;
        
        if (previousLevelRef.current !== null) {
          if (calculatedLevel > previousLevelRef.current) {
            giveLevelRewards(calculatedLevel);
          }
        }
        previousLevelRef.current = calculatedLevel;
        setXP(loadedXp);

        setExercisesFinishedToday(Number(data.exercisesFinishedToday || 0));
        if (data.profilePhotoUrl) setLocalPhotoURI(data.profilePhotoUrl);
        if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
        if (data.useGifBackground !== undefined) setUseGifBackground(data.useGifBackground);
        const targetSelectionKey = data.goal || data.bodyGoal || data.workoutSplitPreference || "";
        if (targetSelectionKey) {
          setActiveSplitPreference(targetSelectionKey.trim().toLowerCase().split(" ")[0]);
        }
      }
    });

    const unsubIntakes = onSnapshot(
      query(collection(db, "users", user.uid, "intakes"), where("date", "==", todayStr)),
      (snapshot) => {
        let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        snapshot.forEach((doc) => {
          const data = doc.data();
          totals.calories += Number(data.calories || 0);
          totals.protein += Number(data.protein || 0);
          totals.carbs += Number(data.carbs || 0);
          totals.fat += Number(data.fat || 0);
        });
        setNutritionIntakes(totals);
      }
    );

    const unsubExercises = onSnapshot(
      query(collection(db, "users", user.uid, "exercises"), where("date", "==", todayStr)),
      (snapshot) => {
        let totalBurn = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          totalBurn += Number(data.caloriesBurned || data.calories || 0);
        });
        setExerciseBurnedCalories(totalBurn);
      }
    );

    return () => {
      unsubProfile();
      unsubIntakes();
      unsubExercises();
    };
  }, [user, todayStr]);

  useEffect(() => {
    if (!user) return;

    const syncHistoricalDayTracking = async () => {
      try {
        await setDoc(
          doc(db, "users", user.uid, "daily_summaries", todayStr), 
          {
            date: todayStr,
            calories: nutritionIntakes.calories,
            protein: nutritionIntakes.protein,
            steps: steps,
            xpSnapshot: xp,
            exercisesFinishedToday: exercisesFinishedToday,
            lastUpdatedTimestamp: new Date()
          }, 
          { merge: true }
        );
        console.log("Analytics history successfully synced.");
      } catch (err) {
        console.warn("Analytics history exception capture: ", err);
      }
    };

    let debounceTimer;
    if (nutritionIntakes.calories > 0 || steps > 0 || exercisesFinishedToday > 0) {
      debounceTimer = setTimeout(() => {
        syncHistoricalDayTracking();
      }, 2000);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [
    nutritionIntakes.calories, 
    nutritionIntakes.protein, 
    steps, 
    xp, 
    exercisesFinishedToday, 
    todayStr, 
    user
  ]);

  const toggleAmbientGifBackground = async (mode) => {
    setUseGifBackground(mode);
    try {
      await setDoc(doc(db, "users", user.uid), { useGifBackground: mode }, { merge: true });
    } catch (e) {
      console.warn("Background preference saving delayed: ", e);
    }
  };

  const handleUpdateUsername = async () => {
    setIsEditingName(false);
    if (!displayName.trim()) return;
    try {
      await setDoc(doc(db, "users", user.uid), { displayName: displayName.trim() }, { merge: true });
    } catch (e) {
      Alert.alert("Error", "Failed to update profile identity username.");
    }
  };

  const handleNavigateToExercisePool = () => {
    const resolvedSplit = selectedSplit || activeSplitPreference || "chest";
    if (resolvedSplit === "arm" || resolvedSplit === "arms") {
      router.push("/arm");
    } else if (resolvedSplit === "back") {
      router.push("/back");
    } else if (resolvedSplit === "chest") {
      router.push("/chest");
    } else {
      router.push("/ChestDominantSplit");
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' + s : s}`;
  };

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "activity", todayStr));
        const profileSnap = await getDoc(doc(db, "users", user.uid));
        if (profileSnap.exists()) {
          const cloudXp = Number(profileSnap.data().xp || 0);
          previousLevelRef.current = Math.floor(cloudXp / 100) + 1;
          setXP(cloudXp);
          setExercisesFinishedToday(Number(profileSnap.data().exercisesFinishedToday || 0));
        }
        if (snap.exists()) {
          const data = snap.data();
          setSteps(Number(data.steps || 0));
          setDailyXpEarned(Number(data.dailyXpEarned || 0));
        } else {
          setSteps(0);
          setDailyXpEarned(0);
          setSeconds(0);
          setIsActive(false);
        }
      } catch (e) {
        console.error("Load Error:", e);
      }
    };
    loadData();
  }, [user, todayStr]);

  const onStepDetected = useCallback(() => {
    const now = Date.now();
    if (now - lastStepTime.current < 350) return;
    lastStepTime.current = now;

    setSteps((prevSteps) => {
      const nextSteps = prevSteps + 1;
      setDailyXpEarned((prevDaily) => {
        const nextDailyXp = parseFloat((prevDaily + 0.02).toFixed(2));
        setXP((prevGlobal) => {
          const nextGlobalXp = parseFloat((prevGlobal + 0.02).toFixed(2));

          if (dbSyncTimeoutRef.current) clearTimeout(dbSyncTimeoutRef.current);

          dbSyncTimeoutRef.current = setTimeout(async () => {
            try {
              await setDoc(doc(db, "users", user.uid, "activity", todayStr), {
                steps: nextSteps,
                dailyXpEarned: nextDailyXp
              }, { merge: true });

              await setDoc(doc(db, "users", user.uid), {
                xp: nextGlobalXp
              }, { merge: true });
            } catch (err) {
              console.warn("Debounced cloud storage sync failure: ", err);
            }
          }, 2500);

          return nextGlobalXp;
        });
        return nextDailyXp;
      });
      return nextSteps;
    });
  }, [user, todayStr]);

  useStepTracker(onStepDetected);

  useEffect(() => {
    return () => { if (dbSyncTimeoutRef.current) clearTimeout(dbSyncTimeoutRef.current); };
  }, []);

  const selectProfileImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissions Required", "FitChoice requires privileges to load custom avatars.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      const selectedUri = result.assets[0].uri;
      setLocalPhotoURI(selectedUri);
      try {
        await setDoc(doc(db, "users", user.uid), { profilePhotoUrl: selectedUri }, { merge: true });
      } catch (err) {
        console.warn("Could not preserve photo cloud reference sync: ", err);
      }
    }
  };

  const navIcons = {
    dashboard: require("../assets/icons/dashboard.png"),
    progress: require("../assets/icons/progress.png"),
    macro: require("../assets/icons/macrocalculation.png"),
    quest: require("../assets/icons/quest.png"),
    running: require("../assets/icons/running.png"),
    fire: require("../assets/icons/fire.png"), 
    exe: require("../assets/icons/exercise.png"),
  };

  const currentAvatarSource = localPhotoURI 
    ? { uri: localPhotoURI } 
    : (user?.photoURL ? { uri: user.photoURL } : { uri: 'https://via.placeholder.com/100' });

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }
  
    return (
  <View style={[styles.rootContainer, { backgroundColor: isDarkMode ? "#090d16" : "#f3f4f6" }]}>
    {useGifBackground && (
      <Image source={require("../assets/background.gif")} style={styles.globalScreenAbsoluteGif} resizeMode="cover" />
    )}

    <Modal visible={showLevelUpModal} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#1e293b', padding: 25, borderRadius: 24, width: 320, alignItems: 'center', borderWidth: 2, borderColor: '#f97316' }}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>🏆</Text>
          <Text style={{ color: '#f97316', fontSize: 26, fontWeight: '900', letterSpacing: 1 }}>LEVEL UP!</Text>
          <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 15, fontWeight: '600' }}>You reached Level {level}!</Text>
          
          <View style={{ width: '100%', backgroundColor: '#0f172a', padding: 15, borderRadius: 12, marginBottom: 20 }}>
            <Text style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: 8, fontSize: 12, letterSpacing: 0.5 }}>UNLOCKED REWARDS:</Text>
            {latestRewards && latestRewards.length > 0 ? (
              latestRewards.map((r, i) => (
                <Text key={i} style={{ color: '#fff', fontSize: 14, marginVertical: 3, fontWeight: '500' }}>✨ {r}</Text>
              ))
            ) : (
              <Text style={{ color: '#64748b', fontSize: 14, fontStyle: 'italic' }}>New attribute points & custom tier updates!</Text>
            )}
          </View>

          <TouchableOpacity 
            onPress={() => setShowLevelUpModal(false)} 
            style={{ backgroundColor: '#f97316', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12, shadowColor: '#f97316', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>CLAIM REWARDS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    <View style={[
      styles.scrimBackdropOverlay, 
      !isDarkMode && { backgroundColor: 'rgba(243, 244, 246, 0.85)' },
      !useGifBackground && { backgroundColor: 'transparent' }
    ]} />

    <View style={styles.topHeader}>
      <TouchableOpacity 
        onPress={() => router.push("/shop")}
        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}
      >
        <Text style={{ fontSize: 16, marginRight: 4 }}>🪙</Text>
        <Text style={{ color: isDarkMode ? '#fff' : '#1e293b', fontWeight: 'bold', fontSize: 12 }}>{fitCoins}</Text>
      </TouchableOpacity>

      <Text style={[styles.logoText, !isDarkMode && { color: '#1e293b' }]}>Fit<Text style={{color: '#f97316'}}>Choice</Text></Text>
      
      <TouchableOpacity onPress={() => setShowDropdown(true)}>
        <Image source={currentAvatarSource} style={styles.profilePic} />
      </TouchableOpacity>
    </View>

    <View style={styles.clippedScrollViewWrapper}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainerContent}>
        
        <View style={styles.carouselWrapper}>
          <ScrollView 
            horizontal 
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 20}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 20)))}
            scrollEventThrottle={16}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            <View style={[styles.card, { width: CARD_WIDTH, marginRight: 20 }, !isDarkMode && { backgroundColor: '#fff' }]}>
              <View style={styles.rowBetween}>
                <Text style={[styles.cardHeaderTitle, { marginBottom: 2 }, !isDarkMode && { color: '#1e293b' }]}>Calorie Balance</Text>
                <Text style={[{ color: '#edf2f7', fontSize: 11, fontWeight: '600', opacity: 0.85 }, !isDarkMode && { color: '#475569' }]}>{currentDateDisplay}</Text>
              </View>

              <View style={styles.intakeDataRow}>
                <View style={styles.intakeStatsColumn}>
                  <Text style={styles.intakeLabelHeader}>EATEN</Text>
                  <Text style={[styles.intakePrimaryNumber, !isDarkMode && { color: '#1e293b' }]}>{nutritionIntakes.calories}</Text>
                  <Text style={styles.intakeUnitLabel}>kcal consumed</Text>
                </View>

                <View style={[styles.intakeDividerPipe, !isDarkMode && { backgroundColor: '#e2e8f0' }]} />

                <View style={styles.intakeStatsColumn}>
                  <Text style={[styles.intakeLabelHeader, { color: '#ef4444' }]}>BURNED</Text>
                  <Text style={[styles.intakePrimaryNumber, !isDarkMode && { color: '#1e293b' }]}>-{totalCaloriesBurned}</Text>
                  <Text style={styles.intakeUnitLabel}>kcal burned</Text>
                </View>

                <View style={[styles.intakeDividerPipe, !isDarkMode && { backgroundColor: '#e2e8f0' }]} />

                <View style={styles.intakeStatsColumn}>
                  <Text style={[styles.intakeLabelHeader, { color: '#3b82f6' }]}>GOAL</Text>
                  <Text style={[styles.intakePrimaryNumber, !isDarkMode && { color: '#1e293b' }]}>{calorieGoal}</Text>
                  <Text style={styles.intakeUnitLabel}>Calorie Intake</Text>
                </View>
              </View>
              
              <View style={styles.macroSummaryRow}>
                <Text style={styles.macroMiniText}>Protein: <Text style={{color: '#3b82f6'}}>{nutritionIntakes.protein}g</Text></Text>
                <Text style={styles.macroMiniText}>Carbs: <Text style={{color: '#a855f7'}}>{nutritionIntakes.carbs}g</Text></Text>
                <Text style={styles.macroMiniText}>Fats: <Text style={{color: '#f97316'}}>{nutritionIntakes.fat}g</Text></Text>
              </View>
            </View>

            <View style={[styles.card, { width: CARD_WIDTH, alignItems: 'center' }, !isDarkMode && { backgroundColor: '#fff' }]}>
              <Text style={[styles.cardHeaderTitle, !isDarkMode && { color: '#1e293b' }]}>Character Experience System</Text>
              <AnimatedCircularProgress size={120} width={12} fill={xpProgress} tintColor="#f97316" backgroundColor={isDarkMode ? "#2d3748" : "#e2e8f0"} rotation={0}>
                {() => (
                  <View style={styles.ringCenter}>
                    <Text style={[styles.ringValue, {fontSize: 22}, !isDarkMode && { color: '#1e293b' }]}>LVL {level}</Text>
                    <Text style={styles.ringSub}>{xpProgress.toFixed(1)}/100 XP</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>
          </ScrollView>
          
          <View style={styles.dotsRow}>
            <View style={[styles.dot, activeIndex === 0 && styles.activeDot]} />
            <View style={[styles.dot, activeIndex === 1 && styles.activeDot]} />
          </View>
        </View>

        <View style={styles.paddedContentWrapper}>
          <View style={[styles.card, !isDarkMode && { backgroundColor: '#fff' }]}>
            
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.cardHeaderTitle, { marginBottom: 2 }, !isDarkMode && { color: '#1e293b' }]}>
                  Milestones & Trophies
                </Text>
                <Text style={styles.milestoneSubheader}>
                  3 Achievements unlocked this week
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.tierMainText}>BRONZE</Text>
                <Text style={styles.tierSubText}>TIER</Text>
              </View>
            </View>
            
            <View style={styles.trophyRowContainer}>
              
              <View style={styles.trophyNodeItem}>
                <View style={[styles.trophyIconOuterCircle, steps >= stepGoal && styles.trophyCircleUnlocked]}>
                  <Text style={{ fontSize: 20 }}>🏃</Text>
                </View>
                <Text style={[styles.trophyItemTitle, !isDarkMode && { color: '#1e293b' }]}>Step Master</Text>
                <Text style={[styles.trophyItemStatus, steps >= stepGoal && styles.statusTextActive]}>
                  {steps >= stepGoal ? "CLAIMED" : "IN PROGRESS"}
                </Text>
              </View>

              <View style={styles.trophyNodeItem}>
                <View style={[styles.trophyIconOuterCircle, styles.trophyCenterBrightCircle, level >= 2 && styles.trophyCircleUnlocked, { overflow: 'hidden', position: 'relative' }]}>
                  
                  {level >= 2 && (
                    <Animated.View 
                      style={[
                        animatedGradientStyle,
                        {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          borderRadius: 999
                        }
                      ]} 
                    />
                  )}
                  
                  <Text style={{ fontSize: 22, zIndex: 2 }}>🔥</Text>
                </View>
                <Text style={[styles.trophyItemTitle, !isDarkMode && { color: '#1e293b' }]}>Level 2 Elite</Text>
                <Text style={[styles.trophyItemStatus, styles.statusTextActive, { color: '#a855f7' }]}>
                  {level >= 2 ? "UNLOCKED" : "LOCKED"}
                </Text>
              </View>

              <View style={styles.trophyNodeItem}>
                <View style={[styles.trophyIconOuterCircle, (nutritionIntakes.calories <= calorieGoal && nutritionIntakes.calories > 0) && styles.trophyCircleUnlocked]}>
                  <Text style={{ fontSize: 20 }}>🥦</Text>
                </View>
                <Text style={[styles.trophyItemTitle, !isDarkMode && { color: '#1e293b' }]}>Clean Eater</Text>
                <Text style={styles.trophyItemStatus}>
                  {nutritionIntakes.calories <= calorieGoal && nutritionIntakes.calories > 0 ? "ACHIEVED" : "UNDERWAY"}
                </Text>
              </View>
            </View>

            <View style={styles.rankProgressWrapper}>
              <View style={styles.rankProgressBarTrack}>
                <View style={[styles.rankProgressBarFill, { width: '65%' }]} />
              </View>
              <Text style={styles.rankProgressPercentageLabel}>65% TO BRONZE</Text>
            </View>

          </View>
        </View>

        <View style={styles.paddedContentWrapper}>
          <View style={[styles.banner, !isDarkMode && { backgroundColor: '#e2e8f0' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, !isDarkMode && { color: '#1c2a3f' }]}>Customize your next workout</Text>
              <Text style={styles.bannerSub}>Achieving your goal means enjoying your routine</Text>
              <TouchableOpacity style={styles.bannerBtn} onPress={handleNavigateToExercisePool}>
                <Text style={styles.bannerBtnText}>Start Customizing</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 40 }}>🎉</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.halfCard, { marginRight: 10 }, !isDarkMode && { backgroundColor: '#fff' }]}>
            <Text style={[styles.cardHeaderTitle, !isDarkMode && { color: '#1e293b' }]}>Exercise</Text>
            <View style={styles.statHeader}>
              <Image source={navIcons.fire} style={styles.statMain} />
              <Text style={[styles.statValue, !isDarkMode && { color: '#1e293b' }]}>{totalCaloriesBurned} kCal</Text>
            </View>
            <TouchableOpacity onPress={() => setIsActive(!isActive)} style={styles.timerContainer}>
              <Text style={[styles.timerText, isActive && { color: '#f97316' }, !isActive && !isDarkMode && { color: '#1e293b' }]}>⏱ {formatTime(seconds)}</Text>
              <Text style={styles.ringSub}>Active Session Timer</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.halfCard, !isDarkMode && { backgroundColor: '#fff' }]}>
            <Text style={[styles.cardHeaderTitle, !isDarkMode && { color: '#1e293b' }]}>Steps Counter</Text>
            <View style={styles.stepsInner}>
              <Text style={[styles.stepsCount, !isDarkMode && { color: '#1e293b' }]}>{steps.toLocaleString()}</Text>
              <AnimatedCircularProgress size={70} width={4} fill={Math.min(100, (steps / stepGoal) * 100)} tintColor="#df8723" backgroundColor={isDarkMode ? "#2d3748" : "#e2e8f0"}>
                {() => <Image source={navIcons.running} style={{ width: 25, height: 25, tintColor: '#df8723' }} />}
              </AnimatedCircularProgress>
            </View>
            <Text style={styles.ringSub}>{stepGoal} Step Goal</Text>
          </View>
        </View>

        <View style={styles.paddedContentWrapper}>
          <View style={[styles.card, !isDarkMode && { backgroundColor: '#fff' }]}>
            <View style={styles.rowBetweenGraphHeader}>
              <Text style={[styles.cardHeaderTitle, !isDarkMode && { color: '#1e293b' }]}>Weight Status Tracker</Text>
              <View style={styles.legendColumn}>
                <Text style={styles.legendText}>🟢 Goal ({userProfile.goalWeight} {userProfile.weightUnit})</Text>
                <Text style={styles.legendText}>🟠 Current ({userProfile.currentWeight} {userProfile.weightUnit})</Text>
              </View>
            </View>
            
            <View style={styles.graphArea}>
              {graphScaleSegments.map((v, i) => (
                <View key={`${v}-${i}`} style={styles.graphLineRow}>
                  <Text style={styles.graphLabel}>{v}</Text>
                  <View style={[styles.graphLine, !isDarkMode && { backgroundColor: '#e2e8f0' }]} />
                </View>
              ))}
              <View style={[styles.weightPointer, { top: currentWeightTopPercent, backgroundColor: '#f97316' }]} />
              <View style={[styles.weightPointer, { top: goalWeightTopPercent, backgroundColor: '#22c55e' }]} />
            </View>
            
            <View style={styles.graphDates}>
              {generateGraphTimelineLabels().map((dateStr, index) => (
                <Text key={index} style={styles.ringSub}>{dateStr}</Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>

    <Modal visible={showDropdown} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={() => { setShowDropdown(false); setIsEditingName(false); }}>
        <Pressable style={[styles.dropdownCard, { backgroundColor: getDropdownBackground() }, !isDarkMode && { borderColor: '#e2e8f0', borderWidth: 1 }]}>
          <View style={styles.dropdownHeader}>
            <TouchableOpacity onPress={selectProfileImageFromGallery} activeOpacity={0.8}>
              <Image source={currentAvatarSource} style={styles.largeProfilePic} />
              <View style={styles.avatarCameraBadge}><Text style={{ fontSize: 8, color: '#fff' }}>+</Text></View>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              {isEditingName ? (
                <TextInput style={[styles.usernameInputEdit, !isDarkMode && { color: '#1e293b', borderColor: '#cbd5e1' }]} value={displayName} onChangeText={setDisplayName} onBlur={handleUpdateUsername} onSubmitEditing={handleUpdateUsername} autoFocus maxLength={20} />
              ) : (
                <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.editableNameWrapperRow}>
                  <Text style={[styles.userName, !isDarkMode && { color: '#1e293b' }]} numberOfLines={1}>{displayName}</Text>
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}> ✎</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
              
              <View style={[styles.leagueBadgeContainer, { backgroundColor: currentLeague.bg }]}>
                <Text style={styles.leagueBadgeIcon}>{currentLeague.badge}</Text>
                <Text style={[styles.leagueBadgeName, { color: currentLeague.color }]}>{currentLeague.name}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.xpBox, !isDarkMode && { backgroundColor: '#f1f5f9' }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.xpLabel, !isDarkMode && { color: '#1e293b' }]}>Level {level}</Text>
              <Text style={styles.xpValue}>{xpProgress.toFixed(1)}/100 XP</Text>
            </View>
            <View style={[styles.xpBarBackground, !isDarkMode && { backgroundColor: '#cbd5e1' }]}>
              <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
            </View>
          </View>

          <Text style={styles.settingsSectionDivider}>Preferences Control</Text>
          <View style={styles.settingsToggleOptionRow}>
            <Text style={[styles.settingRowLabel, !isDarkMode && { color: '#475569' }]}>Live background</Text>
            <Switch value={useGifBackground} onValueChange={toggleAmbientGifBackground} trackColor={{ false: "#94a3b8", true: "#f97316" }} />
          </View>
          <View style={styles.settingsToggleOptionRow}>
            <Text style={[styles.settingRowLabel, !isDarkMode && { color: '#475569' }]}>Metric (kg/g)</Text>
            <Switch value={metricUnits} onValueChange={setMetricUnits} trackColor={{ false: "#94a3b8", true: "#f97316" }} />
          </View>
          <View style={styles.settingsToggleOptionRow}>
            <Text style={[styles.settingRowLabel, !isDarkMode && { color: '#475569' }]}>Notifications</Text>
            <Switch value={pushNotifications} onValueChange={setPushNotifications} trackColor={{ false: "#94a3b8", true: "#f97316" }} />
          </View>

          <View style={styles.buildIdentityFooter}>
            <Text style={styles.buildLabelText}>Version Configuration: v2.4.5</Text>
            <Text style={styles.buildLabelText}>System Build Reference: #2026.0521</Text>
          </View>

          <TouchableOpacity style={{ marginTop: 15, paddingVertical: 10 }} onPress={async () => { try { setShowDropdown(false); await logout(); router.replace("/introscreen"); } catch (error) { console.error("Logout validation context exception: ", error); } }} >
            <Text style={{ color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>

    <View style={styles.navBar}>
      <View style={styles.navBarContent}>
        <Pressable style={styles.navItem} onPress={() => router.push("/dashboard")}>
          <Image source={navIcons.dashboard} style={[styles.navIcon, { tintColor: '#f97316' }]} />
          <Text style={[styles.navLabel, { color: '#f97316' }]}>Dashboard</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push("/progress")}>
          <Image source={navIcons.progress} style={styles.navIcon} />
          <Text style={styles.navLabel}>Progress</Text>
        </Pressable>
        <View style={{ width: 70 }} />
        <Pressable style={styles.navItem} onPress={handleNavigateToExercisePool}>
          <Image source={navIcons.exe} style={styles.navIcon} />
          <Text style={styles.navLabel}>Exercise</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push("/quest")}>
          <Image source={navIcons.quest} style={styles.navIcon} />
          <Text style={styles.navLabel}>Quest</Text>
        </Pressable>
      </View>
      <View style={styles.navCenter}>
        <Pressable style={styles.navCenterBtn} onPress={() => router.push("/macroscanner")}>
          <Image source={navIcons.macro} style={{ width: 30, height: 30 }} />
        </Pressable>
      </View>
    </View>
  </View>
);
}

  const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
  },
  globalScreenAbsoluteGif: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrimBackdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
  },
  clippedScrollViewWrapper: {
    flex: 1,
    marginBottom: 95,
    overflow: 'hidden',
  },
  scrollContainerContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  carouselWrapper: {
    width: SCREEN_WIDTH,
    paddingLeft: 20,
    marginBottom: 5,
  },
  horizontalScrollContent: {
    alignItems: 'center',
    paddingRight: 20,
  },
  paddedContentWrapper: {
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: 20,
  },
  dropdownCard: {
    backgroundColor: '#1e293b',
    width: 270,
    borderRadius: 24,
    padding: 18,
    elevation: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  largeProfilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#f97316',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#f97316',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  editableNameWrapperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameInputEdit: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
  xpBox: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 14,
    marginBottom: 15,
  },
  xpLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  xpValue: {
    color: '#f97316',
    fontSize: 10,
  },
  xpBarBackground: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginTop: 6,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 3,
  },
  settingsSectionDivider: {
    color: '#f97316',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 5,
  },
  settingsToggleOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingRowLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  buildIdentityFooter: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
    paddingTop: 10,
    alignItems: 'center',
    gap: 2,
  },
  buildLabelText: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuText: {
    color: '#fff',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  logoText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  profilePic: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#f97316',
  },
  card: {
    backgroundColor: "#131d31",
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
  },
  intakeDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  intakeStatsColumn: {
    alignItems: 'center',
    flex: 1,
  },
  inlineLabelGap: {
    alignItems: 'center',
    gap: 2,
  },
  intakeLabelHeader: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  intakePrimaryNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  intakeUnitLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '500',
  },
  intakeDividerPipe: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  linearProgressBarContainer: {
    height: 10,
    backgroundColor: '#0f172a',
    borderRadius: 5,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 8,
  },
  linearProgressBarFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 5,
  },
  remainingCaloriesBelowBar: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 5,
  },
  macroSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.08)',
  },
  macroMiniText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  halfCard: {
    backgroundColor: "#131d31",
    padding: 15,
    borderRadius: 25,
    flex: 1,
  },
  cardHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
    gap: 4,
  },
  leagueBadgeIcon: {
    fontSize: 11,
  },
  leagueBadgeName: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  ringValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ringSub: {
    color: '#94a3b8',
    fontSize: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    paddingRight: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#f97316',
    width: 20,
  },
  banner: {
    backgroundColor: 'rgba(51, 65, 85, 0.85)',
    padding: 20,
    borderRadius: 25,
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginVertical: 5,
  },
  bannerBtn: {
    backgroundColor: '#f97316',
    padding: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statMain: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerContainer: {
    marginTop: 10,
  },
  timerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepsInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsCount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  graphArea: {
    height: 140,
    justifyContent: 'space-between',
    position: 'relative',
    marginTop: 15,
  },
  graphLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  graphLabel: {
    color: '#94a3b8',
    fontSize: 10,
    width: 30,
  },
  graphLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  weightPointer: {
    position: 'absolute',
    right: 0,
    left: 30,
    height: 2,
  },
  rowBetweenGraphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  legendColumn: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    maxWidth: '45%',
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  graphDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 35,
    marginTop: 10,
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: 'transparent',
  },
  navBarContent: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    height: 80,
    marginHorizontal: 15,
    borderRadius: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    width: 22,
    height: 22,
    tintColor: '#94a3b8',
  },
  navLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  navCenter: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -35,
  },
  navCenterBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#d84315',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#0f172a',
  },
  shineBar: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    opacity: 0.7,
  },
  trophyCenterBrightCircle: {
    backgroundColor: '#3b2d54',
    borderColor: '#a855f7',
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  milestoneSubheader: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  tierMainText: {
    color: '#b45309',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tierSubText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  trophyRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  trophyNodeItem: {
    alignItems: 'center',
    flex: 1,
  },
  trophyIconOuterCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
    marginBottom: 8,
  },
  trophyCircleUnlocked: {
    borderColor: '#f97316',
    backgroundColor: '#2c2421',
  },
  trophyItemTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  trophyItemStatus: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextActive: {
    color: '#f97316',
  },
  rankProgressWrapper: {
    marginTop: 5,
  },
  rankProgressBarTrack: {
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  rankProgressBarFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 3,
  },
  rankProgressPercentageLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'right',
    marginTop: 6,
  },
});