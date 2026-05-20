import { useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";

const { width, height } = Dimensions.get("window");

const MASTER_POOL = {
  daya: {
    title: "Arm Dominant - Upper split",
    categories: [
      { key: "bicepsLong", label: "Biceps Long Head", data: [{ id: "1", name: "Incline Dumbbell Curl" }, { id: "2", name: "Drag Curl" }, { id: "3", name: "Barbell Curl (Narrow Grip)" }, { id: "4", name: "Bayesian Curl (Cable)" }, { id: "5", name: "Dumbbell Alternate Biceps Curl" }, { id: "6", name: "Seated Cable Curl (Behind Body)" }, { id: "7", name: "EZ-Bar Curl (Narrow Grip)" }, { id: "8", name: "Prone Incline Incline Curl" }] },
      { key: "bicepsShort", label: "Biceps Short Head", data: [{ id: "1", name: "Preacher Curl" }, { id: "2", name: "Spider Curl" }, { id: "3", name: "Concentration Curl" }, { id: "4", name: "High Cable Curl (Crucifix)" }, { id: "5", name: "Barbell Curl (Wide Grip)" }, { id: "6", name: "Machine Preacher Curl" }, { id: "7", name: "EZ-Bar Preacher Curl" }, { id: "8", name: "Prone Dumbbell Spider Curl" }] },
      { key: "clavicular", label: "Clavicular (Upper Chest)", data: [{ id: "1", name: "Low-to-High Cable Fly" }, { id: "2", name: "30° Incline Dumbbell Press" }, { id: "3", name: "Incline Smith Machine Press" }, { id: "4", name: "Incline Cable Fly" }, { id: "5", name: "Incline Barbell Bench Press" }, { id: "6", name: "Incline Hammer Strength Press" }, { id: "7", name: "Reverse-Grip Bench Press" }, { id: "8", name: "Feet-Elevated Push-Up" }] },
      { key: "brachialis", label: "Brachialis", data: [{ id: "1", name: "Dumbbell Hammer Curl" }, { id: "2", name: "Rope Cable Hammer Curl" }, { id: "3", name: "Reverse Barbell Curl" }, { id: "4", name: "Reverse EZ-Bar Curl" }, { id: "5", name: "Preacher Hammer Curl" }, { id: "6", name: "Cross-Body Hammer Curl" }, { id: "7", name: "Seated Incline Hammer Curl" }, { id: "8", name: "Reverse Cable Curl (Straight Bar)" }] },
      { key: "tricepsLong", label: "Triceps Long Head", data: [{ id: "1", name: "Overhead Dumbbell Extension" }, { id: "2", name: "EZ-Bar Skull Crushers" }, { id: "3", name: "Incline Cable Overhead Extension" }, { id: "4", name: "DB Skull Crushers (Flat)" }, { id: "5", name: "Seated Overhead Cable Extension" }, { id: "6", name: "Barbell JM Press" }, { id: "7", name: "Dumbbell JM Press" }, { id: "8", name: "Cable Skull Crushers" }] },
      { key: "tricepsLateral", label: "Triceps Lateral Head", data: [{ id: "1", name: "Triceps Rope Pushdown" }, { id: "2", name: "Straight Bar Pushdown" }, { id: "3", name: "Diamond Push-ups" }, { id: "4", name: "V-Bar Cable Pushdown" }, { id: "5", name: "Weighted Triceps Dips" }, { id: "6", name: "Single-Arm Cable Pushdown" }, { id: "7", name: "Machine Triceps Dip" }, { id: "8", name: "Dumbbell Triceps Kickbacks" }] },
      { key: "sternal", label: "Sternal (Mid Chest)", data: [{ id: "1", name: "Flat Barbell Bench Press" }, { id: "2", name: "Flat Dumbbell Press" }, { id: "3", name: "Pec Deck Fly" }, { id: "4", name: "Flat Cable Fly" }, { id: "5", name: "Hammer Strength Chest Press" }, { id: "6", name: "Smith Machine Flat Bench" }, { id: "7", name: "Weighted Chest Dip (Lean Forward)" }, { id: "8", name: "Dumbbell Chest Fly" }] },
      { key: "forearms", label: "Forearms", data: [{ id: "1", name: "Wrist Curl (Seated)" }, { id: "2", name: "Reverse Wrist Curl" }, { id: "3", name: "Plate Pinch Hold" }, { id: "4", name: "Barbell Behind-the-Back Wrist Curl" }, { id: "5", name: "Zottman Curl" }, { id: "6", name: "Wrist Roller" }, { id: "7", name: "Farmers Walk" }, { id: "8", name: "Dumbbell Suitcase Hold" }] }
    ]
  },
  dayaa: {
    title: "Arm Dominant - Posterior/Lower split",
    categories: [
      { key: "quads", label: "Quads", data: [{ id: "1", name: "Barbell Back Squat" }, { id: "2", name: "Leg Press" }, { id: "3", name: "Hack Squat" }, { id: "4", name: "Leg Extensions" }, { id: "5", name: "Smith Machine Squat" }, { id: "6", name: "Goblet Squat" }, { id: "7", name: "Dumbbell Bulgarian Split Squat" }, { id: "8", name: "Pendulum Squat" }] },
      { key: "upperBack", label: "Upper Back", data: [{ id: "1", name: "Chest-supported Rows" }, { id: "2", name: "Face Pulls" }, { id: "3", name: "Wide-grip Pull-ups" }, { id: "4", name: "Wide-grip Lat Pulldowns" }, { id: "5", name: "High Cable Rows" }, { id: "6", name: "Reverse Pec Deck Flys" }, { id: "7", name: "Seal Rows" }, { id: "8", name: "Single-arm Cable Rows" }] },
      { key: "midBack", label: "Middle Back", data: [{ id: "1", name: "Barbell Bent-Over Row" }, { id: "2", name: "Chest-Supported Row" }, { id: "3", name: "Seated Cable Row" }, { id: "4", name: "T-Bar Row" }, { id: "5", name: "One-Arm Dumbbell Row" }, { id: "6", name: "Wide-Grip Cable Row" }, { id: "7", name: "Incline Dumbbell Row" }, { id: "8", name: "Meadows Row" }] },
      { key: "lowerBack", label: "Lower Back", data: [{ id: "1", name: "Romanian Deadlift" }, { id: "2", name: "Conventional Deadlift" }, { id: "3", name: "Good Mornings" }, { id: "4", name: "Back Extensions (Hyperextensions)" }, { id: "5", name: "Reverse Hyperextensions" }, { id: "6", name: "Rack Pulls (Below Knee)" }, { id: "7", name: "Bird Dog (Stability Exercise)" }, { id: "8", name: "Superman Holds" }] },
      { key: "rearDelts", label: "Rear Delts", data: [{ id: "1", name: "Reverse Pec Deck Flys" }, { id: "2", name: "Bent-Over Lateral Raises" }, { id: "3", name: "Face Pulls (High Pulley)" }, { id: "4", name: "Seated Cable Rear Delt Fly" }, { id: "5", name: "Incline Dumbbell Rear Delt Row" }, { id: "6", name: "Lying DB Rear Delt Raise" }, { id: "7", name: "Single-Arm Cross-Body Cable Pull" }, { id: "8", name: "Behind-the-Back Overhead Press" }] },
      { key: "hamstrings", label: "Hamstrings", data: [{ id: "1", name: "Lying Leg Curl" }, { id: "2", name: "Seated Leg Curl" }, { id: "3", name: "Stiff-Legged Deadlift" }, { id: "4", name: "Dumbbell Romanian Deadlift" }, { id: "5", name: "Glute-Ham Raise" }, { id: "6", name: "Single-Leg DB RDL" }, { id: "7", name: "Stability Ball Leg Curl" }, { id: "8", name: "Cable Pull-Through" }] },
      { key: "glutes", label: "Glutes", data: [{ id: "1", name: "Barbell Hip Thrusts" }, { id: "2", name: "Bulgarian Split Squats" }, { id: "3", name: "Cable Pull-Throughs" }, { id: "4", name: "Glute Kickbacks (Cable)" }, { id: "5", name: "Barbell Glute Bridges" }, { id: "6", name: "Dumbbell Sumo Squat" }, { id: "7", name: "Deficit Reverse Lunges" }, { id: "8", name: "Machine Hip Abductions" }] },
      { key: "calves", label: "Calves", data: [{ id: "1", name: "Standing Calf Raise" }, { id: "2", name: "Seated Calf Raise" }, { id: "3", name: "Leg Press Calf Press" }, { id: "4", name: "Smith Machine Calf Raise" }, { id: "5", name: "Single-Leg Dumbbell Calf Raise" }, { id: "6", name: "Donkey Calf Raise" }, { id: "7", name: "Bodyweight Tibialis Raise" }, { id: "8", name: "Farmer's Walk on Toes" }] }
    ]
  },
  dayi: {
    title: "Chest Dominant - Upper Split",
    categories: [
      { key: "clavicularHead", label: "Clavicular Head", data: [{ id: "1", name: "Low-to-High Cable Fly" }, { id: "2", name: "30° Incline Smith Machine Press" }, { id: "3", name: "Incline Cable Fly" }, { id: "4", name: "Reverse-Grip Smith Machine Bench Press" }, { id: "5", name: "30° Incline Dumbbell Press" }, { id: "6", name: "Single-Arm Incline Cable Press" }, { id: "7", name: "Guillotine Press (Low Incline)" }, { id: "8", name: "Feet-Elevated Deficit Push-Up" }] },
      { key: "sternalHead", label: "Sternal Head", data: [{ id: "1", name: "Flat Cable Fly" }, { id: "2", name: "Pec Deck Fly" }, { id: "3", name: "Flat Dumbbell Press" }, { id: "4", name: "Smith Machine Flat Bench Press" }, { id: "5", name: "Wide-Grip Barbell Bench Press" }, { id: "6", name: "Machine Chest Press" }, { id: "7", name: "Weighted Chest Dip (Forward Lean)" }, { id: "8", name: "Flat Dumbbell Fly" }] },
      { key: "upperBack", label: "Upper Back", data: [{ id: "1", name: "Chest-supported Row" }, { id: "2", name: "Face Pulls" }, { id: "3", name: "Wide-grip Pull-ups" }, { id: "4", name: "Wide-grip Lat Pulldowns" }, { id: "5", name: "High Cable Rows" }, { id: "6", name: "Reverse Pec Deck Flys" }, { id: "7", name: "Seal Rows" }, { id: "8", name: "Single-arm Cable Rows" }] },
      { key: "midLowerBack", label: "Mid & Lower Back", data: [{ id: "1", name: "Barbell Bent-Over Row" }, { id: "2", name: "Romanian Deadlift" }, { id: "3", name: "Good Mornings" }, { id: "4", name: "T-Bar Row" }, { id: "5", name: "One-Arm Dumbbell Row" }, { id: "6", name: "Back Extensions" }, { id: "7", name: "Incline Dumbbell Row" }, { id: "8", name: "Seated Cable Row" }] },
      { key: "sideDelts", label: "Side Delts", data: [{ id: "1", name: "Machine Lateral Raise" }, { id: "2", name: "Cable Lateral Raise" }, { id: "3", name: "Dumbbell Lateral Raise" }, { id: "4", name: "Smith Machine Lateral Raise" }, { id: "5", name: "Lever Lateral Raise" }, { id: "6", name: "Plate Raise" }, { id: "7", name: "Band Lateral Raise" }, { id: "8", name: "Resistance Band Pull Apart" }] },
      { key: "biceps", label: "Biceps", data: [{ id: "1", name: "Barbell Curl" }, { id: "2", name: "EZ-Bar Curl" }, { id: "3", name: "Incline Dumbbell Curl" }, { id: "4", name: "Hammer Curl" }, { id: "5", name: "Preacher Curl" }, { id: "6", name: "Cable Curl (Straight Bar)" }, { id: "7", name: "Concentration Curl" }, { id: "8", name: "Spider Curl" }] },
      { key: "triceps", label: "Triceps", data: [{ id: "1", name: "Tricep Rope Pushdown" }, { id: "2", name: "Overhead Rope Extension" }, { id: "3", name: "Tricep Dips" }, { id: "4", name: "Skull Crushers" }, { id: "5", name: "Close-Grip Bench Press" }, { id: "6", name: "Dumbbell Kickback" }, { id: "7", name: "EZ-Bar Skull Crusher" }, { id: "8", name: "Machine Tricep Press" }] }
    ]
  },
  dayii: {
    title: "Chest Dominant - Lower Split",
    categories: [
      { key: "quads", label: "Quads", data: [{ id: "1", name: "Barbell Back Squat" }, { id: "2", name: "Barbell Front Squat" }, { id: "3", name: "Leg Press" }, { id: "4", name: "Smith Machine Squat" }, { id: "5", name: "Hack Squat" }, { id: "6", name: "V-Squat" }, { id: "7", name: "Leg Extension" }, { id: "8", name: "Pendulum Squat" }] },
      { key: "hamstrings", label: "Hamstrings", data: [{ id: "1", name: "Romanian Deadlift" }, { id: "2", name: "Conventional Deadlift" }, { id: "3", name: "Lying Leg Curl" }, { id: "4", name: "Seated Leg Curl" }, { id: "5", name: "Standing Leg Curl" }, { id: "6", name: "Nordic Curls" }, { id: "7", name: "Good Mornings" }, { id: "8", name: "Glute-Ham Raise" }] },
      { key: "glutes", label: "Glutes", data: [{ id: "1", name: "Barbell Hip Thrust" }, { id: "2", name: "Smith Machine Hip Thrust" }, { id: "3", name: "Bulgarian Split Squat" }, { id: "4", name: "Pendulum Squat" }, { id: "5", name: "Leg Press (Wide Stance)" }, { id: "6", name: "Machine Leg Press (Glute Focused)" }, { id: "7", name: "Cable Pull Through" }, { id: "8", name: "Dumbbell Step-Ups" }] },
      { key: "calves", label: "Calves", data: [{ id: "1", name: "Machine Calf Raise" }, { id: "2", name: "Seated Calf Raise" }, { id: "3", name: "Standing Calf Raise" }, { id: "4", name: "Leg Press Calf Raise" }, { id: "5", name: "Dumbbell Calf Raise" }, { id: "6", name: "Barbell Calf Raise" }, { id: "7", name: "Smith Machine Calf Raise" }, { id: "8", name: "Jump Rope" }] },
      { key: "core", label: "Core", data: [{ id: "1", name: "Ab Wheel Rollout" }, { id: "2", name: "Cable Crunch" }, { id: "3", name: "Machine Crunch" }, { id: "4", name: "Decline Sit-ups" }, { id: "5", name: "Hanging Leg Raise" }, { id: "6", name: "Rope Cable Crunch" }, { id: "7", name: "Machine Abs" }, { id: "8", name: "Plate Weighted Sit-up" }] },
      { key: "forearms", label: "Forearm", data: [{ id: "1", name: "Wrist Curl (Seated)" }, { id: "2", name: "Reverse Wrist Curl" }, { id: "3", name: "Hammer Curl" }, { id: "4", name: "Plate Pinch Hold" }, { id: "5", name: "Zottman Curl" }, { id: "6", name: "Farmer's Carry" }, { id: "7", name: "Reverse Curl" }, { id: "8", name: "Wrist Roller" }] }
    ]
  }
};

const CATEGORY_BACKGROUNDS = {
  upperback: "https://images.unsplash.com/photo-1603287634276-ae4efe00774a?q=80&w=600&auto=format&fit=crop",
  middleback: "https://images.unsplash.com/photo-1578762560072-061e4c0c443e?q=80&w=600&auto=format&fit=crop",
  midback: "https://images.unsplash.com/photo-1578762560072-061e4c0c443e?q=80&w=600&auto=format&fit=crop",
  midlowerback: "https://images.unsplash.com/photo-1578762560072-061e4c0c443e?q=80&w=600&auto=format&fit=crop",
  lowerback: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  biceplonghead: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  bicepslonghead: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  bicepsshorthead: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  forearm: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  forearms: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  quads: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=600&auto=format&fit=crop",
  upperchest: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
  midchest: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop"
};

const EXERCISE_ANIMATIONS = {
  "default": "https://fitnessprogrammer.com/wp-content/uploads/2021/05/Side-Plank-With-Dumbbell-Lateral-Raise.gif",
  "Barbell Back Squat": "https://fitnessprogrammer.com/wp-content/uploads/2021/02/Barbell-Back-Squat.gif",
  "Leg Press": "https://fitnessprogrammer.com/wp-content/uploads/2015/11/Leg-Press.gif",
  "Romanian Deadlift": "https://fitnessprogrammer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif",
  "Flat Barbell Bench Press": "https://fitnessprogrammer.com/wp-content/uploads/2021/01/Barbell-Bench-Press.gif"
};

export default function FitChoiceExercisePool() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ goal: "lean", framework: "chest dominant" });
  const [selectedDay, setSelectedDay] = useState(1);
  const [currentDayPool, setCurrentDayPool] = useState("dayi");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState(null);
  const [workoutProgress, setWorkoutProgress] = useState({}); 
  const [completedSets, setCompletedSets] = useState([]);
  const [restSeconds, setRestSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    async function fetchUserMetrics() {
      if (!user) { setLoading(false); return; }
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            goal: data.bodyGoal || "lean",
            framework: data.frameworkType || "chest dominant"
          });
        }
      } catch (err) {
        console.warn("Firestore profiles unavailable, running local state execution:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserMetrics();
  }, [user]);

  useEffect(() => {
    const cycleDay = ((selectedDay - 1) % 7) + 1; 
    const isArmSplit = profile.framework.toLowerCase() === "arm dominant";

    if (cycleDay === 3 || cycleDay === 6 || cycleDay === 7) {
      setCurrentDayPool("REST");
    } else if (cycleDay === 1 || cycleDay === 4) {
      setCurrentDayPool(isArmSplit ? "daya" : "dayi");
    } else if (cycleDay === 2 || cycleDay === 5) {
      setCurrentDayPool(isArmSplit ? "dayaa" : "dayii");
    }
  }, [selectedDay, profile]);

  useEffect(() => {
    let timerInterval = null;
    if (timerActive && restSeconds > 0) {
      timerInterval = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (restSeconds === 0) {
      setTimerActive(false);
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [timerActive, restSeconds]);

  const activePoolData = MASTER_POOL[currentDayPool];

  const getVolumeTargets = () => {
    const goalStr = profile.goal.toLowerCase();
    if (goalStr === "lean") return { sets: 3, reps: 12 };
    if (goalStr === "heavy") return { sets: 4, reps: 6 };
    return { sets: 3, reps: 10 };
  };

  const volumeMetrics = getVolumeTargets();

  const triggerExerciseSession = (exerciseName, categoryKey) => {
    setActiveExercise(exerciseName);
    setActiveCategoryKey(categoryKey);
    const trackingKey = `${currentDayPool}_${categoryKey}_${exerciseName}`;
    const historicalSets = workoutProgress[trackingKey];
    
    if (historicalSets) {
      setCompletedSets(historicalSets);
    } else {
      setCompletedSets(new Array(volumeMetrics.sets).fill(false));
    }
    setRestSeconds(0);
    setTimerActive(false);
  };

  const checkOffWorkoutSet = (index) => {
    const updatedSets = [...completedSets];
    updatedSets[index] = !updatedSets[index];
    setCompletedSets(updatedSets);

    const trackingKey = `${currentDayPool}_${activeCategoryKey}_${activeExercise}`;
    const newProgress = { ...workoutProgress, [trackingKey]: updatedSets };
    setWorkoutProgress(newProgress);

    if (user) {
      setDoc(doc(db, "users", user.uid, "progress", "workout_history"), newProgress, { merge: true })
        .catch(e => console.log("Progress cache delayed save: ", e));
    }

    if (updatedSets[index]) {
      setRestSeconds(45);
      setTimerActive(true);
    }
  };

  const getCategoryCompletionStats = (category) => {
    let totalSetsExpected = category.data.length * volumeMetrics.sets;
    let completedSetsCount = 0;

    category.data.forEach((ex) => {
      const trackingKey = `${currentDayPool}_${category.key}_${ex.name}`;
      const setsData = workoutProgress[trackingKey];
      if (setsData) {
        completedSetsCount += setsData.filter(Boolean).length;
      }
    });

    const percentage = totalSetsExpected > 0 ? Math.round((completedSetsCount / totalSetsExpected) * 100) : 0;
    return { percentage, done: completedSetsCount, total: totalSetsExpected };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const weekdays = ["S", "M", "T", "W", "Th", "F", "S"];

  return (
    <View style={styles.container}>
      {/* APP TOP NAVIGATION HEADER */}
      <View style={styles.header}>
        <Text style={styles.subHeader}>← Workout framework</Text>
        <Text style={styles.mainTitle}>Workout frequency per week</Text>
        <Text style={styles.frequencyDropdown}>5 Days per week  ∨</Text>
      </View>

      <View style={styles.weekdayRowContainer}>
        {weekdays.map((day, idx) => {
          const isSelectedDay = ((selectedDay - 1) % 7) === idx;
          return (
            <Pressable
              key={idx}
              onPress={() => {
                setSelectedDay(idx + 1); 
                setExpandedCategory(null);
              }}
              style={[styles.weekdayCircle, isSelectedDay && styles.weekdayCircleActive]}
            >
              <Text style={[styles.weekdayText, isSelectedDay && styles.weekdayTextActive]}>{day}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.workoutContainer} showsVerticalScrollIndicator={false}>
        {currentDayPool === "REST" ? (
          <View style={styles.restDayContainer}>
            <Text style={styles.restText}>🧘‍♂️ Scheduled Rest & Recovery Day</Text>
            <Text style={styles.restSubtext}>Lean targets rely heavily on programmatic muscular tissue remodeling windows.</Text>
          </View>
        ) : (
          activePoolData?.categories.map((category, index) => {
            const isExpanded = expandedCategory === category.key;
            const stats = getCategoryCompletionStats(category);
            const cleanKey = category.label.replace(/\s+/g, "").toLowerCase();
            const bgUri = CATEGORY_BACKGROUNDS[cleanKey] || CATEGORY_BACKGROUNDS.upperchest;

            return (
              <View key={category.key} style={styles.cardWrapper}>
                {index < activePoolData.categories.length - 1 && <View style={styles.timelineVerticalLine} />}

                <Pressable
                  onPress={() => setExpandedCategory(isExpanded ? null : category.key)}
                  style={styles.cardTouchTarget}
                >
                  <ImageBackground source={{ uri: bgUri }} style={styles.imageBackground} imageStyle={{ borderRadius: 24 }}>
                    <View style={styles.darkOverlay} />
                    
                    <View style={styles.cardHeaderContainer}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardCategoryTitle}>{category.label}</Text>
                        
                        <View style={styles.progressTrackBackground}>
                          <View style={[styles.progressFillActive, { width: `${stats.percentage}%` }]} />
                        </View>
                        <Text style={styles.progressPercentageLabel}>
                          {stats.percentage}% Completed ({stats.percentage === 100 ? "Done" : "Last stopped here"})
                        </Text>
                      </View>
                      
                      <Text style={styles.caretArrowText}>{isExpanded ? "▲" : "▼"}</Text>
                    </View>
                  </ImageBackground>
                </Pressable>

                {isExpanded && (
                  <View style={styles.dropdownOptionsContainer}>
                    {category.data.map((exercise) => {
                      const trackingKey = `${currentDayPool}_${category.key}_${exercise.name}`;
                      const exerciseSets = workoutProgress[trackingKey] || [];
                      const setsFinished = exerciseSets.filter(Boolean).length;
                      const isCompleted = setsFinished === volumeMetrics.sets;

                      return (
                        <View key={exercise.id} style={[styles.exerciseListItemBlock, isCompleted && styles.exerciseListItemCompleted]}>
                          <View style={{ flex: 1, paddingRight: 12 }}>
                            <Text style={styles.exerciseNameText}>{exercise.name}</Text>
                            <Text style={styles.exerciseMetaDetail}>
                              Target volume: {volumeMetrics.sets} Sets × {volumeMetrics.reps} Reps ({setsFinished}/{volumeMetrics.sets} done)
                            </Text>
                          </View>

                          <Pressable
                            style={[styles.startWorkoutButton, isCompleted && styles.startWorkoutButtonFinished]}
                            onPress={() => triggerExerciseSession(exercise.name, category.key)}
                          >
                            <Text style={styles.startWorkoutButtonText}>
                              {setsFinished > 0 ? (isCompleted ? "Review" : "Resume") : "Start"}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={activeExercise !== null} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitleText}>{activeExercise}</Text>
              <Text style={styles.modalGoalSubtext}>Goal Target: {profile.goal.toUpperCase()} Training Module</Text>
            </View>
            <Pressable style={styles.closeModalButton} onPress={() => setActiveExercise(null)}>
              <Text style={styles.closeModalButtonText}>✕ Save & Exit</Text>
            </Pressable>
          </View>

          <View style={styles.animationShowcaseContainer}>
            <Image
              source={{ uri: EXERCISE_ANIMATIONS[activeExercise] || EXERCISE_ANIMATIONS.default }}
              style={styles.animatedGifAsset}
              resizeMode="contain"
            />
          </View>

          <View style={styles.timerDisplayContainer}>
            {restSeconds > 0 ? (
              <View style={styles.timerBadgeActive}>
                <Text style={styles.timerCountdownDigits}>REST COUNTDOWN: {restSeconds}s</Text>
              </View>
            ) : (
              <Text style={styles.timerStatusPlaceholderText}>Complete your set and check it off below</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Set Performance Matrix ({volumeMetrics.reps} Reps/Set)</Text>
          <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingHorizontal: 24 }}>
            {completedSets.map((isDone, index) => (
              <Pressable
                key={index}
                onPress={() => checkOffWorkoutSet(index)}
                style={[styles.setRowBlock, isDone && styles.setRowBlockDone]}
              >
                <Text style={[styles.setRowLabel, isDone && styles.setRowLabelDone]}>SET NUM {index + 1}</Text>
                <View style={[styles.setCheckboxCircle, isDone && styles.setCheckboxCircleActive]}>
                  {isDone && <Text style={styles.checkIconText}>✓</Text>}
                </View>
              </Pressable>
            ))}
          </ScrollView>

        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#13111C",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#13111C",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 24,
    marginTop: 55,
    marginBottom: 10,
  },
  subHeader: {
    color: "#7E7A93",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  frequencyDropdown: {
    color: "#7E7A93",
    fontSize: 13,
    marginTop: 4,
  },
  weekdayRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginVertical: 14,
  },
  weekdayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1E1C2B",
    justifyContent: "center",
    alignItems: "center",
  },
  weekdayCircleActive: {
    backgroundColor: "#F97316",
  },
  weekdayText: {
    color: "#7E7A93",
    fontSize: 14,
    fontWeight: "600",
  },
  weekdayTextActive: {
    color: "#FFFFFF",
  },
  workoutContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 60,
  },
  cardWrapper: {
    position: "relative",
    marginBottom: 18,
    alignItems: "center",
    width: "100%",
  },
  timelineVerticalLine: {
    position: "absolute",
    width: 2,
    backgroundColor: "#2D293E",
    top: 110,
    bottom: -30,
    zIndex: -1,
  },
  cardTouchTarget: {
    width: "100%",
    height: 120,
    borderRadius: 24,
    overflow: "hidden",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(19, 17, 28, 0.74)",
  },
  cardHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cardCategoryTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
  },
  progressTrackBackground: {
    width: "80%",
    height: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFillActive: {
    height: "100%",
    backgroundColor: "#F97316",
    borderRadius: 3,
  },
  progressPercentageLabel: {
    color: "#A29EB3",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  caretArrowText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  dropdownOptionsContainer: {
    width: "94%",
    backgroundColor: "#1E1C2B",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 14,
    marginTop: -10,
    zIndex: -2,
    borderWidth: 1,
    borderColor: "#2D293E",
    gap: 8,
  },
  exerciseListItemBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#13111C",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#252233",
  },
  exerciseListItemCompleted: {
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  exerciseNameText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  exerciseMetaDetail: {
    color: "#7E7A93",
    fontSize: 11,
    marginTop: 2,
  },
  startWorkoutButton: {
    backgroundColor: "#F97316",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  startWorkoutButtonFinished: {
    backgroundColor: "#2D293E",
  },
  startWorkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  restDayContainer: {
    padding: 40,
    alignItems: "center",
  },
  restText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  restSubtext: {
    color: "#7E7A93",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#13111C",
    alignItems: "center",
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 50,
    marginBottom: 15,
  },
  modalTitleText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalGoalSubtext: {
    color: "#7E7A93",
    fontSize: 12,
    marginTop: 2,
  },
  closeModalButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#1E1C2B",
  },
  closeModalButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  animationShowcaseContainer: {
    width: width - 48,
    height: 210,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  animatedGifAsset: {
    width: "100%",
    height: "100%",
  },
  timerDisplayContainer: {
    marginVertical: 12,
    height: 45,
    justifyContent: "center",
  },
  timerBadgeActive: {
    backgroundColor: "#EA580C",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  timerCountdownDigits: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  timerStatusPlaceholderText: {
    color: "#7E7A93",
    fontSize: 13,
    fontStyle: "italic",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginLeft: 24,
    marginBottom: 10,
  },
  setRowBlock: {
    width: "100%",
    backgroundColor: "#1E1C2B",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2D293E",
  },
  setRowBlockDone: {
    borderColor: "#F97316",
    backgroundColor: "rgba(249, 115, 22, 0.03)",
  },
  setRowLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  setRowLabelDone: {
    color: "#F97316",
  },
  setCheckboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4E4966",
    justifyContent: "center",
    alignItems: "center",
  },
  setCheckboxCircleActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  checkIconText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
});