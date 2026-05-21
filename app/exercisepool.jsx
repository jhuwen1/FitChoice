import { useRouter } from "expo-router";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
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

const WEEKLY_ROUTINE = {
  1: {
    type: "TRAIN",
    categories: [
      {
        key: "chest_day",
        label: "Chest Dominant Split",
        bgKey: "chest",
        goals: {
          lean: [
            { id: "ch_l1", name: "Low-to-High Cable Fly" },
            { id: "ch_l2", name: "Pec Deck Fly" },
            { id: "ch_l3", name: "Flat Dumbbell Press (High Rep)" },
            { id: "ch_l4", name: "Push-Ups to Failure" }
          ],
          heavy: [
            { id: "ch_h1", name: "Flat Barbell Bench Press" },
            { id: "ch_h2", name: "Incline Barbell Press" },
            { id: "ch_h3", name: "Heavy Flat Dumbbell Press" },
            { id: "ch_h4", name: "Weighted Chest Dips" }
          ],
          athletic: [
            { id: "ch_a1", name: "30° Incline Dumbbell Press" },
            { id: "ch_a2", name: "Flat Barbell Bench Press" },
            { id: "ch_a3", name: "Landmine Chest Press" },
            { id: "ch_a4", name: "Medicine Ball Chest Pass" }
          ]
        }
      }
    ]
  },
  2: {
    type: "TRAIN",
    categories: [
      {
        key: "back_day",
        label: "Back & Pull Split",
        bgKey: "midback",
        goals: {
          lean: [
            { id: "bk_l1", name: "Wide-Grip Lat Pulldown" },
            { id: "bk_l2", name: "Seated Cable Row" },
            { id: "bk_l3", name: "Straight-Arm Cable Pull-Down" },
            { id: "bk_l4", name: "Hyperextensions" }
          ],
          heavy: [
            { id: "bk_h1", name: "Barbell Bent-Over Row" },
            { id: "bk_h2", name: "Conventional Deadlift" },
            { id: "bk_h3", name: "Heavy T-Bar Row" },
            { id: "bk_h4", name: "Weighted Pull-Ups" }
          ],
          athletic: [
            { id: "bk_a1", name: "Wide-Grip Pull-Ups" },
            { id: "bk_a2", name: "Single-Arm Dumbbell Row" },
            { id: "bk_a3", name: "Chest-Supported Row" },
            { id: "bk_a4", name: "Inverted Bodyweight Rows" }
          ]
        }
      }
    ]
  },
  3: {
    type: "CARDIO",
    label: "Active Recovery & Cardio",
    bgKey: "forearms",
    goals: {
      lean: { targetSteps: 10000, durationMinutes: 45, dynamicLabel: "Fat Oxidation Walk", advice: "Keep a steady, conversational pace to maximize optimal fat loss." },
      heavy: { targetSteps: 5000, durationMinutes: 20, dynamicLabel: "Joint Mobilization Recovery", advice: "Focus on systemic flushing and stretching worn out lifting tissue." },
      athletic: { targetSteps: 8000, durationMinutes: 30, dynamicLabel: "Agility/Steady Cardio Mix", advice: "Incorporate light fast lateral footwork sets between walking spurts." }
    }
  },
  4: {
    type: "TRAIN",
    categories: [
      {
        key: "legs_day",
        label: "Lower Body Legs Focus",
        bgKey: "quads",
        goals: {
          lean: [
            { id: "lg_l1", name: "Leg Press (High Volume)" },
            { id: "lg_l2", name: "Goblet Squats" },
            { id: "lg_l3", name: "Lying Leg Curl" },
            { id: "lg_l4", name: "Seated Calf Raise" }
          ],
          heavy: [
            { id: "lg_h1", name: "Barbell Back Squat" },
            { id: "lg_h2", name: "Romanian Deadlift" },
            { id: "lg_h3", name: "Leg Press Compilation" },
            { id: "lg_h4", name: "Standing Calf Raise" }
          ],
          athletic: [
            { id: "lg_a1", name: "Bulgarian Split Squats" },
            { id: "lg_a2", name: "Barbell Front Squat" },
            { id: "lg_a3", name: "Kettlebell Swings" },
            { id: "lg_a4", name: "Box Jumps (Explosive)" }
          ]
        }
      }
    ]
  },
  5: {
    type: "TRAIN",
    categories: [
      {
        key: "arms_shoulders",
        label: "Arms & Shoulders Core",
        bgKey: "biceps",
        goals: {
          lean: [
            { id: "as_l1", name: "Dumbbell Lateral Raise" },
            { id: "as_l2", name: "Incline Dumbbell Curl" },
            { id: "as_l3", name: "Triceps Rope Pushdown" },
            { id: "as_l4", name: "Cable Face Pulls" }
          ],
          heavy: [
            { id: "as_h1", name: "Overhead Barbell Press" },
            { id: "as_h2", name: "Seated Dumbbell Shoulder Press" },
            { id: "as_h3", name: "Barbell Curl" },
            { id: "as_h4", name: "EZ-Bar Skull Crushers" }
          ],
          athletic: [
            { id: "as_a1", name: "Dumbbell Push Press" },
            { id: "as_a2", name: "Cable Lateral Raise" },
            { id: "as_a3", name: "Dumbbell Hammer Curl" },
            { id: "as_a4", name: "Close-Grip Bench Press" }
          ]
        }
      }
    ]
  },
  6: {
    type: "TRAIN",
    categories: 
      {
        key: "full_body_upper",
        label: "Whole Body - Chest & Back Engine",
        bgKey: "upperback",
        goals: {
          lean: [{ id: "fbu_l1", name: "Incline Dumbbell Fly" }, { id: "fbu_l2", name: "Lat Pulldown" }],
          heavy: [{ id: "fbu_h1", name: "Barbell Bench Press" }, { id: "fbu_h2", name: "Bent-Over Barbell Rows" }],
          athletic: [{ id: "fbu_a1", name: "Dumbbell Push Press" }, { id: "fbu_a2", name: "Pull-Ups" }]
        }
      },
      {
        key: "full_body_lower",
        label: "Whole Body - Legs Focus Split",
        bgKey: "quads",
        goals: {
          lean: [{ id: "fbl_l1", name: "Goblet Squats" }, { id: "fbl_l2", name: "Walking Lunges" }],
          heavy: [{ id: "fbl_h1", name: "Barbell Back Squats" }, { id: "fbl_h2", name: "Romanian Deadlifts" }],
          athletic: [{ id: "fbl_a1", name: "Box Jumps" }, { id: "fbl_a2", name: "Kettlebell Goblet Squats" }]
        }
      },
      {
        key: "full_body_core",
        label: "Whole Body - Shoulders & Core Stability",
        bgKey: "biceps",
        goals: {
          lean: [{ id: "fbc_l1", name: "Dumbbell Lateral Raises" }, { id: "fbc_l2", name: "Plank Hold" }],
          heavy: [{ id: "fbc_h1", name: "Seated Dumbbell Press" }, { id: "fbc_h2", name: "Hanging Leg Raises" }],
          athletic: [{ id: "fbc_a1", name: "Kettlebell Halos" }, { id: "fbc_a2", name: "Medicine Ball Slams" }]
        }
      }
    ]
  },
  7: {
    type: "CARDIO",
    label: "Active Recovery & Cardio",
    bgKey: "forearms",
    goals: {
      lean: { targetSteps: 10000, durationMinutes: 35, dynamicLabel: "Fat Burn Zone Step Routine", advice: "Sustained rhythmic walking to clear remaining system lactic acid pools." },
      heavy: { targetSteps: 4000, durationMinutes: 15, dynamicLabel: "Muscle Flush Soft Walk", advice: "Gentle low-impact mobilization to feed recovery nutrients across heavy structural splits." },
      athletic: { targetSteps: 6000, durationMinutes: 25, dynamicLabel: "Functional Aerobic Base Day", advice: "Steady work rate targeting oxygenating multi-joint mechanics cleanly." }
    }
  }
};

const CATEGORY_BACKGROUNDS = {
  upperback: "https://images.unsplash.com/photo-1603287634276-ae4efe00774a?q=80&w=600&auto=format&fit=crop",
  midback: "https://images.unsplash.com/photo-1578762560072-061e4c0c443e?q=80&w=600&auto=format&fit=crop",
  biceps: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  forearms: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  quads: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=600&auto=format&fit=crop",
  chest: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop"
};

const EXERCISE_ANIMATIONS = {
  "default": "https://fitnessprogrammer.com/wp-content/uploads/2021/05/Side-Plank-With-Dumbbell-Lateral-Raise.gif"
};

const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const startOfYear = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - startOfYear) / 86400000) + 1) / 7);
};

export default function FitChoiceExercisePool() {
  const { user } = useAuth();
  const router = useRouter(); 
  const countdownTimerRef = useRef(null);
  const playTimerRef = useRef(null);
  const restTimerRef = useRef(null);
  const realTimeStepTrackerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ goal: "athletic" });
  
  const currentRealWorldDayIndex = new Date().getDay();
  const fitChoiceToday = currentRealWorldDayIndex === 0 ? 7 : currentRealWorldDayIndex;
  
  const [selectedDay, setSelectedDay] = useState(fitChoiceToday); 
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [activeExercise, setActiveExercise] = useState(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState(null);
  const [workoutProgress, setWorkoutProgress] = useState({});
  const [completedSets, setCompletedSets] = useState([]);

  const [bigCountdown, setBigCountdown] = useState(null); 
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isPlayingMode, setIsPlayingMode] = useState(false); 
  const [secondsSpent, setSecondsSpent] = useState(0); 
  const [restRemainingSeconds, setRestRemainingSeconds] = useState(null);

  const [livePedometerSteps, setLivePedometerSteps] = useState(0);
  const [sharedQuestData, setSharedQuestData] = useState({ steps: 0, xp: 0 });

  const isTodaySelected = selectedDay === fitChoiceToday;
  const currentDayData = WEEKLY_ROUTINE[selectedDay];
  
  const userGoalKey = profile.goal === "heavy" || profile.goal === "lean" ? profile.goal : "athletic";

  const goalDisplayLabels = {
    lean: "Lean Body Goal",
    heavy: "Heavy Body Goal",
    athletic: "Athletic Body Goal"
  };

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid, "activity", "today"), (document) => {
      if (document.exists()) {
        const d = document.data();
        setSharedQuestData({ steps: d.steps || 0, xp: d.xp || 0 });
        if (currentDayData.type === "CARDIO") {
          setLivePedometerSteps(d.steps || 0);
        }
      }
    });
    return () => unsub();
  }, [user, selectedDay]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function initializeProgressData() {
      try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const userData = profileSnap.data();
          const rawGoalValue = userData.goal || userData.bodyGoal || "athletic";
          const savedGoal = rawGoalValue.trim().toLowerCase();
          
          setProfile({ goal: savedGoal });
        } else {
          setProfile({ goal: "athletic" });
        }

        const progressRef = doc(db, "users", user.uid, "progress", "workout_history");
        const progressSnap = await getDoc(progressRef);
        const currentWeekStr = `${new Date().getFullYear()}-W${getWeekNumber(new Date())}`;

        if (progressSnap.exists()) {
          const cloudData = progressSnap.data();
          
          if (cloudData.currentWeekMetadata !== currentWeekStr) {
            const backupRef = doc(db, "users", user.uid, "progress", `archive_${cloudData.currentWeekMetadata || "unknown"}`);
            await setDoc(backupRef, cloudData);
            
            const cleanReset = { currentWeekMetadata: currentWeekStr };
            await setDoc(progressRef, cleanReset);
            setWorkoutProgress(cleanReset);
          } else {
            setWorkoutProgress(cloudData);
          }
        } else {
          const freshData = { currentWeekMetadata: currentWeekStr };
          await setDoc(progressRef, freshData);
          setWorkoutProgress(freshData);
        }
      } catch (e) {
        console.warn("Baseline setup initialization warning:", e);
      } finally {
        setLoading(false);
      }
    }

    initializeProgressData();
  }, [user]);

  useEffect(() => {
    if (currentDayData.type === "CARDIO" && isTodaySelected && user) {
      realTimeStepTrackerRef.current = setInterval(async () => {
        setLivePedometerSteps((prev) => {
          const customDelta = Math.floor(Math.random() * 4) + 2;
          const nextSteps = prev + customDelta;
          
          const todayRef = doc(db, "users", user.uid, "activity", "today");
          setDoc(todayRef, { 
            steps: nextSteps,     nmbn
            xp: sharedQuestData.xp 
          }, { merge: true }).catch(err => console.log(err));
          
          return nextSteps;
        });
      }, 3000);
    } else {
      clearInterval(realTimeStepTrackerRef.current);
    }
    return () => clearInterval(realTimeStepTrackerRef.current);
  }, [selectedDay, isTodaySelected, user, sharedQuestData.xp]);

  const getVolumeTargets = () => {
    if (userGoalKey === "heavy") return { sets: 4, baseReps: 6, label: "Strength Progression", estSeconds: 30, minTimePerRep: 3 };
    if (userGoalKey === "athletic") return { sets: 3, baseReps: 8, label: "Explosive Pyramids", estSeconds: 35, minTimePerRep: 2 };
    return { sets: 3, baseReps: 12, label: "Endurance Volume Cascades", estSeconds: 45, minTimePerRep: 2 }; 
  };
  const volumeMetrics = getVolumeTargets();

  const getDynamicRepsForSet = (setIdx) => volumeMetrics.baseReps + (setIdx * 2);
  const requiredSafetySeconds = getDynamicRepsForSet(currentSetIndex) * volumeMetrics.minTimePerRep;
  const isCompletionGateUnlocked = secondsSpent >= requiredSafetySeconds;

  const calculateDayCompletionPercentage = () => {
    if (currentDayData.type === "CARDIO") {
      const activeGoal = currentDayData.goals?.[userGoalKey]?.targetSteps || 5000;
      return Math.min(Math.floor((livePedometerSteps / activeGoal) * 100), 100);
    }
    
    let totalExpectedSets = 0;
    let completedSetsCount = 0;
    
    currentDayData.categories.forEach((cat) => {
      const pool = cat.goals[userGoalKey] || [];
      pool.forEach((ex) => {
        totalExpectedSets += volumeMetrics.sets;
        const key = `day_${selectedDay}_${userGoalKey}_${cat.key}_${ex.name}`;
        const history = workoutProgress[key] || [];
        completedSetsCount += history.filter(Boolean).length;
      });
    });

    return totalExpectedSets === 0 ? 0 : Math.min(Math.floor((completedSetsCount / totalExpectedSets) * 100), 100);
  };

  const currentDayPercentage = calculateDayCompletionPercentage();

  const triggerNextSetSequenceOrClose = () => {
    if (currentSetIndex + 1 < volumeMetrics.sets) {
      setCurrentSetIndex((prev) => prev + 1);
      setIsPlayingMode(false);
      
      setRestRemainingSeconds(45);
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
      setActiveExercise(null);
      setIsPlayingMode(false);
    }
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

    const trackingKey = `day_${selectedDay}_${userGoalKey}_${categoryKey}_${exerciseName}`;
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
    if (!isCompletionGateUnlocked || !user) return; 

    clearInterval(playTimerRef.current);
    
    const updatedSets = [...completedSets];
    updatedSets[currentSetIndex] = true; 
    setCompletedSets(updatedSets);

    const trackingKey = `day_${selectedDay}_${userGoalKey}_${activeCategoryKey}_${activeExercise}`;
    const newProgress = { ...workoutProgress, [trackingKey]: updatedSets };
    setWorkoutProgress(newProgress);

    const progressRef = doc(db, "users", user.uid, "progress", "workout_history");
    await setDoc(progressRef, newProgress, { merge: true });

    const nextCalculatedXP = sharedQuestData.xp + 15;
    const todayRef = doc(db, "users", user.uid, "activity", "today");
    await setDoc(todayRef, { xp: nextCalculatedXP }, { merge: true });

    triggerNextSetSequenceOrClose();
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

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activeRestCardioData = currentDayData.goals ? currentDayData.goals[userGoalKey] : null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/dashboard")}>
          <Text style={styles.subHeader}>❮ FitChoice Framework</Text>
        </Pressable>
        <Text style={styles.mainTitle}>Workout frequency per week</Text>
        <Text style={styles.frequencyDropdown}>
          5 Days Active • <Text style={{ color: '#F97316' }}>{goalDisplayLabels[userGoalKey]?.toUpperCase()}</Text> ({volumeMetrics.label})
        </Text>
      </View>

      <View style={styles.weekdayRowContainer}>
        {weekdays.map((day, idx) => {
          const isSelected = (selectedDay - 1) === idx;
          const isRealDay = (fitChoiceToday - 1) === idx;
          return (
            <Pressable key={idx} onPress={() => setSelectedDay(idx + 1)} style={[styles.weekdayCircle, isSelected && styles.weekdayCircleActive, !isSelected && isRealDay && { borderColor: '#F97316', borderWidth: 1 }]}>
              <Text style={[styles.weekdayText, isSelected && styles.weekdayTextActive, !isSelected && isRealDay && { color: '#F97316' }]}>{day[0]}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.dayProgressWrapper}>
        <View style={styles.dayProgressHeaderRow}>
          <Text style={styles.dayProgressLabel}>Day Progress Metrics</Text>
          <Text style={styles.dayProgressValueText}>{currentDayPercentage}%</Text>
        </View>
        <View style={styles.dayProgressTrack}>
          <View style={[styles.dayProgressBarFill, { width: `${currentDayPercentage}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.workoutContainer} showsVerticalScrollIndicator={false}>
        {currentDayData.type === "TRAIN" ? (
          currentDayData.categories.map((category) => {
            const isExpanded = expandedCategory === category.key;
            const bgUri = CATEGORY_BACKGROUNDS[category.bgKey] || CATEGORY_BACKGROUNDS.upperback;
            const targetExercisesPool = category.goals[userGoalKey] || [];

            return (
              <View key={category.key} style={styles.cardWrapper}>
                <Pressable onPress={() => setExpandedCategory(isExpanded ? null : category.key)} style={styles.cardTouchTarget}>
                  <ImageBackground source={{ uri: bgUri }} style={styles.imageBackground} imageStyle={{ borderRadius: 24 }}>
                    <View style={styles.darkOverlay} />
                    <View style={styles.cardHeaderContainer}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.cardCategoryTitle} numberOfLines={1}>{category.label}</Text>
                        <Text style={styles.cardProgressSubtitle}>Escalating Intensity Pyramid</Text>
                      </View>
                      <Text style={styles.caretArrowText}>{isExpanded ? "▲" : "▼"}</Text>
                    </View>
                  </ImageBackground>
                </Pressable>

                {isExpanded && (
                  <View style={styles.dropdownOptionsContainer}>
                    {targetExercisesPool.map((exercise) => {
                      const trackingKey = `day_${selectedDay}_${userGoalKey}_${category.key}_${exercise.name}`;
                      const exerciseSets = workoutProgress[trackingKey] || [];
                      const setsFinished = exerciseSets.filter(Boolean).length;
                      const isCompleted = setsFinished === volumeMetrics.sets;

                      return (
                        <View key={exercise.id} style={styles.exerciseListItemBlock}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.exerciseNameText, !isTodaySelected && { color: '#4E4966' }]}>{exercise.name}</Text>
                            <Text style={styles.exerciseMetaDetail}>
                              {isTodaySelected 
                                ? `${volumeMetrics.sets} Sets Matrix • Reps (${setsFinished}/${volumeMetrics.sets})`
                                : "Locked — Accessible only on schedule day"}
                            </Text>
                          </View>
                          
                          <Pressable 
                            style={[
                              styles.playButtonCircle, 
                              isCompleted && { backgroundColor: '#2D293E' },
                              !isTodaySelected && { backgroundColor: '#1E1C2B', borderColor: '#252233', borderWidth: 1 }
                            ]} 
                            onPress={() => isTodaySelected && handlePlayWorkoutSession(exercise.name, category.key)}
                            disabled={!isTodaySelected}
                          >
                            <Text style={[styles.playButtonText, !isTodaySelected && { color: '#4E4966' }]}>
                              {isCompleted ? "✓" : isTodaySelected ? "▶" : "X"}
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
        ) : (
          /* ACTIVE CARDIO SPLIT INTERACTION PANEL */
          <View style={styles.restDayMainCardContainer}>
            <View style={styles.restDayDecoratedSphere}><Text style={{fontSize: 32}}>🍃</Text></View>
            <Text style={styles.restDayMainHeading}>{currentDayData.label}</Text>
            <Text style={styles.restDaySpecificSubLabel}>{activeRestCardioData?.dynamicLabel}</Text>
            
            <View style={styles.restDayDividerHorizontal} />
            
            <View style={styles.restDayMetricRowLayout}>
              <View style={styles.restDayMetricItemBlock}>
                <Text style={styles.restMetricValueText}>
                  {livePedometerSteps.toLocaleString()} / {activeRestCardioData?.targetSteps.toLocaleString()}
                </Text>
                <Text style={styles.restMetricLabelText}>
                  {isTodaySelected ? "Live Tracking Steps" : "Target Steps Setup"}
                </Text>
              </View>
              <View style={[styles.restDayMetricItemBlock, { borderLeftWidth: 1, borderColor: '#252233' }]}>
                <Text style={styles.restMetricValueText}>{activeRestCardioData?.durationMinutes}m</Text>
                <Text style={styles.restMetricLabelText}>Session Window</Text>
              </View>
            </View>

            {isTodaySelected && (
              <View style={styles.liveIndicatorPill}>
                <View style={styles.greenPulseDot} />
                <Text style={styles.liveIndicatorText}>Pedometer active on hardware layout</Text>
              </View>
            )}

            <View style={styles.restAdviceCardHolder}>
              <Text style={styles.restAdviceTitle}>Training Tips:</Text>
              <Text style={styles.restAdviceParagraphText}>{activeRestCardioData?.advice}</Text>
            </View>
          </View>
        )}
      </ScrollView>

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
            <View style={[styles.countdownGlassCircle, { borderColor: '#10B981', shadowColor: '#10B981' }]}>
              <Text style={[styles.countdownGiantDigit, { color: '#10B981' }]}>{restRemainingSeconds}s</Text>
              <Text style={styles.countdownSubtextTitle}>CATCH YOUR BREATH</Text>
            </View>
            <Pressable style={styles.skipRestPillButton} onPress={skipRestPeriodImmediately}>
              <Text style={styles.skipRestText}>Skip Rest Period ⏩</Text>
            </Pressable>
          </View>
        </Modal>
      )}

      <Modal visible={isPlayingMode} animationType="slide" transparent={false}>
        <View style={styles.playerWrapperContainer}>
          <View style={styles.playerTopHeaderRow}>
            <Pressable style={styles.quitSessionCornerButton} onPress={forceQuitActiveSession}>
              <Text style={styles.quitText}>✕ Close</Text>
            </Pressable>
            <View style={styles.setTagBadgePill}>
              <Text style={styles.setTagTextContent}>SET {currentSetIndex + 1} OF {volumeMetrics.sets}</Text>
            </View>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.exerciseIdentityTitleSection}>
            <Text style={styles.activeExerciseTitleHeading}>{activeExercise}</Text>
            <Text style={styles.subtextRepetitionVolumeGoal}>
              Target: <Text style={{ color: '#F97316', fontWeight: 'bold' }}>{getDynamicRepsForSet(currentSetIndex)} Reps</Text>
            </Text>
          </View>

          <View style={styles.timerControlCenterDashboard}>
            <Text style={styles.timerClockCountDigits}>{secondsSpent}s</Text>
            <Text style={styles.timerPaceBenchmarkSubLabel}>Minimum movement processing window: {requiredSafetySeconds}s</Text>
            <Text style={[styles.paceWarningIndicatorText, !isCompletionGateUnlocked && { color: '#EF4444' }]}>
              {isCompletionGateUnlocked ? "Safe Execution Gate Complete — Unlocked" : `Complete movement path execution (${requiredSafetySeconds - secondsSpent}s left)`}
            </Text>
          </View>

          <View style={styles.centerStageGraphicsFrameContainer}>
            <View style={styles.embeddedAnimationCardHolderCanvas}>
              <Image source={{ uri: EXERCISE_ANIMATIONS[activeExercise] || EXERCISE_ANIMATIONS.default }} style={styles.gameplayVisualAssetGifImage} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.footerActionDashboardZone}>
            <Pressable style={[styles.giantSuccessVerificationButton, !isCompletionGateUnlocked && { backgroundColor: '#252233', opacity: 0.6 }]} onPress={finishActiveSetExecution} disabled={!isCompletionGateUnlocked}>
              <Text style={styles.successActionBtnContentText}>
                {isCompletionGateUnlocked ? `✓ FINISHED SET 0${currentSetIndex + 1} (+15 XP)` : "PERFORM REPS TO UNLOCK"}
              </Text>
            </Pressable>
          </View>
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
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  frequencyDropdown: {
    color: "#7E7A93",
    fontSize: 13,
    marginTop: 5,
    fontWeight: "600",
  },
  weekdayRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 10,
  },
  weekdayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    fontWeight: "bold",
  },
  weekdayTextActive: {
    color: "#FFFFFF",
  },
  dayProgressWrapper: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  dayProgressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  dayProgressLabel: {
    color: "#7E7A93",
    fontSize: 12,
    fontWeight: "600",
  },
  dayProgressValueText: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "bold",
  },
  dayProgressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "#1E1C2B",
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#252233",
  },
  dayProgressBarFill: {
    height: "100%",
    backgroundColor: "#F97316",
    borderRadius: 3,
  },
  workoutContainer: {
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 14,
    width: "100%",
  },
  cardTouchTarget: {
    width: "100%",
    height: 110,
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
    backgroundColor: "rgba(19, 17, 28, 0.72)",
  },
  cardHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cardCategoryTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardProgressSubtitle: {
    color: "#7E7A93",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  caretArrowText: {
    color: "#7E7A93",
    fontSize: 14,
    fontWeight: "bold",
  },
  dropdownOptionsContainer: {
    width: "100%",
    backgroundColor: "#1E1C2B",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 10,
    marginTop: -15,
    paddingTop: 25,
    zIndex: -1,
    borderWidth: 1,
    borderColor: "#252233",
    gap: 6,
  },
  exerciseListItemBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#13111C",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#252233",
  },
  exerciseNameText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseMetaDetail: {
    color: "#7E7A93",
    fontSize: 11,
    marginTop: 2,
  },
  playButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 1,
  },
  restDayMainCardContainer: {
    backgroundColor: "#1E1C2B",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#252233",
    marginTop: 10,
  },
  restDayDecoratedSphere: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#13111C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#252233",
  },
  restDayMainHeading: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  restDaySpecificSubLabel: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  restDayDividerHorizontal: {
    width: "100%",
    height: 1,
    backgroundColor: "#252233",
    marginVertical: 20,
  },
  restDayMetricRowLayout: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  restDayMetricItemBlock: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  restMetricValueText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  restMetricLabelText: {
    color: "#7E7A93",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  restAdviceCardHolder: {
    backgroundColor: "#13111C",
    padding: 16,
    borderRadius: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#252233",
    marginTop: 15,
  },
  restAdviceTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  restAdviceParagraphText: {
    color: "#7E7A93",
    fontSize: 12,
    lineHeight: 17,
  },
  liveIndicatorPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    marginBottom: 5,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  liveIndicatorText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "bold",
  },
  fullscreenCountdownContainer: {
    flex: 1,
    backgroundColor: "rgba(19, 17, 28, 0.96)",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownGlassCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(30, 28, 43, 0.6)",
    borderWidth: 2,
    borderColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownGiantDigit: {
    color: "#F97316",
    fontSize: 90,
    fontWeight: "900",
  },
  countdownSubtextTitle: {
    color: "#7E7A93",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 2,
    marginTop: 4,
  },
  skipRestPillButton: {
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: "#1E1C2B",
    borderWidth: 1,
    borderColor: "#252233",
  },
  skipRestText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  playerWrapperContainer: {
    flex: 1,
    backgroundColor: "#13111C",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 25,
  },
  playerTopHeaderRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 30,
  },
  quitSessionCornerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#1E1C2B",
    borderWidth: 1,
    borderColor: "#252233",
  },
  quitText: {
    color: "#A29EB3",
    fontSize: 13,
    fontWeight: "600",
  },
  setTagBadgePill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.25)",
  },
  setTagTextContent: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "bold",
  },
  exerciseIdentityTitleSection: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 15,
  },
  activeExerciseTitleHeading: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtextRepetitionVolumeGoal: {
    color: "#7E7A93",
    fontSize: 13,
    marginTop: 4,
  },
  timerControlCenterDashboard: {
    width: width - 48,
    backgroundColor: "#1E1C2B",
    borderRadius: 24,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#252233",
  },
  timerClockCountDigits: {
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "bold",
  },
  timerPaceBenchmarkSubLabel: {
    color: "#7E7A93",
    fontSize: 12,
    marginTop: 2,
  },
  paceWarningIndicatorText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 8,
  },
  centerStageGraphicsFrameContainer: {
    width: width - 48,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  embeddedAnimationCardHolderCanvas: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    overflow: "hidden",
  },
  gameplayVisualAssetGifImage: {
    width: "100%",
    height: "100%",
  },
  footerActionDashboardZone: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 15,
  },
  giantSuccessVerificationButton: {
    width: "100%",
    height: 60,
    backgroundColor: "#F97316",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  successActionBtnContentText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});