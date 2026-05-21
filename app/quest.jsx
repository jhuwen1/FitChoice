import { useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const useQuestTimer = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(24, 0, 0, 0); 

      const diff = nextReset - now;
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
};

const QuestCard = ({ title, progress, goal, reward, unit, color }) => {
  const fill = Math.min(progress / goal, 1);
  const isComplete = fill >= 1;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.questTitle}>{title}</Text>
          <Text style={styles.questSub}>
            {isComplete ? 'Quest Complete!' : `${Math.max(0, goal - progress).toLocaleString()} ${unit} remaining`}
          </Text>
        </View>
        <View style={[styles.rewardBadge, { backgroundColor: isComplete ? '#22c55e' : color + '20' }]}>
          <Text style={[styles.rewardText, { color: isComplete ? '#fff' : color }]}>
            {isComplete ? 'COMPLETED' : `+${reward} XP`}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${fill * 100}%`, backgroundColor: isComplete ? '#22c55e' : color }
            ]} 
          />
        </View>
        <Text style={styles.progressPercent}>{Math.floor(fill * 100)}%</Text>
      </View>
    </View>
  );
};

export default function QuestScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const resetTimer = useQuestTimer();

  const [steps, setSteps] = useState(0);
  const [xp, setXP] = useState(0);
  const [workoutsCount, setWorkoutsCount] = useState(0);
  
  const stepGoal = 5000;
  
  const level = Math.floor(xp / 100) + 1;
  const xpProgress = (xp % 100);

  useEffect(() => {
    if (!user) return;

    // 1. Live stream daily tracking elements (Steps & Accumulated XP from Exercise Session)
    const unsubDaily = onSnapshot(doc(db, "users", user.uid, "activity", "today"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSteps(data.steps || 0);
        setXP(data.xp || 0);
      }
    });

    // 2. Live stream weekly completed exercise sets to calculate the "Weekend Warrior" quest matrix
    const unsubWeeklyHistory = onSnapshot(doc(db, "users", user.uid, "progress", "workout_history"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        let uniqueCompletedWorkouts = 0;

        // Loop through keys, ignoring metadata to count how many exercises are fully finished
        Object.keys(data).forEach((key) => {
          if (key !== "currentWeekMetadata" && Array.isArray(data[key])) {
            const isExerciseFinished = data[key].every(set => set === true);
            if (isExerciseFinished) {
              uniqueCompletedWorkouts += 1;
            }
          }
        });
        setWorkoutsCount(uniqueCompletedWorkouts);
      }
    });

    return () => {
      unsubDaily();
      unsubWeeklyHistory();
    };
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{color: '#fff', fontSize: 18}}>❮</Text>
        </Pressable>
        <Text style={styles.logoText}>Quest <Text style={{color: '#f97316'}}>Board</Text></Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* PROFILE STATS HEADER DOCK */}
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusLevel}>Level {level}</Text>
            <Text style={styles.statusXP}>{Math.floor(xpProgress)}/100 XP to Level {level + 1}</Text>
          </View>
          <View style={styles.trophyIcon}>
            <Text style={{fontSize: 32}}>🏆</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Quests</Text>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>Resets: {resetTimer}</Text>
          </View>
        </View>

        {/* QUEST: CARDIO ACTIVE WALK TRACKER */}
        <QuestCard 
          title="Daily Stepper" 
          progress={steps} 
          goal={stepGoal} 
          reward={50} 
          unit="steps" 
          color="#f97316" 
        />

        {/* QUEST: CALORIE METABOLIC BURNER */}
        <QuestCard 
          title="Burner Routine" 
          progress={Math.floor(steps * 0.04)} 
          goal={200} 
          reward={30} 
          unit="kcal" 
          color="#ef4444" 
        />

        <Text style={styles.sectionTitle}>Weekly Challenges</Text>
        
        {/* QUEST: WEEKEND WARRIOR - DRIVEN LIVE BY COMPLETED COMPONENT ENTRIES */}
        <QuestCard 
          title="Weekend Warrior" 
          progress={workoutsCount} 
          goal={5} 
          reward={250} 
          unit="completed exercises" 
          color="#3b82f6" 
        />

        <Text style={styles.sectionTitle}>Monthly Legend</Text>
        <QuestCard 
          title="FitChoice Marathon" 
          progress={steps} 
          goal={100000} 
          reward={1000} 
          unit="steps" 
          color="#a855f7" 
        />

        <Text style={styles.sectionTitle}>Unlocked Rewards</Text>
        <View style={styles.badgeGrid}>
          <View style={styles.badgeItem}>
            <View style={styles.badgeCircle}><Text style={{fontSize: 24}}>🔥</Text></View>
            <Text style={styles.badgeLabel}>7 Day Streak</Text>
          </View>
          <View style={styles.badgeItem}>
            <View style={[styles.badgeCircle, steps >= 10000 ? {opacity: 1} : {opacity: 0.3}]}>
              <Text style={{fontSize: 24}}>👟</Text>
            </View>
            <Text style={styles.badgeLabel}>10k Club</Text>
          </View>
          <View style={styles.badgeItem}>
            <View style={[styles.badgeCircle, level >= 5 ? {opacity: 1} : {opacity: 0.3}]}>
              <Text style={{fontSize: 24}}>👑</Text>
            </View>
            <Text style={styles.badgeLabel}>Monthly King</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  logoText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  backBtn: {
    width: 45,
    height: 45,
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statusLevel: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  statusXP: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
  trophyIcon: {
    backgroundColor: "#0f172a",
    padding: 10,
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
  },
  timerBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  timerText: {
    color: "#f97316",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  questTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  questSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  rewardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: "900",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#0f172a",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressPercent: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "bold",
    width: 30,
  },
  badgeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  badgeItem: {
    alignItems: "center",
    width: (SCREEN_WIDTH - 80) / 3,
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  badgeLabel: {
    color: "#94a3b8",
    fontSize: 10,
    textAlign: "center",
  },
});