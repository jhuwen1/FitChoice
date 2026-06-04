import { useRouter } from "expo-router";
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2;

const NOTCH_PADDING_TOP = Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44);
const HEADER_HEIGHT = 56;

const AnalyticsCard = ({ title, value, subtext, icon, color, strokeColor }) => (
  <View style={[styles.analyticsCard, strokeColor ? { borderColor: strokeColor } : null]}>
    <View style={styles.cardHeaderRow}>
      <Text style={styles.cardTitle}>{title.toUpperCase()}</Text>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
    </View>
    <Text style={[styles.cardValue, { color: color }]}>{value}</Text>
    <Text style={styles.cardSubtext}>{subtext}</Text>
  </View>
);

export default function ProgressScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [weightHistory, setWeightHistory] = useState([]);
  const [currentWeight, setCurrentWeight] = useState("--");
  const [goalWeight, setGoalWeight] = useState("--");
  const [weightDiffText, setWeightDiffText] = useState("+0.0kg this week");
  const [remainingWeightText, setRemainingWeightText] = useState("-- KG TO GO");
  const [completedWorkouts, setCompletedWorkouts] = useState(0); 
  const [weightUnit, setWeightUnit] = useState("kgs"); 
  
  const [aggregatedMetrics, setAggregatedMetrics] = useState({
    calories: 0,
    protein: 0,
    steps: 0,
    xpGained: 0,
    burnedCalories: 0 
  });

  const [timeRange, setTimeRange] = useState('1W');

  const getSubtextRangeLabel = (unitType) => {
    const scope = timeRange === '1W' ? 'weekly' : timeRange === '1M' ? 'monthly' : 'total cumulative';
    return `Total ${scope} ${unitType}`;
  };

  useEffect(() => {
    if (!user) return;

    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const unit = data.weightUnit === 'lbs' ? 'lbs' : 'kgs';
        setWeightUnit(unit); 

        const cur = Number(data.currentWeight) || 0;
        const goal = Number(data.goalWeight) || 0;
        
        setCurrentWeight(cur ? `${cur}` : "--");
        setGoalWeight(goal ? `${goal}` : "--");

        if (cur && goal) {
          const diff = Math.abs(cur - goal);
          setRemainingWeightText(`${diff.toFixed(1)} ${unit.toUpperCase()} TO GO`);
        }
      }
    });

    const weightLogsCollectionRef = collection(db, "users", user.uid, "weight_traces");
    const weightQuery = query(weightLogsCollectionRef, orderBy("timestamp", "desc"));
    
    const unsubWeightLogs = onSnapshot(weightQuery, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          weight: Number(d.weight) || 0,
          createdAt: d.timestamp?.toDate() || new Date()
        };
      });
      
      const sortedLogs = logs.reverse();
      setWeightHistory(sortedLogs);

      if (sortedLogs.length >= 2) {
        const latest = sortedLogs[sortedLogs.length - 1].weight;
        const prior = sortedLogs[sortedLogs.length - 2].weight;
        const variance = latest - prior;
        setWeightDiffText(`${variance >= 0 ? '+' : ''}${variance.toFixed(1)}${weightUnit} this week`);
      }
    }, (error) => {
      console.log("Weight trace error: ", error.message);
    });

    const historicalSummariesRef = collection(db, "users", user.uid, "daily_summaries");
    const summaryQuery = query(historicalSummariesRef, orderBy("lastUpdatedTimestamp", "desc"));

    const unsubHistoryAggregation = onSnapshot(summaryQuery, (snapshot) => {
      let totalCal = 0;
      let totalPro = 0;
      let totalSteps = 0;
      let totalExercisesDone = 0;
      let totalBurnedCal = 0;

      const now = new Date();
      let daysLimit = 7; 
      if (timeRange === '1M') daysLimit = 30;
      if (timeRange === 'ALL') daysLimit = 3650;

      const sampledSnapshotArray = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const recordDate = data.lastUpdatedTimestamp ? data.lastUpdatedTimestamp.toDate() : new Date();
        const timeDifferenceInDays = (now - recordDate) / (1000 * 60 * 60 * 24);

        if (timeDifferenceInDays <= daysLimit) {
          totalCal += Number(data.calories || 0);
          totalPro += Number(data.protein || 0);
          totalSteps += Number(data.steps || 0);
          
          const recordSteps = Number(data.steps || 0);
          const stepBurn = Math.floor(recordSteps * 0.04);
          const exerciseBurn = Number(data.exerciseBurnedCalories || data.burnedCalories || 0);
          totalBurnedCal += (stepBurn + exerciseBurn);
          
          if (data.exercisesFinishedToday) {
            totalExercisesDone += Number(data.exercisesFinishedToday);
          } else if (data.completedWorkoutsCount) {
            totalExercisesDone += Number(data.completedWorkoutsCount);
          }
          
          sampledSnapshotArray.push(data);
        }
      });

      setCompletedWorkouts(totalExercisesDone);

      let calculatedXpGained = 0;
      if (sampledSnapshotArray.length >= 1) {
        const highestXpVal = Number(sampledSnapshotArray[0].xpSnapshot || 0);
        const lowestXpVal = Number(sampledSnapshotArray[sampledSnapshotArray.length - 1].xpSnapshot || 0);
        
        calculatedXpGained = highestXpVal - lowestXpVal;
        
        if (calculatedXpGained <= 0 && sampledSnapshotArray[0].dailyXpEarned) {
          calculatedXpGained = Number(sampledSnapshotArray[0].dailyXpEarned || 0);
        }
      }

      setAggregatedMetrics({
        calories: totalCal,
        protein: totalPro,
        steps: totalSteps,
        xpGained: Math.max(0, calculatedXpGained),
        burnedCalories: totalBurnedCal
      });
    }, (error) => {
      console.log("Historical engine telemetry logic failure: ", error.message);
    });

    return () => {
      unsubProfile();
      unsubWeightLogs();
      unsubHistoryAggregation();
    };
  }, [user, timeRange, weightUnit]);

  const renderSplineGraph = () => {
    const graphWidth = SCREEN_WIDTH - 72;
    const graphHeight = 100;
    
    if (weightHistory.length === 0) {
      return (
        <View style={styles.loaderContainer}>
          <Text style={styles.calibratingText}>Calibrating telemetry...</Text>
          <Text style={styles.subCalibratingText}>Detailed weight tracking initializing</Text>
        </View>
      );
    }

    const displayData = weightHistory.slice(-7); 
    const weights = displayData.map(d => d.weight);
    
    const maxWeight = Math.max(...weights) * 1.05;
    const minWeight = Math.min(...weights) * 0.95;
    const range = maxWeight - minWeight === 0 ? 1 : maxWeight - minWeight;

    const points = displayData.map((item, index) => {
      const x = displayData.length > 1 ? (index / (displayData.length - 1)) * graphWidth : graphWidth / 2;
      const y = graphHeight - ((item.weight - minWeight) / range) * graphHeight;
      return { x, y };
    });

    let pathData = "";
    if (points.length > 0) {
      pathData = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 3;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
        const cpY2 = p1.y;
        pathData += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
    }

    return (
      <Svg width={graphWidth} height={graphHeight}>
        <Defs>
          <LinearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
            <Stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0"/>
          </LinearGradient>
        </Defs>
        {pathData !== "" && (
          <>
            <Path d={pathData} fill="none" stroke="#06b6d4" strokeWidth={3} />
            <Path d={`${pathData} L ${points[points.length - 1].x} ${graphHeight} L ${points[0].x} ${graphHeight} Z`} fill="url(#graphGradient)" />
          </>
        )}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.headerIconText}>❮</Text>
        </Pressable>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>
            Progress <Text style={{ color: '#f97316' }}>Analytics</Text>
          </Text>
        </View>
        <View style={styles.rightSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        <Text style={styles.sectionLabel}>WEIGHT PROFILE</Text>
        <View style={styles.weightProfileRow}>
          <View style={styles.weightCard}>
            <Text style={styles.cardLabelText}>CURRENT WEIGHT</Text>
            <View style={styles.weightNumberRow}>
              <Text style={styles.weightPrimaryValue}>{currentWeight}</Text>
              <Text style={styles.unitText}>{weightUnit.toUpperCase()}</Text>
            </View>
            <Text style={styles.trendVarianceText}>↗ {weightDiffText}</Text>
          </View>

          <View style={styles.weightCard}>
            <Text style={styles.cardLabelText}>GOAL WEIGHT</Text>
            <View style={styles.weightNumberRow}>
              <Text style={[styles.weightPrimaryValue, { color: '#a3e635' }]}>{goalWeight}</Text>
              <Text style={styles.unitText}>{weightUnit.toUpperCase()}</Text>
            </View>
            <View style={styles.miniProgressBarBackground}>
              <View style={[styles.miniProgressBarFill, { width: '70%' }]} />
            </View>
            <Text style={styles.goalRemainingText}>{remainingWeightText}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>WEIGHT TRACKING HISTORIC HISTORY</Text>
        <View style={styles.graphDashboardWrapper}>
          <View style={styles.timeFilterContainer}>
            {['1W', '1M', 'ALL'].map((rangeOption) => (
              <Pressable 
                key={rangeOption} 
                onPress={() => setTimeRange(rangeOption)}
                style={[styles.timeTabButton, timeRange === rangeOption ? styles.activeTimeTab : null]}
              >
                <Text style={[styles.timeTabText, timeRange === rangeOption ? styles.activeTimeText : null]}>
                  {rangeOption}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.canvasContainer}>
            {renderSplineGraph()}
          </View>
        </View>

        <Text style={styles.sectionLabel}>{timeRange === '1W' ? 'WEEKLY' : timeRange === '1M' ? 'MONTHLY' : 'HISTORIC'} PERFORMANCE SUMMARY</Text>
        <View style={styles.bentoGridFlowContainer}>
          
          <AnalyticsCard 
            title="Calorie Intake"
            value={aggregatedMetrics.calories.toLocaleString()}
            subtext={getSubtextRangeLabel("kcal")}
            color="#f43f5e"
            strokeColor="#f43f5e"
            icon={<Text style={styles.emojiGlyph}>🍚</Text>}
          />

          <AnalyticsCard 
            title="Calories Burned"
            value={aggregatedMetrics.burnedCalories.toLocaleString()}
            subtext={getSubtextRangeLabel("kcal burned")}
            color="#ff7a00"
            strokeColor="#ff7a00"
            icon={<Text style={styles.emojiGlyph}>🔥</Text>}
          />

          <AnalyticsCard 
            title="Protein Intake"
            value={`${aggregatedMetrics.protein}g`}
            subtext={getSubtextRangeLabel("protein")}
            color="#a3e635"
            strokeColor="#a3e635"
            icon={<Text style={styles.emojiGlyph}>🍗</Text>}
          />

          <AnalyticsCard 
            title="Total Step Metrics"
            value={aggregatedMetrics.steps.toLocaleString()}
            subtext={getSubtextRangeLabel("steps")}
            color="#3b82f6"
            strokeColor="#3b82f6"
          />

          <AnalyticsCard 
            title="Experience Points"
            value={`+${Math.round(aggregatedMetrics.xpGained)} XP`}
            subtext={getSubtextRangeLabel("experience")}
            color="#f97316"
            strokeColor="#f97316"
            icon={<Text style={styles.emojiGlyph}>✨</Text>}
          />

          <AnalyticsCard 
            title="Exercise Activity"
            value={completedWorkouts}
            subtext="Total logged workout logs sessions"
            color="#06b6d4"
            strokeColor="#06b6d4"
            icon={<Text style={styles.emojiGlyph}>🏋️</Text>}
          />
        </View>

        <View style={styles.proTipBanner}>
          <View style={styles.boltIconContainer}>
            <Text style={{ color: '#06b6d4', fontWeight: 'bold', fontSize: 14 }}>⚡</Text>
          </View>
          <View style={styles.proTipContentTextColumn}>
            <Text style={styles.proTipTitleText}>PRO TIP</Text>
            <Text style={styles.proTipBodyDescription}>
              This window monitors your exact metrics over time. Tracking indicators survive daily midnight clear operations safely.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090d16" }, 
  topHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 16, 
    paddingTop: NOTCH_PADDING_TOP, 
    height: NOTCH_PADDING_TOP + HEADER_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: "#131a2e",
    position: 'relative',
    width: '100%',
  },
  backButton: { 
    position: 'absolute',
    left: 16,
    bottom: 0,
    top: NOTCH_PADDING_TOP,
    justifyContent: "center", 
    alignItems: "flex-start",
    zIndex: 10,
    width: 40,
  },
  headerIconText: { 
    color: "#ffffff", 
    fontSize: 22,    
    fontWeight: "bold" 
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: NOTCH_PADDING_TOP,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitleText: { 
    color: "#ffffff", 
    fontSize: 20, 
    fontWeight: "800", 
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  rightSpacer: {
    position: 'absolute',
    right: 16,
    width: 40,
  },
  scrollContainer: { 
    paddingHorizontal: 16, 
    paddingBottom: 32 
  },
  sectionLabel: { 
    color: "#475569", 
    fontSize: 11, 
    fontWeight: "700", 
    letterSpacing: 1.5, 
    marginTop: 24, 
    marginBottom: 12, 
    paddingLeft: 2 
  },
  weightProfileRow: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  weightCard: { 
    backgroundColor: "#131a2e", 
    width: CARD_WIDTH, 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: "#1e294b" 
  },
  cardLabelText: { 
    color: "#64748b", 
    fontSize: 10, 
    fontWeight: "700", 
    letterSpacing: 0.8 
  },
  weightNumberRow: { 
    flexDirection: "row", 
    alignItems: "baseline", 
    marginTop: 14 
  },
  weightPrimaryValue: { 
    color: "#06b6d4", 
    fontSize: 34, 
    fontWeight: "900" 
  },
  unitText: { 
    color: "#475569", 
    fontSize: 12, 
    fontWeight: "700", 
    marginLeft: 4 
  },
  trendVarianceText: { 
    color: "#ef4444", 
    fontSize: 11, 
    fontWeight: "600", 
    marginTop: 10 
  },
  miniProgressBarBackground: { 
    height: 5, 
    backgroundColor: "#1e294b", 
    borderRadius: 3, 
    marginTop: 16, 
    overflow: 'hidden' 
  },
  miniProgressBarFill: { 
    height: '100%', 
    backgroundColor: "#a3e635", 
    borderRadius: 3 
  },
  goalRemainingText: { 
    color: "#64748b", 
    fontSize: 10, 
    fontWeight: "700", 
    marginTop: 8, 
    letterSpacing: 0.5 
  },
  graphDashboardWrapper: { 
    backgroundColor: "#131a2e", 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: "#1e294b" 
  },
  timeFilterContainer: {
     flexDirection: "row", 
     justifyContent: "flex-end", 
     marginBottom: 12 
  },
  timeTabButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    marginLeft: 6, 
    backgroundColor: "transparent" 
  },
  activeTimeTab: { 
    backgroundColor: "#222f54" 
  },
  timeTabText: { 
    color: "#475569", 
    fontSize: 11, 
    fontWeight: "700" 
  },
  activeTimeText: { 
    color: "#94a3b8" 
  },
  canvasContainer: { 
    height: 120, 
    width: "100%", 
    justifyContent: "center", 
    alignItems: "center", 
    paddingTop: 8 
  },
  loaderContainer: { 
    alignItems: "center", 
    justifyContent: "center"
 },
  calibratingText: { 
    color: "#94a3b8", 
    fontSize: 14, 
    fontWeight: "600", 
    letterSpacing: 0.5 
  },
  subCalibratingText: { 
    color: "#475569", 
    fontSize: 11, 
    marginTop: 4 
  },
  bentoGridFlowContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between" 
  },
  analyticsCard: { 
    backgroundColor: "#131a2e", 
    width: CARD_WIDTH, 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: "#1e294b", 
    justifyContent: "space-between", 
    minHeight: 125 
  },
  cardHeaderRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  cardTitle: { 
    color: "#64748b", 
    fontSize: 10, 
    fontWeight: "800", 
    letterSpacing: 0.6 
  },
  iconContainer: {
    opacity: 0.8 },
  emojiGlyph: {
    fontSize: 14 
  },
  cardValue: { 
    fontSize: 24, 
    fontWeight: "900", 
    marginTop: 6 
  },
  cardSubtext: { 
    color: "#475569", 
    fontSize: 10, 
    fontWeight: "600", 
    marginTop: 4, 
    lineHeight: 14 
  },
  proTipBanner: { 
    flexDirection: "row", 
    backgroundColor: "#131a2e", 
    borderRadius: 16, 
    padding: 16, 
    marginTop: 12, 
    borderWidth: 1, 
    borderColor: "#1e294b", 
    alignItems: "flex-start" 
  },
  boltIconContainer: { 
    width: 28, 
    height: 28, 
    borderRadius: 8, 
    backgroundColor: "rgba(6, 182, 212, 0.15)", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 12, 
    marginTop: 2 
  },
  proTipContentTextColumn: { 
    flex: 1 
  },
  proTipTitleText: { 
    color: "#06b6d4", 
    fontSize: 11, 
    fontWeight: "800", 
    letterSpacing: 1 
  },
  proTipBodyDescription: { 
    color: "#94a3b8", 
    fontSize: 12, 
    lineHeight: 18, 
    marginTop: 4, 
    fontWeight: "500" 
  }
});