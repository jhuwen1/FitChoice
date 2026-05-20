import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";

const { width } = Dimensions.get("window");

// ALL 4 ORIGINAL EXERCISE ARRAYS MAINTAINED FOR AUTO-SELECTION LOGIC
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

// Fallback images matching the text banners in your mockups
const CATEGORY_BACKGROUNDS = {
  upperback: "https://images.unsplash.com/photo-1603287634276-ae4efe00774a?q=80&w=600&auto=format&fit=crop",
  middleback: "https://images.unsplash.com/photo-1578762560072-061e4c0c443e?q=80&w=600&auto=format&fit=crop",
  lowerback: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
  bicep: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  biceps: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  bicepslonghead: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  bicepsshorthead: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  forearm: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  forearms: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  quads: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=600&auto=format&fit=crop",
  chest: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
  sternalhead: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
  clavicularhead: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
  clavicular: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop"
};

export default function ExercisePool() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ goal: "lean", framework: "arm dominant" });
  const [selectedDay, setSelectedDay] = useState(1); // 1 to 30 Days
  const [currentDayPool, setCurrentDayPool] = useState("daya");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [customSelections, setCustomSelections] = useState({});

  // Fetch target parameters directly from setup profile
  useEffect(() => {
    async function loadUserProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            goal: data.bodyGoal || "lean", 
            framework: data.frameworkType || "arm dominant",
          });
        }
      } catch (err) {
        console.error("Error matching profile metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserProfile();
  }, [user]);

  // Determine standard schedule routing dynamically over a 5-day active cycle week
  useEffect(() => {
    const cycleDay = ((selectedDay - 1) % 7) + 1; // Converts 1-30 scale to a clean Mon-Sun block
    const isArmType = profile.framework.toLowerCase() === "arm dominant";

    if (cycleDay === 3 || cycleDay === 6 || cycleDay === 7) {
      setCurrentDayPool("REST");
    } else if (cycleDay === 1 || cycleDay === 4) {
      setCurrentDayPool(isArmType ? "daya" : "dayi");
    } else if (cycleDay === 2 || cycleDay === 5) {
      setCurrentDayPool(isArmType ? "dayaa" : "dayii");
    }
  }, [selectedDay, profile]);

  // Dynamic Volume Calculation Engine (Based directly on Setup Selection & Week progression)
  const getProgressiveTargets = () => {
    const week = Math.ceil(selectedDay / 7);
    const goalStr = profile.goal.toLowerCase();

    if (goalStr === "lean") {
      // Lean: Higher endurance metrics
      return { sets: 3 + Math.floor(week / 4), reps: 12 + (week - 1), label: "Endurance & Lean Volume" };
    } else if (goalStr === "heavy") {
      // Heavy/Strength: High mechanical resistance load profiles
      return { sets: 4, reps: 6 - Math.floor(week / 3), label: "Power & Heavy Load" };
    } else {
      // Athletic: Clean steady hypertrophy progression scales
      return { sets: 3 + Math.floor(week / 3), reps: 10, label: "Athletic Conditioning" };
    }
  };

  const volumeMetrics = getProgressiveTargets();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const activePoolData = MASTER_POOL[currentDayPool];

  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.subHeader}>Workout framework</Text>
        <Text style={styles.mainTitle}>Workout frequency per week</Text>
        <Text style={styles.frequencyDropdown}>5 Days per week  ∨</Text>
      </View>

      {/* 1-MONTH PROGRESSIVE SCROLLABLE HORIZONTAL CALENDAR */}
      <View style={styles.calendarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
          {Array.from({ length: 30 }).map((_, index) => {
            const dayNum = index + 1;
            const isSelected = dayNum === selectedDay;
            const isRest = (dayNum % 7 === 3) || (dayNum % 7 === 6) || (dayNum % 7 === 0);

            return (
              <Pressable
                key={dayNum}
                onPress={() => {
                  setSelectedDay(dayNum);
                  setExpandedCategory(null);
                }}
                style={[
                  styles.calendarDayChip,
                  isSelected && styles.activeDayChip,
                  isRest && !isSelected && styles.restDayChip
                ]}
              >
                <Text style={[styles.dayChipNumber, isSelected && styles.activeDayChipText]}>
                  {dayNum}
                </Text>
                <Text style={[styles.dayChipLabel, isSelected && styles.activeDayChipSubtext]}>
                  {isRest ? "Rest" : "Train"}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* TRACK PROFILE TARGET STATS BAR */}
      <View style={styles.metaBadgeBar}>
        <Text style={styles.metaBadgeText}>
          Goal: <Text style={{ color: "#f97316", fontWeight: "bold" }}>{profile.goal.toUpperCase()}</Text> | {volumeMetrics.label}
        </Text>
      </View>

      {/* DETAILED EXERCISE LIST INTERACTIVE LAYOUT */}
      <ScrollView contentContainerStyle={styles.workoutContainer} showsVerticalScrollIndicator={false}>
        {currentDayPool === "REST" ? (
          <View style={styles.restDayContainer}>
            <Text style={styles.restText}>🧘‍♂️ Scheduled Rest & Recovery Day</Text>
            <Text style={styles.restSubtext}>Muscles grow during recovery periods. Stay hydrated and track your nutrition goals!</Text>
          </View>
        ) : (
          activePoolData?.categories.map((category, index) => {
            const isExpanded = expandedCategory === category.key;
            const currentSelection = customSelections[category.key] || category.data[0].name;
            
            // Clean sanitize lookup keys for custom images mapping
            const cleanKey = category.label.replace(/\s+/g, "").toLowerCase();
            const bgUri = CATEGORY_BACKGROUNDS[cleanKey] || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop";

            return (
              <View key={category.key} style={styles.cardWrapper}>
                {/* Visual Connector Timeline Line down the middle */}
                {index < activePoolData.categories.length - 1 && <View style={styles.timelineVerticalLine} />}

                <Pressable
                  onPress={() => setExpandedCategory(isExpanded ? null : category.key)}
                  style={styles.cardTouchTarget}
                >
                  <ImageBackground source={{ uri: bgUri }} style={styles.imageBackground} imageStyle={{ borderRadius: 24 }}>
                    <View style={styles.darkOverlay} />
                    
                    <View style={styles.cardHeaderContainer}>
                      <View>
                        <Text style={styles.cardCategoryTitle}>{category.label}</Text>
                        <Text style={styles.cardSelectedExerciseText}>{currentSelection}</Text>
                        <Text style={styles.volumeTargetText}>
                          {volumeMetrics.sets} Sets × {volumeMetrics.reps} Reps
                        </Text>
                      </View>
                      <Text style={styles.caretArrowText}>{isExpanded ? "▲" : "▼"}</Text>
                    </View>
                  </ImageBackground>
                </Pressable>

                {/* Sub-dropdown selection matrix matching mockup */}
                {isExpanded && (
                  <View style={styles.dropdownOptionsContainer}>
                    {category.data.map((exercise) => {
                      const isItemChosen = currentSelection === exercise.name;
                      return (
                        <Pressable
                          key={exercise.id}
                          onPress={() => {
                            setCustomSelections(prev => ({ ...prev, [category.key]: exercise.name }));
                            setExpandedCategory(null);
                          }}
                          style={[styles.exerciseOptionItem, isItemChosen && styles.exerciseOptionActive]}
                        >
                          <Text style={[styles.exerciseOptionItemText, isItemChosen && styles.exerciseOptionActiveText]}>
                            {exercise.name}
                          </Text>
                          {isItemChosen && <Text style={styles.checkIndicator}>✓</Text>}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#13111C", // Unified matching deep premium tint
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#13111C",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 24,
    marginTop: 60,
    marginBottom: 15,
  },
  subHeader: {
    color: "#7E7A93",
    fontSize: 14,
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
    fontSize: 14,
    marginTop: 6,
  },
  calendarWrapper: {
    marginVertical: 10,
    paddingLeft: 20,
  },
  calendarScroll: {
    paddingRight: 40,
    gap: 12,
  },
  calendarDayChip: {
    width: 55,
    height: 65,
    backgroundColor: "#1E1C2B",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D293E",
  },
  activeDayChip: {
    backgroundColor: "#f97316",
    borderColor: "#f97316",
  },
  restDayChip: {
    backgroundColor: "#161520",
    opacity: 0.6,
  },
  dayChipNumber: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dayChipLabel: {
    color: "#7E7A93",
    fontSize: 10,
    marginTop: 2,
  },
  activeDayChipText: {
    color: "#FFFFFF",
  },
  activeDayChipSubtext: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  metaBadgeBar: {
    backgroundColor: "#1E1C2B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  metaBadgeText: {
    color: "#A29EB3",
    fontSize: 13,
  },
  workoutContainer: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 50,
  },
  cardWrapper: {
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
  },
  timelineVerticalLine: {
    position: "absolute",
    width: 2,
    backgroundColor: "#2D293E",
    top: 100,
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
    backgroundColor: "rgba(19, 17, 28, 0.75)",
  },
  cardHeaderContainer: {
    flexDirection: "row",
    justifyContent: "between",
    alignItems: "center",
    paddingHorizontal: 24,
    width: "100%",
  },
  cardCategoryTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  cardSelectedExerciseText: {
    color: "#F97316",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  volumeTargetText: {
    color: "#A29EB3",
    fontSize: 11,
    marginTop: 4,
  },
  caretArrowText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    position: 'absolute',
    right: 24
  },
  dropdownOptionsContainer: {
    width: "95%",
    backgroundColor: "#1E1C2B",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 10,
    marginTop: -10,
    zIndex: -2,
    borderWidth: 1,
    borderColor: "#2D293E",
  },
  exerciseOptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  exerciseOptionActive: {
    backgroundColor: "rgba(249, 115, 22, 0.1)",
  },
  exerciseOptionItemText: {
    color: "#A29EB3",
    fontSize: 13,
  },
  exerciseOptionActiveText: {
    color: "#F97316",
    fontWeight: "600",
  },
  checkIndicator: {
    color: "#F97316",
    fontWeight: "bold",
  },
  restDayContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  restText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  restSubtext: {
    color: "#7E7A93",
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
});