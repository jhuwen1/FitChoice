import { useRouter } from "expo-router";
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
// --- INTEGRATED DATABASE PIPELINE REFS ---
import { doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const { width } = Dimensions.get("window");

// --- HIGH-QUALITY STATIC EXERCISE IMAGE PREVIEWS ---
const EXERCISE_PREVIEW_IMAGES = {
  // Clavicular Head (Upper Chest)
  "Low-to-High Cable Fly": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  "30° Incline Smith Machine Press": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
  "Incline Cable Fly": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  "Reverse-Grip Smith Machine Bench Press": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
  "30° Incline Dumbbell Press": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop",
  "Single-Arm Incline Cable Press": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  "Guillotine Press (Low Incline)": "https://images.unsplash.com/photo-1590477949969-90d52b9f0df4?q=80&w=600&auto=format&fit=crop",
  "Feet-Elevated Deficit Push-Up": "https://images.unsplash.com/photo-1598971639058-aba3c7f09a7d?q=80&w=600&auto=format&fit=crop",

  // Sternal Head (Mid/Lower Chest)
  "Flat Cable Fly": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  "Pec Deck Fly": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
  "Flat Dumbbell Press": "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop",
  "Smith Machine Flat Bench Press": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
  "Wide-Grip Barbell Bench Press": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
  "Machine Chest Press": "https://images.unsplash.com/photo-1590477949969-90d52b9f0df4?q=80&w=600&auto=format&fit=crop",
  "Weighted Chest Dip (Forward Lean)": "https://images.unsplash.com/photo-1598971639058-aba3c7f09a7d?q=80&w=600&auto=format&fit=crop",
  "Flat Dumbbell Fly": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",

  // Upper Back
  "Chest-supported Row": "https://images.unsplash.com/photo-1590477949969-90d52b9f0df4?q=80&w=600&auto=format&fit=crop",
  "Face Pulls": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  "Wide-grip Pull-ups": "https://images.unsplash.com/photo-1598971639058-aba3c7f09a7d?q=80&w=600&auto=format&fit=crop",
  "Wide-grip Lat Pulldowns": "https://images.unsplash.com/photo-1578762560072-061e4c0c443e?q=80&w=600&auto=format&fit=crop",
  "High Cable Rows": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  "Reverse Pec Deck Flys": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
  "Seal Rows": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
  "Single-arm Cable Rows": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",

  // Mid & Lower Back
  "Barbell Bent-Over Row": "https://images.unsplash.com/photo-1603287634276-ae4efe00774a?q=80&w=600&auto=format&fit=crop",
  "Romanian Deadlift": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  "Good Mornings": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
  "T-Bar Row": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
  "One-Arm Dumbbell Row": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  "Back Extensions": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
  "Incline Dumbbell Row": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  "Seated Cable Row": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",

  // Side Delts
  "Machine Lateral Raise": "https://images.unsplash.com/photo-1590477949969-90d52b9f0df4?q=80&w=600&auto=format&fit=crop",
  "Cable Lateral Raise": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  "Dumbbell Lateral Raise": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  "Smith Machine Lateral Raise": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
  "Lever Lateral Raise": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
  "Plate Raise": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  "Band Lateral Raise": "https://images.unsplash.com/photo-1598971639058-aba3c7f09a7d?q=80&w=600&auto=format&fit=crop",
  "Resistance Band Pull Apart": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",

  // Biceps
  "Barbell Curl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  "EZ-Bar Curl": "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop",
  "Incline Dumbbell Curl": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop",
  "Hammer Curl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  "Preacher Curl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
  "Cable Curl (Straight Bar)": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  "Concentration Curl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  "Spider Curl": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",

  // Triceps
  "Tricep Rope Pushdown": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  "Overhead Rope Extension": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  "Tricep Dips": "https://images.unsplash.com/photo-1598971639058-aba3c7f09a7d?q=80&w=600&auto=format&fit=crop",
  "Skull Crushers": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
  "Close-Grip Bench Press": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
  "Dumbbell Kickback": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  "EZ-Bar Skull Crusher": "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop",
  "Machine Tricep Press": "https://images.unsplash.com/photo-1590477949969-90d52b9f0df4?q=80&w=600&auto=format&fit=crop"
};

const CATEGORY_BACKGROUNDS = {
  upperback: "https://images.unsplash.com/photo-1603287634276-ae4efe00774a?q=80&w=600&auto=format&fit=crop",
  midback: "https://images.unsplash.com/photo-1578762560072-061e4c0c443e?q=80&w=600&auto=format&fit=crop",
  lowerback: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=600&auto=format&fit=crop",
  biceps: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  chest: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
  triceps: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
  shoulders: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  // FIXED: Added fallback assets for the leg tags present in CHEST_DAY_II
  legs: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
  calves: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
  core: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  forearms: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop"
};
// --- CATEGORIES POOL CONFIG ---

const CHEST_WARMUP_CATEGORIES = [
  {
    key: "warmupRoutine", label: "Dynamic Warm-up Sequence", bg: "shoulders",
    data: [
      { id: "w1", name: "Arm Circles" },
      { id: "w2", name: "Cat-Cow Stretch" },
      { id: "w3", name: "Scapular Pull-ups" },
      { id: "w4", name: "Bodyweight Squats" },
      { id: "w5", name: "Band Dislocates" }
    ]
  },
  {
    key: "cooldownRoutine", label: "Post-Workout Recovery Cool Down", bg: "lowerback",
    data: [
      { id: "c1", name: "Child's Pose Stretch" },
      { id: "c2", name: "Static Lat Stretch" },
      { id: "c3", name: "Cobra Stretch" },
      { id: "c4", name: "Deep Seated Glute Stretch" }
    ]
  }
];

const CHEST_DAY_I_CATEGORIES = [
  { 
    key: "clavicularHead", label: "Clavicular Head", bg: "chest", 
    data: [
      { id: "1", name: "Low-to-High Cable Fly" }, 
      { id: "2", name: "30° Incline Smith Machine Press" },
      { id: "3", name: "Incline Cable Fly" },
      { id: "4", name: "Reverse-Grip Smith Machine Bench Press" },
      { id: "5", name: "30° Incline Dumbbell Press" },
      { id: "6", name: "Single-Arm Incline Cable Press" },
      { id: "7", name: "Guillotine Press (Low Incline)" },
      { id: "8", name: "Feet-Elevated Deficit Push-Up" }
    ] 
  },
  { 
    key: "sternalHead", label: "Sternal Head", bg: "chest", 
    data: [
      { id: "1", name: "Flat Cable Fly" }, 
      { id: "2", name: "Pec Deck Fly" }, 
      { id: "3", name: "Flat Dumbbell Press" }, 
      { id: "4", name: "Smith Machine Flat Bench Press" }, 
      { id: "5", name: "Wide-Grip Barbell Bench Press" }, 
      { id: "6", name: "Machine Chest Press" }, 
      { id: "7", name: "Weighted Chest Dip (Forward Lean)" }, 
      { id: "8", name: "Flat Dumbbell Fly" }
    ] 
  },
  { 
    key: "upperBack", label: "Upper Back", bg: "upperback", 
    data: [
      { id: "1", name: "Chest-supported Row" },
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
    key: "midLowerBack", label: "Mid & Lower Back", bg: "midback", 
    data: [
      { id: "1", name: "Barbell Bent-Over Row" },
      { id: "2", name: "Romanian Deadlift" },
      { id: "3", name: "Good Mornings" },
      { id: "4", name: "T-Bar Row" },
      { id: "5", name: "One-Arm Dumbbell Row" },
      { id: "6", name: "Back Extensions" },
      { id: "7", name: "Incline Dumbbell Row" },
      { id: "8", name: "Seated Cable Row" }
    ] 
  },
  { 
    key: "sideDelts", label: "Side Delts", bg: "shoulders", 
    data: [
      { id: "1", name: "Machine Lateral Raise" },
      { id: "2", name: "Cable Lateral Raise" },
      { id: "3", name: "Dumbbell Lateral Raise" },
      { id: "4", name: "Smith Machine Lateral Raise" },
      { id: "5", name: "Lever Lateral Raise" },
      { id: "6", name: "Plate Raise" },
      { id: "7", name: "Band Lateral Raise" },
      { id: "8", name: "Resistance Band Pull Apart" }
    ] 
  },
  { 
    key: "biceps", label: "Biceps", bg: "biceps", 
    data: [
      { id: "1", name: "Barbell Curl" },
      { id: "2", name: "EZ-Bar Curl" },
      { id: "3", name: "Incline Dumbbell Curl" },
      { id: "4", name: "Hammer Curl" },
      { id: "5", name: "Preacher Curl" },
      { id: "6", name: "Cable Curl (Straight Bar)" },
      { id: "7", name: "Concentration Curl" },
      { id: "8", name: "Spider Curl" }
    ] 
  },
  { 
    key: "triceps", label: "Triceps", bg: "triceps", 
    data: [
      { id: "1", name: "Tricep Rope Pushdown" },
      { id: "2", name: "Overhead Rope Extension" },
      { id: "3", name: "Tricep Dips" },
      { id: "4", name: "Skull Crushers" },
      { id: "5", name: "Close-Grip Bench Press" },
      { id: "6", name: "Dumbbell Kickback" },
      { id: "7", name: "EZ-Bar Skull Crusher" },
      { id: "8", name: "Machine Tricep Press" }
    ] 
  }
];

const CHEST_DAY_II_CATEGORIES = [
  { 
    key: "quads", label: "Quads", bg: "legs", 
    data: [
      { id: "1", name: "Barbell Back Squat" },
      { id: "2", name: "Barbell Front Squat" },
      { id: "3", name: "Leg Press" },
      { id: "4", name: "Smith Machine Squat" },
      { id: "5", name: "Hack Squat" },
      { id: "6", name: "V-Squat" },
      { id: "7", name: "Leg Extension" },
      { id: "8", name: "Pendulum Squat" }
    ] 
  },
  { 
    key: "hamstrings", label: "Hamstrings", bg: "legs", 
    data: [
      { id: "1", name: "Romanian Deadlift" },
      { id: "2", name: "Conventional Deadlift" },
      { id: "3", name: "Lying Leg Curl" },
      { id: "4", name: "Seated Leg Curl" },
      { id: "5", name: "Standing Leg Curl" },
      { id: "6", name: "Nordic Curls" },
      { id: "7", name: "Good Mornings" },
      { id: "8", name: "Glute-Ham Raise" }
    ] 
  },
  { 
    key: "glutes", label: "Glutes", bg: "legs", 
    data: [
      { id: "1", name: "Barbell Hip Thrust" },
      { id: "2", name: "Smith Machine Hip Thrust" },
      { id: "3", name: "Bulgarian Split Squat" },
      { id: "4", name: "Pendulum Squat" },
      { id: "5", name: "Leg Press (Wide Stance)" },
      { id: "6", name: "Machine Leg Press (Glute Focused)" },
      { id: "7", name: "Cable Pull Through" },
      { id: "8", name: "Dumbbell Step-Ups" }
    ] 
  },
  { 
    key: "calves", label: "Calves", bg: "calves", 
    data: [
      { id: "1", name: "Machine Calf Raise" },
      { id: "2", name: "Seated Calf Raise" },
      { id: "3", name: "Standing Calf Raise" },
      { id: "4", name: "Leg Press Calf Raise" },
      { id: "5", name: "Dumbbell Calf Raise" },
      { id: "6", name: "Barbell Calf Raise" },
      { id: "7", name: "Smith Machine Calf Raise" },
      { id: "8", name: "Jump Rope" }
    ] 
  },
  { 
    key: "core", label: "Core", bg: "core", 
    data: [
      { id: "1", name: "Ab Wheel Rollout" },
      { id: "2", name: "Cable Crunch" },
      { id: "3", name: "Machine Crunch" },
      { id: "4", name: "Decline Sit-ups" },
      { id: "5", name: "Hanging Leg Raise" },
      { id: "6", name: "Rope Cable Crunch" },
      { id: "7", name: "Machine Abs" },
      { id: "8", name: "Plate Weighted Sit-up" }
    ] 
  },
  { 
    key: "forearms", label: "Forearms", bg: "forearms", 
    data: [
      { id: "1", name: "Wrist Curl (Seated)" },
      { id: "2", name: "Reverse Wrist Curl" },
      { id: "3", name: "Hammer Curl" },
      { id: "4", name: "Plate Pinch Hold" },
      { id: "5", name: "Zottman Curl" },
      { id: "6", name: "Farmer's Carry" },
      { id: "7", name: "Reverse Curl" },
      { id: "8", name: "Wrist Roller" }
    ] 
  }
];

const EXERCISE_ANIMATIONS = { default: "https://via.placeholder.com/150" };

export default function ChestDominantSplit() { 
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

  // FIXED: Tied target layout routing cleanly to Chest Categories instead of broken Arm variables
  const currentCategories = activeDay === "WARM_UP" 
    ? CHEST_WARMUP_CATEGORIES 
    : activeDay === "MAIN" 
    ? CHEST_DAY_I_CATEGORIES 
    : CHEST_DAY_II_CATEGORIES; 

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
          if (userData.chestSplitSelections) {
            setSelections(userData.chestSplitSelections); 
          } 
          if (userData.lastWorkoutProgressDate === todayDateString) { 
            if (userData.chestSplitWorkoutProgress) {
              setWorkoutProgress(userData.chestSplitWorkoutProgress); 
            } 
          } else { 
            setWorkoutProgress({});
            await updateDoc(userRef, { 
              chestSplitWorkoutProgress: {},
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
        await setDoc(userRef, { chestSplitSelections: updatedSelections }, { merge: true });
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
        chestSplitWorkoutProgress: targetProgressMap, 
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
    const trackingKey = `chestDom_${activeDay}_${categoryKey}_${exerciseName}`; 
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
    const trackingKey = `chestDom_${activeDay}_${activeCategoryKey}_${activeExercise}`; 
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
            chestSplitWorkoutProgress: updatedWorkoutProgress 
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
        <Text style={styles.mainTitle}>Chest Dominant Split</Text> 
        <Text style={styles.frequencyDropdown}>Select your preferred variations to customize your pro-grade training session.</Text> 
      </View> 
      
      {/* Tabs Switcher Row */}
      <View style={styles.navRow}> 
        <Pressable style={[styles.navPill, activeDay === "WARM_UP" && styles.activeNavPill]} onPress={() => { setActiveDay("WARM_UP"); setExpandedCategory(null); }} > 
          <Text style={[styles.navPillText, activeDay === "WARM_UP" && styles.activeNavPillText]}>Warm Up</Text> 
        </Pressable> 
        <Pressable style={[styles.navPill, activeDay === "MAIN" && styles.activeNavPill]} onPress={() => { setActiveDay("MAIN"); setExpandedCategory(null); }} > 
          <Text style={[styles.navPillText, activeDay === "MAIN" && styles.activeNavPillText]}>Chest & Back</Text> 
        </Pressable> 
        <Pressable style={[styles.navPill, activeDay === "LEGS" && styles.activeNavPill]} onPress={() => { setActiveDay("LEGS"); setExpandedCategory(null); }} > 
          <Text style={[styles.navPillText, activeDay === "LEGS" && styles.activeNavPillText]} numberOfLines={1} adjustsFontSizeToFit > Legs & Acc</Text>
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
            const trackingKey = `chestDom_${activeDay}_${cat.key}_${selectedExercise}`;
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
          <Text style={styles.insightQuoteContent}> "Prioritize compound pressing patterns and deep loaded stretch variants early to optimize chest hypertrophy and mechanical tension tracking."</Text> 
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