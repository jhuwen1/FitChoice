import { useRouter } from "expo-router";
import { doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

const { width } = Dimensions.get("window");
const EXERCISE_PREVIEW_IMAGES = { 
  "Barbell Bent-Over Row": "https://images.unsplash.com/photo-1534368270820-9de3d8053204?q=80&w=2070&auto=format&fit=crop", 
  "Romanian Deadlift": "https://images.unsplash.com/photo-1639653818064-53beeeb86853?q=80&w=2070&auto=format&fit=crop", 
  "Good Mornings": "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=1169&auto=format&fit=crop", 
  "T-Bar Row": "https://media.istockphoto.com/id/532792113/photo/young-man-exercising-on-t-bar-row-machine-in-gym.webp?a=1&b=1&s=612x612&w=0&k=20&c=b254xBk4kfDkp_wlWwkiLE0-WFGGMhEWgmzfVe6A2wY=", 
  "One-Arm Dumbbell Row": "https://images.unsplash.com/photo-1653773869760-5b0f846231fb?w=500&auto=format&fit=crop", 
  "Back Extensions": "https://cdn.mos.cms.futurecdn.net/Z9rZT2TnTwLCbtWKBe3T9S.jpg",
  "Incline Dumbbell Row": "https://app-media.fitbod.me/v2/546/images/landscape/0_960x540.jpg",
  "Seated Cable Row": "https://plus.unsplash.com/premium_photo-1713800445156-d7af22114f7a?q=80&w=1170&auto=format&fit=crop", 
  "Chest-supported Row": "", 
  "Face Pulls": "", 
  "Wide-grip Pull-ups": "https://images.unsplash.com/photo-1598971639058-aba3c7f09a7d?q=80&w=600&auto=format&fit=crop", 
  "Wide-grip Lat Pulldowns": "", 
  "High Cable Rows": "", 
  "Reverse Pec Deck Flys": "", 
  "Seal Rows": "", 
  "Single-arm Cable Rows": "", 
  "Barbell Curl": "", 
  "EZ-Bar Curl": "", 
  "Incline Dumbbell Curl": "", 
  "Hammer Curl": ""
};

const CATEGORY_BACKGROUNDS = { 
  upperback: "https://images.unsplash.com/photo-1578762560072-061e4c0c443e?q=80&w=600&auto=format&fit=crop", 
  midback: "https://images.unsplash.com/photo-1578762560072-061e4c0c443e?q=80&w=600&auto=format&fit=crop", 
  lowerback: "", 
  biceps: "", 
  shoulders: "" 
};

const EXERCISE_ANIMATIONS = { 
  default: "https://fitnessprogrammer.com/wp-content/uploads/2021/05/Side-Plank-With-Dumbbell-Lateral-Raise.gif" 
};

const ARM_WARMUP_CATEGORIES = [
  {
    key: "armWarmupSequence", 
    label: "Dynamic Arm Activation", 
    bg: "shoulders",
    data: [
      { id: "w1", name: "Big & Small Arm Circles" },
      { id: "w2", name: "Chest Expansions (Arm Flings)" },
      { id: "w3", name: "Band Pull-Aparts (Rear Delts)" },
      { id: "w4", name: "Light Band Bicep Curls" },
      { id: "w5", name: "Overhead Band Tricep Extensions" }
    ]
  },
  {
    key: "armCooldownSequence", 
    label: "Upper Body Flush & Recovery", 
    bg: "lowerback",
    data: [
      { id: "c1", name: "Cross-Body Shoulder Stretch" },
      { id: "c2", name: "Overhead Tricep Stretch" },
      { id: "c3", name: "Bicep & Wall Chest Opener" },
      { id: "c4", name: "Wrist & Forearm Extensor Release" }
    ]
  }
];

const ARM_MAIN_CATEGORIES = [
  { 
    key: "bicepsLong", label: "Biceps Long Head", bg: "biceps", 
    data: [
      { id: "1", name: "Incline Dumbbell Curl" },
      { id: "2", name: "Drag Curl" },
      { id: "3", name: "Barbell Curl (Narrow Grip)" },
      { id: "4", name: "Bayesian Curl (Cable)" },
      { id: "5", name: "Dumbbell Alternate Biceps Curl" },
      { id: "6", name: "Seated Cable Curl (Behind Body)" },
      { id: "7", name: "EZ-Bar Curl (Narrow Grip)" },
      { id: "8", name: "Prone Incline Incline Curl" }
    ] 
  },
  { 
    key: "bicepsShort", label: "Biceps Short Head", bg: "biceps", 
    data: [
      { id: "1", name: "Preacher Curl" },
      { id: "2", name: "Spider Curl" },
      { id: "3", name: "Concentration Curl" },
      { id: "4", name: "High Cable Curl (Crucifix)" },
      { id: "5", name: "Barbell Curl (Wide Grip)" },
      { id: "6", name: "Machine Preacher Curl" },
      { id: "7", name: "EZ-Bar Preacher Curl" },
      { id: "8", name: "Prone Dumbbell Spider Curl" }
    ] 
  },
  { 
    key: "clavicular", label: "Clavicular (Upper Chest)", bg: "chest", 
    data: [
      { id: "1", name: "Low-to-High Cable Fly" },
      { id: "2", name: "30° Incline Dumbbell Press" },
      { id: "3", name: "Incline Smith Machine Press" },
      { id: "4", name: "Incline Cable Fly" },
      { id: "5", name: "Incline Barbell Bench Press" },
      { id: "6", name: "Incline Hammer Strength Press" },
      { id: "7", name: "Reverse-Grip Bench Press" },
      { id: "8", name: "Feet-Elevated Push-Up" }
    ] 
  },
  { 
    key: "brachialis", label: "Brachialis", bg: "biceps", 
    data: [
      { id: "1", name: "Dumbbell Hammer Curl" },
      { id: "2", name: "Rope Cable Hammer Curl" },
      { id: "3", name: "Reverse Barbell Curl" },
      { id: "4", name: "Reverse EZ-Bar Curl" },
      { id: "5", name: "Preacher Hammer Curl" },
      { id: "6", name: "Cross-Body Hammer Curl" },
      { id: "7", name: "Seated Incline Hammer Curl" },
      { id: "8", name: "Reverse Cable Curl (Straight Bar)" }
    ] 
  },
  { 
    key: "tricepsLong", label: "Triceps Long Head", bg: "triceps", 
    data: [
      { id: "1", name: "Overhead Dumbbell Extension" },
      { id: "2", name: "EZ-Bar Skull Crushers" },
      { id: "3", name: "Incline Cable Overhead Extension" },
      { id: "4", name: "DB Skull Crushers (Flat)" },
      { id: "5", name: "Seated Overhead Cable Extension" },
      { id: "6", name: "Barbell JM Press" },
      { id: "7", name: "Dumbbell JM Press" },
      { id: "8", name: "Cable Skull Crushers" }
    ] 
  },
  { 
    key: "tricepsLateral", label: "Triceps Lateral Head", bg: "triceps", 
    data: [
      { id: "1", name: "Triceps Rope Pushdown" },
      { id: "2", name: "Straight Bar Pushdown" },
      { id: "3", name: "Diamond Push-ups" },
      { id: "4", name: "V-Bar Cable Pushdown" },
      { id: "5", name: "Weighted Triceps Dips" },
      { id: "6", name: "Single-Arm Cable Pushdown" },
      { id: "7", name: "Machine Triceps Dip" },
      { id: "8", name: "Dumbbell Triceps Kickbacks" }
    ] 
  },
  { 
    key: "sternal", label: "Sternal (Mid Chest)", bg: "chest", 
    data: [
      { id: "1", name: "Flat Barbell Bench Press" },
      { id: "2", name: "Flat Dumbbell Press" },
      { id: "3", name: "Pec Deck Fly" },
      { id: "4", name: "Flat Cable Fly" },
      { id: "5", name: "Hammer Strength Chest Press" },
      { id: "6", name: "Smith Machine Flat Bench" },
      { id: "7", name: "Weighted Chest Dip (Lean Forward)" },
      { id: "8", name: "Dumbbell Chest Fly" }
    ] 
  },
  { 
    key: "forearms", label: "Forearms", bg: "forearms", 
    data: [
      { id: "1", name: "Wrist Curl (Seated)" },
      { id: "2", name: "Reverse Wrist Curl" },
      { id: "3", name: "Plate Pinch Hold" },
      { id: "4", name: "Barbell Behind-the-Back Wrist Curl" },
      { id: "5", name: "Zottman Curl" },
      { id: "6", name: "Wrist Roller" },
      { id: "7", name: "Farmers Walk" },
      { id: "8", name: "Dumbbell Suitcase Hold" }
    ] 
  }
];

const ARM_LEGS_CATEGORIES = [
  { 
    key: "quads", label: "Quads", bg: "legs", 
    data: [
      { id: "1", name: "Barbell Back Squat" },
      { id: "2", name: "Leg Press" },
      { id: "3", name: "Hack Squat" },
      { id: "4", name: "Leg Extensions" },
      { id: "5", name: "Smith Machine Squat" },
      { id: "6", name: "Goblet Squat" },
      { id: "7", name: "Dumbbell Bulgarian Split Squat" },
      { id: "8", name: "Pendulum Squat" }
    ] 
  },
  { 
    key: "upperBack", label: "Upper Back", bg: "back", 
    data: [
      { id: "1", name: "Chest-supported Rows" },
      { id: "2", name: "Face Pulls" },
      { id: "3", name: "Wide-grip Pull-ups" },
      { id: "4", name: "Wide-grip Lat Pulldowns" },
      { id: "5", name: "High Cable Rows" },
      { id: "6", name: "Reverse Pec Deck Flys" },
      { id: "7", name: "Seal Rows" },
      { id: "8", name: "Single-arm Cable Rows" }
    ] 
  },
  { 
    key: "midBack", label: "Mid Back", bg: "back", 
    data: [
      { id: "1", name: "Barbell Bent-Over Row" },
      { id: "2", name: "Chest-Supported Row" },
      { id: "3", name: "Seated Cable Row" },
      { id: "4", name: "T-Bar Row" },
      { id: "5", name: "One-Arm Dumbbell Row" },
      { id: "6", name: "Wide-Grip Cable Row" },
      { id: "7", name: "Incline Dumbbell Row" },
      { id: "8", name: "Meadows Row" }
    ] 
  },
  { 
    key: "lowerBack", label: "Lower Back", bg: "back", 
    data: [
      { id: "1", name: "Romanian Deadlift" },
      { id: "2", name: "Conventional Deadlift" },
      { id: "3", name: "Good Mornings" },
      { id: "4", name: "Back Extensions (Hyperextensions)" },
      { id: "5", name: "Reverse Hyperextensions" },
      { id: "6", name: "Rack Pulls (Below Knee)" },
      { id: "7", name: "Bird Dog (Stability Exercise)" },
      { id: "8", name: "Superman Holds" }
    ] 
  },
  { 
    key: "rearDelts", label: "Rear Delts", bg: "shoulders", 
    data: [
      { id: "1", name: "Reverse Pec Deck Flys" },
      { id: "2", name: "Bent-Over Lateral Raises" },
      { id: "3", name: "Face Pulls (High Pulley)" },
      { id: "4", name: "Seated Cable Rear Delt Fly" },
      { id: "5", name: "Incline Dumbbell Rear Delt Row" },
      { id: "6", name: "Lying DB Rear Delt Raise" },
      { id: "7", name: "Single-Arm Cross-Body Cable Pull" },
      { id: "8", name: "Behind-the-Back Overhead Press" }
    ] 
  },
  { 
    key: "hamstrings", label: "Hamstrings", bg: "legs", 
    data: [
      { id: "1", name: "Lying Leg Curl" },
      { id: "2", name: "Seated Leg Curl" },
      { id: "3", name: "Stiff-Legged Deadlift" },
      { id: "4", name: "Dumbbell Romanian Deadlift" },
      { id: "5", name: "Glute-Ham Raise" },
      { id: "6", name: "Single-Leg DB RDL" },
      { id: "7", name: "Stability Ball Leg Curl" },
      { id: "8", name: "Cable Pull-Through" }
    ] 
  },
  { 
    key: "glutes", label: "Glutes", bg: "legs", 
    data: [
      { id: "1", name: "Barbell Hip Thrusts" },
      { id: "2", name: "Bulgarian Split Squats" },
      { id: "3", name: "Cable Pull-Throughs" },
      { id: "4", name: "Glute Kickbacks (Cable)" },
      { id: "5", name: "Barbell Glute Bridges" },
      { id: "6", name: "Dumbbell Sumo Squat" },
      { id: "7", name: "Deficit Reverse Lunges" },
      { id: "8", name: "Machine Hip Abductions" }
    ] 
  },
  { 
    key: "calves", label: "Calves", bg: "calves", 
    data: [
      { id: "1", name: "Standing Calf Raise" },
      { id: "2", name: "Seated Calf Raise" },
      { id: "3", name: "Leg Press Calf Press" },
      { id: "4", name: "Smith Machine Calf Raise" },
      { id: "5", name: "Single-Leg Dumbbell Calf Raise" },
      { id: "6", name: "Donkey Calf Raise" },
      { id: "7", name: "Bodyweight Tibialis Raise" },
      { id: "8", name: "Farmer's Walk on Toes" }
    ] 
  }
];

export default function ArmDominantSplit() { 
  const router = useRouter(); 
  const [activeDay, setActiveDay] = useState("MAIN"); 
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selections, setSelections] = useState({}); 
  const [workoutProgress, setWorkoutProgress] = useState({}); 
  const [xp, setXp] = useState(0);

  // --- WORKOUT ENGINE STATE --- 
  const countdownTimerRef = useRef(null); 
  const playTimerRef = useRef(null); 
  const restTimerRef = useRef(null);
  const [activeExercise, setActiveExercise] = useState(null); 
  const [activeCategoryKey, setActiveCategoryKey] = useState(null); 
  const [completedSets, setCompletedSets] = useState([]);
  const [bigCountdown, setBigCountdown] = useState(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0); 
  const [isPlayingMode, setIsPlayingMode] = useState(false);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [restRemainingSeconds, setRestRemainingSeconds] = useState(null);

  const volumeMetrics = { sets: 2, baseReps: 8, minTimePerRep: 3 };

  const getDynamicRepsForSet = (setIdx) => { 
    if (activeDay === "WARM_UP") return 20;
    return volumeMetrics.baseReps + (setIdx * 2); 
  };

  const getRequiredSafetySeconds = () => { 
    if (activeDay === "WARM_UP") return 40;
    return getDynamicRepsForSet(currentSetIndex) * volumeMetrics.minTimePerRep; 
  }; 

  const requiredSafetySeconds = getRequiredSafetySeconds(); 
  const isCompletionGateUnlocked = secondsSpent >= requiredSafetySeconds; 
  const isLastSet = currentSetIndex + 1 === volumeMetrics.sets;

  // FIXED: Changed ARMS_WARMUP_CATEGORIES to ARM_WARMUP_CATEGORIES
  const currentCategories = activeDay === "WARM_UP" ? ARM_WARMUP_CATEGORIES : activeDay === "MAIN" ? ARM_MAIN_CATEGORIES : ARM_LEGS_CATEGORIES; 

  // ========================================== 
  // --- REAL-TIME DATA LIFECYCLE & RESET --- 
  // ========================================== 
  useEffect(() => { 
    const fetchCloudUserProgressData = async () => { 
      try { 
        const user = auth.currentUser; 
        if (!user) return; 
        const todayDateString = new Date().toISOString().split("T")[0]; 
        const userRef = doc(db, "users", user.uid); 
        const userSnap = await getDoc(userRef); 
        if (userSnap.exists()) { 
          const userData = userSnap.data(); 
          if (userData.xp !== undefined) { 
            setXp(userData.xp); 
          } 
          if (userData.armSplitSelections) {
            setSelections(userData.armSplitSelections); 
          } 
          if (userData.lastWorkoutProgressDate === todayDateString) { 
            if (userData.armSplitWorkoutProgress) {
              setWorkoutProgress(userData.armSplitWorkoutProgress); 
            } 
          } else { 
            setWorkoutProgress({});
            await updateDoc(userRef, { 
              armSplitWorkoutProgress: {},
              lastWorkoutProgressDate: todayDateString 
            });
            console.log("New day detected! Progress validation arrays have been safely reset.");
          } 
        } else { 
          await setDoc(userRef, { lastWorkoutProgressDate: todayDateString }, { merge: true });
        } 
      } catch (err) { 
        console.error("Failed to load user state architecture maps: ", err); 
      } 
    }; 
    fetchCloudUserProgressData(); 
  }, []);

  const handleSelect = async (categoryKey, exerciseName) => { 
    const uniqueSelectionKey = `${activeDay}_${categoryKey}`; 
    const updatedSelections = { ...selections, [uniqueSelectionKey]: exerciseName };
    setSelections(updatedSelections); 
    setExpandedCategory(null); 
    try { 
      const user = auth.currentUser; 
      if (user) { 
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { armSplitSelections: updatedSelections }, { merge: true });
      } 
    } catch (error) {
      console.error("Failed syncing structural variant layouts: ", error); 
    } 
  };

  const processDatabaseProgressIncrement = async (earnedXp, targetProgressMap) => { 
    try { 
      const user = auth.currentUser; 
      if (!user) return;
      const todayDateString = new Date().toISOString().split("T")[0]; 
      const userRef = doc(db, "users", user.uid); 
      const executionSummaryRef = doc(db, "users", user.uid, "daily_summaries", todayDateString);
      await updateDoc(userRef, { 
        exercisesFinishedToday: increment(1), 
        lifetimeExercisesCompleted: increment(1), 
        xp: increment(earnedXp), 
        currentWorkoutStreakCount: increment(0),
        armSplitWorkoutProgress: targetProgressMap, 
        lastWorkoutProgressDate: todayDateString 
      });
      await setDoc(executionSummaryRef, { 
        exercisesCompletedCount: increment(1), 
        xpSnapshot: increment(earnedXp), 
        lastUpdatedTimestamp: new Date() 
      }, { merge: true });
    } catch (error) { 
      console.error("Error executing background sync architecture updates: ", error); 
    } 
  };

  const forceQuitActiveSession = () => { 
    clearInterval(countdownTimerRef.current); 
    clearInterval(playTimerRef.current); 
    clearInterval(restTimerRef.current); 
    setBigCountdown(null); 
    setRestRemainingSeconds(null);
    setIsPlayingMode(false); 
    setActiveExercise(null); 
  };

  const skipRestPeriodImmediately = () => { 
    clearInterval(restTimerRef.current); 
    setRestRemainingSeconds(null);
    launchPreExerciseCountdown(); 
  }; 

  const launchPreExerciseCountdown = () => {
    setBigCountdown(3); 
    countdownTimerRef.current = setInterval(() => { 
      setBigCountdown((prev) => { 
        if (prev <= 1) { 
          clearInterval(countdownTimerRef.current); 
          setIsPlayingMode(true);
          startActiveWorkoutTimer(); 
          return null; 
        } 
        return prev - 1; 
      }); 
    }, 1000);
  }; 

  const handlePlayWorkoutSession = (exerciseName, categoryKey) => {
    clearInterval(countdownTimerRef.current); 
    clearInterval(playTimerRef.current);
    clearInterval(restTimerRef.current); 
    setRestRemainingSeconds(null);
    setActiveExercise(exerciseName); 
    setActiveCategoryKey(categoryKey); 
    const trackingKey = `armDom_${activeDay}_${categoryKey}_${exerciseName}`; 
    const historicalSets = workoutProgress[trackingKey] || new Array(volumeMetrics.sets).fill(false);
    setCompletedSets(historicalSets);
    const nextUnfinishedSet = historicalSets.findIndex(done => !done); 
    const targetIdx = nextUnfinishedSet !== -1 ? nextUnfinishedSet : 0;
    setCurrentSetIndex(targetIdx); 
    setIsPlayingMode(false); 
    launchPreExerciseCountdown(); 
  };

  const startActiveWorkoutTimer = () => { 
    setSecondsSpent(0);
    clearInterval(playTimerRef.current); 
    playTimerRef.current = setInterval(() => {
      setSecondsSpent((prev) => prev + 1); 
    }, 1000); 
  }; 

  const finishActiveSetExecution = async () => { 
    if (!isCompletionGateUnlocked) return; 
    clearInterval(playTimerRef.current);
    const updatedSets = [...completedSets]; 
    updatedSets[currentSetIndex] = true; 
    setCompletedSets(updatedSets);
    const trackingKey = `armDom_${activeDay}_${activeCategoryKey}_${activeExercise}`; 
    const updatedWorkoutProgress = { ...workoutProgress, [trackingKey]: updatedSets };
    setWorkoutProgress(updatedWorkoutProgress); 
    const earnedXpAmount = isLastSet ? 30 : 15;
    setXp(prev => prev + earnedXpAmount); 
    if (!isLastSet) { 
      setCurrentSetIndex((prev) => prev + 1); 
      setIsPlayingMode(false); 
      setRestRemainingSeconds(45);
      try { 
        const user = auth.currentUser;
        if (user) { 
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { 
            xp: increment(earnedXpAmount), 
            armSplitWorkoutProgress: updatedWorkoutProgress 
          });
        } 
      } catch (err) { 
        console.error("Error saving middle step validation arrays: ", err);
      } 
      restTimerRef.current = setInterval(() => { 
        setRestRemainingSeconds((prev) => { 
          if (prev <= 1) {
            clearInterval(restTimerRef.current); 
            launchPreExerciseCountdown(); 
            return null; 
          } 
          return prev - 1; 
        }); 
      }, 1000);
    } else { 
      await processDatabaseProgressIncrement(earnedXpAmount, updatedWorkoutProgress); 
      setActiveExercise(null); 
      setIsPlayingMode(false); 
    } 
  };

  useEffect(() => { 
    return () => { 
      clearInterval(countdownTimerRef.current); 
      clearInterval(playTimerRef.current);
      clearInterval(restTimerRef.current); 
    }; 
  }, []);

  return ( 
    <View style={styles.container}> 
      {/* Header */} 
      <View style={styles.header}> 
        <View style={styles.headerTopRow}> 
          <Pressable onPress={() => router.replace("/dashboard")} style={styles.backButtonContainer}> 
            <Text style={styles.subHeader}>❮</Text> 
            <Text style={styles.subHeaderLabel}>Split Selection</Text>
          </Pressable> 
          <View style={styles.xpBadge}> 
            <Text style={styles.xpText}>{xp} XP</Text>
          </View> 
        </View> 
        <Text style={styles.mainTitle}>Arm Dominant Split</Text> 
        <Text style={styles.frequencyDropdown}>Select your preferred variations to customize your pro-grade training session.</Text> 
      </View> 
      
      {/* Tabs Switcher Row */}
      <View style={styles.navRow}> 
        <Pressable style={[styles.navPill, activeDay === "WARM_UP" && styles.activeNavPill]} onPress={() => { setActiveDay("WARM_UP"); setExpandedCategory(null); }} > 
          <Text style={[styles.navPillText, activeDay === "WARM_UP" && styles.activeNavPillText]}>Warm Up</Text> 
        </Pressable> 
        <Pressable style={[styles.navPill, activeDay === "MAIN" && styles.activeNavPill]} onPress={() => { setActiveDay("MAIN"); setExpandedCategory(null); }} > 
          <Text style={[styles.navPillText, activeDay === "MAIN" && styles.activeNavPillText]}>Arms & Chest</Text> 
        </Pressable> 
        <Pressable style={[styles.navPill, activeDay === "LEGS" && styles.activeNavPill]} onPress={() => { setActiveDay("LEGS"); setExpandedCategory(null); }} > 
          <Text style={[styles.navPillText, activeDay === "LEGS" && styles.activeNavPillText]} numberOfLines={1} adjustsFontSizeToFit > Legs & Back</Text>
        </Pressable> 
      </View> 
      
      {/* Dynamic Exercise List */} 
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {currentCategories.map((cat) => { 
          const uniqueSelectionKey = `${activeDay}_${cat.key}`;
          const isExpanded = expandedCategory === cat.key; 
          const selectedExercise = selections[uniqueSelectionKey]; 
          const bgUri = selectedExercise ? (EXERCISE_PREVIEW_IMAGES[selectedExercise] || CATEGORY_BACKGROUNDS[cat.bg]) : CATEGORY_BACKGROUNDS[cat.bg]; 
          let isCompleted = false; 
          if (selectedExercise) { 
            const trackingKey = `armDom_${activeDay}_${cat.key}_${selectedExercise}`;
            const exerciseSets = workoutProgress[trackingKey] || []; 
            isCompleted = exerciseSets.filter(Boolean).length === volumeMetrics.sets; 
          } 
          return ( 
            <View key={cat.key} style={styles.cardWrapper}> 
              <View style={[styles.cardTouchTarget, selectedExercise && { height: 130 }]}> 
                {selectedExercise ? (
                  <ImageBackground source={{ uri: bgUri }} style={styles.imageBackground} imageStyle={{ borderRadius: 24 }}> 
                    <View style={styles.darkOverlay} /> 
                    <View style={styles.cardHeaderContainer}> 
                      <Pressable style={{ flex: 1, paddingVertical: 20, paddingRight: 10 }} onPress={() => setExpandedCategory(isExpanded ? null : cat.key)} > 
                        <Text style={styles.cardCategoryTitle} numberOfLines={1}>{cat.label}</Text> 
                        <Text style={[styles.cardProgressSubtitle, { color: '#00cbd6' }]}> {selectedExercise} </Text> 
                        <Text style={styles.tapToSelectText}>TAP TO CHANGE VARIATION</Text> 
                      </Pressable> 
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8}}> 
                        <Pressable style={[styles.startWorkoutBtn, isCompleted && { backgroundColor: '#1e293b' }]} onPress={() => !isCompleted && handlePlayWorkoutSession(selectedExercise, cat.key)} > 
                          <Text style={[styles.startWorkoutBtnText, isCompleted && { color: '#94a3b8' }]}> {isCompleted ? "DONE" : "START"} </Text> 
                        </Pressable> 
                        <Pressable onPress={() => setExpandedCategory(isExpanded ? null : cat.key)} style={styles.caretContainerCircle} > 
                          <Text style={styles.caretArrowText}>{isExpanded ? "▲" : "▼"}</Text> 
                        </Pressable> 
                      </View> 
                    </View> 
                  </ImageBackground>
                ) : (
                  <Pressable style={styles.blankExerciseCardBody} onPress={() => setExpandedCategory(isExpanded ? null : cat.key)} > 
                    <View style={{ flex: 1 }}> 
                      <Text style={styles.blankCardTitle}>{cat.label}</Text> 
                      <Text style={styles.blankCardSubtitle}>TAP TO SELECT AN EXERCISE</Text> 
                    </View> 
                    <Text style={styles.blankCaretArrowText}>{isExpanded ? "▲" : "▼"}</Text> 
                  </Pressable>
                )} 
              </View> 
              {isExpanded && (
                <View style={styles.dropdownOptionsContainer}> 
                  {cat.data.map((exercise) => { 
                    const isSelected = selectedExercise === exercise.name; 
                    return ( 
                      <Pressable key={exercise.id} onPress={() => handleSelect(cat.key, exercise.name)} style={[ styles.exerciseListItemBlock, isSelected && { borderColor: '#f97316', backgroundColor: '#1c2538' } ]} > 
                        <Text style={[styles.exerciseNameText, isSelected && { color: '#f97316'}]}> {exercise.name} </Text> 
                        {isSelected && (
                          <View style={styles.selectedIcon}> 
                            <Text style={styles.selectedIconText}>✓</Text> 
                          </View>
                        )} 
                      </Pressable>
                    ); 
                  })} 
                </View>
              )} 
            </View> 
          ); 
        })}

        {/* Bottom Insight Panel */} 
        <View style={styles.kineticInsightCard}> 
          <View style={styles.insightHeaderRow}> 
            <Text style={styles.insightTitleText}>KINETIC INSIGHT</Text> 
            <Text style={{ fontSize: 16 }}>💡</Text> 
          </View> 
          <Text style={styles.insightQuoteContent}> "Prioritize arm movements today to optimize structural volume tracking. The arm-dominant split is designed for total arm hypertrophy."</Text> 
        </View> 
      </ScrollView> 

      {/* --- TIMERS & ACTIVE WORKOUT PLAYER MODALS --- */} 
      {bigCountdown !== null && (
        <Modal transparent animationType="fade" visible={bigCountdown !== null}> 
          <View style={styles.fullscreenCountdownContainer}> 
            <View style={styles.countdownGlassCircle}> 
              <Text style={styles.countdownGiantDigit}>{bigCountdown}</Text> 
              <Text style={styles.countdownSubtextTitle}>PREPARE YOUR FORM</Text> 
            </View> 
          </View> 
        </Modal>
      )} 
      
      {restRemainingSeconds !== null && (
        <Modal transparent animationType="slide" visible={restRemainingSeconds !== null}> 
          <View style={styles.fullscreenCountdownContainer}> 
            <View style={[styles.countdownGlassCircle, {borderColor: '#10B981', shadowColor: '#10B981' }]}> 
              <Text style={[styles.countdownGiantDigit, { color: '#10B981' }]}>{restRemainingSeconds}s</Text> 
              <Text style={styles.countdownSubtextTitle}>CATCH YOUR BREATH</Text> 
            </View> 
            <Pressable style={styles.skipRestPillButton} onPress={skipRestPeriodImmediately}> 
              <Text style={styles.skipRestText}>Skip Rest Period</Text> 
            </Pressable> 
          </View> 
        </Modal>
      )} 
      
      <Modal visible={isPlayingMode} animationType="slide" transparent={false}> 
        <ScrollView contentContainerStyle={styles.playerWrapperContainer} bounces={false} showsVerticalScrollIndicator={false}> 
          <View style={styles.playerTopHeaderRow}> 
            <Pressable style={styles.quitSessionCornerButton} onPress={forceQuitActiveSession}> 
              <Text style={styles.quitText}>X Close</Text> 
            </Pressable> 
            <View style={styles.setTagBadgePill}> 
              <Text style={styles.setTagTextContent}>SET {currentSetIndex + 1} OF {volumeMetrics.sets}</Text> 
            </View> 
            <View style={{ width: 60 }} /> 
          </View> 
          <View style={styles.exerciseldentityTitleSection}> 
            <Text style={styles.activeExerciseTitleHeading}>{activeExercise}</Text> 
            <Text style={styles.subtextRepetitionVolumeGoal}> Target: <Text style={{ color: '#F97316', fontWeight: 'bold' }}>{getDynamicRepsForSet(currentSetIndex)} Reps</Text> </Text> 
          </View> 
          <View style={styles.timerControlCenterDashboard}> 
            <Text style={styles.timerClockCountDigits}>{secondsSpent}s</Text> 
            <Text style={styles.timerPaceBenchmarkSubLabel}>Minimum processing window: {requiredSafetySeconds}s</Text> 
            <Text style={[styles.paceWarningIndicatorText, !isCompletionGateUnlocked && { color: '#EF4444' }]}> {isCompletionGateUnlocked ? "Safe Execution Gate Complete - Unlocked" : `Complete movement path (${Math.max(0, requiredSafetySeconds - secondsSpent)}s left)`} </Text> 
          </View> 
          <View style={styles.centerStageGraphicsFrameContainer}> 
            <View style={styles.embeddedAnimationCardHolderCanvas}> 
              <Image source={{ uri: EXERCISE_ANIMATIONS.default }} style={styles.gameplayVisualAssetGifImage} resizeMode="contain" /> 
            </View> 
          </View> 
          <View style={styles.footerActionDashboardZone}> 
            <Pressable style={[styles.giantSuccessVerificationButton, !isCompletionGateUnlocked && { backgroundColor: '#252233', opacity: 0.6}]} onPress={finishActiveSetExecution} disabled={!isCompletionGateUnlocked} > 
              <Text style={styles.successActionBtnContentText}> {isLastSet ? "FINISH EXERCISE " : "COMPLETE SET & REST"} </Text> 
            </Pressable> 
          </View> 
        </ScrollView> 
      </Modal> 
    </View> 
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: "#090d16" }, 
  header: { padding: 20, paddingTop: 50}, 
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, 
  backButtonContainer: {flexDirection: "row", alignItems: "center", gap: 5 }, 
  subHeader: { color: "#ffffff", fontSize: 18}, 
  subHeaderLabel: { color: "#94a3b8", fontSize: 14}, 
  xpBadge: { backgroundColor: "#1e293b", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }, 
  xpText: { color: "#f97316", fontSize: 12, fontWeight: "bold" }, 
  mainTitle: { color: "#fff", fontSize: 26, fontWeight: "bold", marginTop: 15}, 
  frequencyDropdown: { color: "#64748b", fontSize: 13, marginTop: 5, lineHeight: 18}, 
  navRow: { flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 15, width: "100%" }, 
  navPill: { flex: 1, backgroundColor: "#1e293b", paddingVertical: 12, paddingHorizontal: 4, borderRadius: 20, alignItems: "center", justifyContent: "center" }, 
  activeNavPill: { backgroundColor: "#f97316" }, 
  navPillText: { color: "#94a3b8", fontSize: 11, fontWeight: "700", textAlign: "center" }, 
  activeNavPillText: { color: "#fff" }, 
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 30 }, 
  cardWrapper: { marginBottom: 15 }, 
  cardTouchTarget: { height: 90, borderRadius: 24, overflow: "hidden" }, 
  imageBackground: { width: "100%", height: "100%", justifyContent: "center" }, 
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.6)" }, 
  cardHeaderContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 }, 
  cardCategoryTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" }, 
  cardProgressSubtitle: { fontSize: 13, fontWeight: "600", marginTop: 2 }, 
  tapToSelectText: { color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: "700", marginTop: 4, letterSpacing: 0.5}, 
  startWorkoutBtn: {backgroundColor: "#f97316", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }, 
  startWorkoutBtnText: { color: "#fff", fontSize: 11, fontWeight: "bold" }, 
  caretContainerCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }, 
  caretArrowText: { color: "#fff", fontSize: 10 }, 
  blankExerciseCardBody: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#1e293b", paddingHorizontal: 20, borderRadius: 24}, 
  blankCardTitle: { color: "#94a3b8", fontSize: 16, fontWeight: "bold" }, 
  blankCardSubtitle: { color: "#64748b", fontSize: 11, fontWeight: "600", marginTop: 2 }, 
  blankCaretArrowText: { color: "#64748b", fontSize: 12}, 
  dropdownOptionsContainer: { backgroundColor: "#1e293b", borderRadius: 20, marginTop: 8, padding: 8, gap: 6}, 
  exerciseListItemBlock: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: "transparent" }, 
  exerciseNameText: { color: "#cbd5e1", fontSize: 14, fontWeight: "600" }, 
  selectedIcon: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#f97316", alignItems: "center", justifyContent: "center" }, 
  selectedIconText: { color: "#fff", fontSize: 10, fontWeight: "bold" }, 
  kineticInsightCard: { backgroundColor: "#1c2538", borderRadius: 24, padding: 20, marginTop: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.03)" }, 
  insightHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8}, 
  insightTitleText: { color: "#f97316", fontSize: 12, fontWeight: "bold", letterSpacing: 1 }, 
  insightQuoteContent: { color: "#94a3b8", fontSize: 13, lineHeight: 20}, 
  fullscreenCountdownContainer: { flex: 1, backgroundColor: "rgba(15,23,42,0.95)", alignItems: "center", justifyContent: "center" }, 
  countdownGlassCircle: { width: 200, height: 200, borderRadius: 100, borderWidth: 4, borderColor: "#f97316", alignItems: "center", justifyContent: "center", shadowColor: "#f97316", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 15}, 
  countdownGiantDigit: { color: "#fff", fontSize: 64, fontWeight: "900" }, 
  countdownSubtextTitle: { color: "#64748b", fontSize: 11, fontWeight: "bold", letterSpacing: 1, marginTop: 8}, 
  skipRestPillButton: {marginTop: 30, backgroundColor: "#10B981", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }, 
  skipRestText: { color: "#fff", fontWeight: "bold", fontSize: 14}, 
  playerWrapperContainer: { flexGrow: 1, backgroundColor: "#0f172a", paddingHorizontal: 24, paddingVertical: 40 }, 
  playerTopHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }, 
  quitSessionCornerButton: { padding: 8}, 
  quitText: { color: "#64748b", fontSize: 15, fontWeight: "600" }, 
  setTagBadgePill: { backgroundColor: "#1e293b", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 }, 
  setTagTextContent: { color: "#00cbd6", fontSize: 11, fontWeight: "bold", letterSpacing: 0.5}, 
  exerciseldentityTitleSection: { alignItems: "center", marginBottom: 25 }, 
  activeExerciseTitleHeading: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center" }, 
  subtextRepetitionVolumeGoal: { color: "#94a3b8", fontSize: 14, marginTop: 6}, 
  timerControlCenterDashboard: { backgroundColor: "#1e293b", borderRadius: 24, padding: 20, alignItems: "center", marginBottom: 25 }, 
  timerClockCountDigits: { color: "#fff", fontSize: 48, fontWeight: "900" }, 
  timerPaceBenchmarkSubLabel: { color: "#64748b", fontSize: 11, marginTop: 4 }, 
  paceWarningIndicatorText: { color: "#10B981", fontSize: 11, fontWeight: "600", marginTop: 8, textAlign: "center" }, 
  centerStageGraphicsFrameContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginBottom: 25 }, 
  embeddedAnimationCardHolderCanvas: { width: "100%", height: 200, backgroundColor: "#1c2538", borderRadius: 24, overflow: "hidden", justifyContent: "center", alignItems: "center" }, 
  gameplayVisualAssetGifImage: { width: "90%", height: "90%" }, 
  footerActionDashboardZone: { justifyContent: "flex-end" }, 
  giantSuccessVerificationButton: { backgroundColor: "#f97316", width: "100%", paddingVertical: 18, borderRadius: 20, alignItems: "center", shadowColor: "#f97316", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8}, 
  successActionBtnContentText: { color: "#fff", fontSize: 16, fontWeight: "bold", letterSpacing: 0.5} 
});