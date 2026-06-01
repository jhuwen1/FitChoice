import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { collection, doc, limit, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch, // Added Switch component import here to resolve the ReferenceError
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dynamic notch layout padding fallback
const NOTCH_PADDING_TOP = Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44);
const HEADER_HEIGHT = 56; 

// ─── QUEST CARD WITH CORRESPONDING INDICATOR COLOR ───────────────────
const QuestCard = ({ title, progress, goal, reward, unit, themeColor, isDark }) => {
  const currentProgress = Number(progress) || 0;
  const targetGoal = Number(goal) || 1; 
  const fill = Math.min(currentProgress / targetGoal, 1);
  const isComplete = fill >= 1;

  const remainingValue = Math.max(0, targetGoal - currentProgress);
  const formattedRemaining = remainingValue % 1 === 0 ? remainingValue.toFixed(0) : remainingValue.toFixed(1);

  return (
    <View style={[styles.questCardContainer, !isDark && { backgroundColor: '#fff', borderColor: '#e2e8f0' }]}>
      <View style={[styles.leftAccentHighlightBar, { backgroundColor: themeColor }]} />
      
      <View style={styles.questCardBody}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.questTitleText, !isDark && { color: '#1e293b' }]}>{title}</Text>
            <Text style={[styles.questSubtitleText, !isDark && { color: '#64748b' }]}>
              {isComplete ? 'Quest Complete!' : `${formattedRemaining} ${unit}`}
            </Text>
          </View>
          <View style={[styles.rewardXPBadge, { backgroundColor: themeColor + '15' }]}>
            <Text style={[styles.rewardXPText, { color: themeColor }]}>
              +{reward} XP
            </Text>
          </View>
        </View>

        <View style={styles.progressLayoutRow}>
          <View style={[styles.progressTrackBar, !isDark && { backgroundColor: '#e2e8f0' }]}>
            <View 
              style={[
                styles.progressFillIndicator, 
                { width: `${fill * 100}%`, backgroundColor: themeColor }
              ]} 
            />
          </View>
          <Text style={[styles.progressPercentText, { color: themeColor }]}>{Math.floor(fill * 100)}%</Text>
        </View>
      </View>
    </View>
  );
};

// ─── MAIN QUEST SCREEN ───────────────────────────────────────────────
export default function QuestScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Core Sync States
  const [steps, setSteps] = useState(0);
  const [xp, setXP] = useState(0);
  const [workoutsCount, setWorkoutsCount] = useState(0); 
  
  // Real-time dynamic timer state
  const [timeRemainingString, setTimeRemainingString] = useState("00:00:00");
  // Boolean toggle state to rotate/alter layout goals dynamically every other day
  const [isQuestCycleB, setIsQuestCycleB] = useState(false);

  // Profile settings drawer states
  const [localPhotoURI, setLocalPhotoURI] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [metricUnits, setMetricUnits] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [useGifBackground, setUseGifBackground] = useState(true);

  const stepGoal = 5000;
  const currentXP = Number(xp) || 0;
  const level = currentXP > 0 ? Math.floor(currentXP / 100) + 1 : 1;
  const xpProgress = currentXP % 100;

  // Monthly Definitions
  const monthlyStepGoal = 100000;
  const remainingMonthlySteps = Math.max(0, monthlyStepGoal - steps);
  const monthlyProgressPercent = Math.min(100, (steps / monthlyStepGoal) * 100);

  // Background Video Player Config
  const videoSource = require("../assets/quest.mp4");
  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = true;
    playerInstance.play();
  });

  // Dynamic Bi-Daily Reset Countdown & Rotation Timer Loop
  useEffect(() => {
    const updateQuestTimer = () => {
      const now = new Date();
      
      // Determine bi-daily epoch alignment (rotates every 48 hours relative to UTC base timestamp)
      const currentDayEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
      setIsQuestCycleB(currentDayEpoch % 2 === 0);

      // Setup the dynamic alternating multi-day endpoint (resets at the end of the 2-day cluster)
      const targetResetDate = new Date();
      targetResetDate.setHours(23, 59, 59, 999);
      
      if (currentDayEpoch % 2 !== 0) {
        // If we are on day 1 of the cycle, add 1 additional day until the end-of-cycle wipeout
        targetResetDate.setDate(targetResetDate.getDate() + 1);
      }

      const millisecondsDiff = targetResetDate.getTime() - now.getTime();
      
      if (millisecondsDiff <= 0) {
        setTimeRemainingString("00:00:00");
        return;
      }

      // Convert differences to hours, minutes, and seconds
      const totalSeconds = Math.floor(millisecondsDiff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Ensure neat formatting preservation matching layout metrics
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');

      setTimeRemainingString(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
    };

    updateQuestTimer();
    const intervalId = setInterval(updateQuestTimer, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    // 1. Root profile listener — Syncs User XP, Details, and Completed Exercises
    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDisplayName(data.displayName || user.displayName || "FitChoice Athlete");
        setXP(Number(data.xp || 0));
        setWorkoutsCount(Number(data.exercisesFinishedToday || 0));

        if (data.profilePhotoUrl) setLocalPhotoURI(data.profilePhotoUrl);
        if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
        if (data.useGifBackground !== undefined) setUseGifBackground(data.useGifBackground);
      }
    });

    // 2. Daily Summary Step Listener — Accurately syncs step telemetry exactly like your dashboard
    const summariesRef = collection(db, "users", user.uid, "daily_summaries");
    const summaryQuery = query(summariesRef, orderBy("lastUpdatedTimestamp", "desc"), limit(1));
    
    const unsubDailySteps = onSnapshot(summaryQuery, (snapshot) => {
      if (!snapshot.empty) {
        const latestDoc = snapshot.docs[0].data();
        setSteps(Number(latestDoc.steps || 0));
      } else {
        // Fallback trace to secondary path if historical summaries grid hasn't built yet
        const unsubFallback = onSnapshot(doc(db, "users", user.uid, "activity", "today"), (docFallback) => {
          if (docFallback.exists()) {
            setSteps(Number(docFallback.data().steps || 0));
          }
        });
        return () => unsubFallback();
      }
    });

    return () => {
      unsubProfile();
      unsubDailySteps();
    };
  }, [user?.uid]);

  const toggleAmbientGifBackground = async (mode) => {
    setUseGifBackground(mode);
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, "users", user.uid), { useGifBackground: mode }, { merge: true });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateUsername = async () => {
    setIsEditingName(false);
    if (!displayName.trim() || !user?.uid) return;
    try {
      await setDoc(doc(db, "users", user.uid), { displayName: displayName.trim() }, { merge: true });
    } catch (e) {
      Alert.alert("Error", "Failed to update username.");
    }
  };

  const selectProfileImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissions Required", "FitChoice requires gallery access to change avatars.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0].uri && user?.uid) {
      const selectedUri = result.assets[0].uri;
      setLocalPhotoURI(selectedUri);
      try {
        await setDoc(doc(db, "users", user.uid), { profilePhotoUrl: selectedUri }, { merge: true });
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const currentAvatarSource = localPhotoURI 
    ? { uri: localPhotoURI } 
    : (user?.photoURL ? { uri: user.photoURL } : { uri: 'https://via.placeholder.com/100' });

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? "#090d16" : "#f3f4f6" }]}>
      
      {/* ─── ALIGNED BRAND HEADER (Matches Progress Analytics Layout) ─── */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backArrowText, !isDarkMode && { color: '#1e293b' }]}>❮</Text>
        </Pressable>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.logoText, !isDarkMode && { color: '#1e293b' }]}>
            Quest <Text style={{color: '#f97316'}}>Board</Text>
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => setShowDropdown(true)} activeOpacity={0.8} style={styles.rightAvatarContainer}>
          <Image source={currentAvatarSource} style={styles.profilePic} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Rank Progress Container */}
        <View style={styles.rankCardVideoContainer}>
          <VideoView 
            player={player} 
            style={StyleSheet.absoluteFillObject} 
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
          />
          <View style={styles.rankVideoOverlayMask} />

          <View style={styles.rankCardOverlayContext}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusLabel}>CURRENT RANK</Text>
              <Text style={styles.statusLevel}>Level {level}</Text>
              <Text style={styles.statusXP}>
                {`${xpProgress.toFixed(1)} / 100 XP TO LEVEL ${level + 1}`}
              </Text>
              <View style={styles.mainProgressTrack}>
                <View style={[styles.mainProgressBar, { width: `${xpProgress}%` }]} />
              </View>
              <View style={styles.rankFooter}>
                <Text style={styles.rankFooterText}>ROOKIE</Text>
                <Text style={styles.rankFooterText}>PRO</Text>
              </View>
            </View>
            <View style={styles.trophyIcon}>
              <Text style={{fontSize: 28}}>🏆</Text>
            </View>
          </View>
        </View>

        {/* Section: Daily Quests */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, !isDarkMode && { color: '#1e293b' }]}>Daily Quests</Text>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>🕒 RESETS: {timeRemainingString}</Text>
          </View>
        </View>
        
        <QuestCard 
          title={isQuestCycleB ? "Daily Stepper" : "Cardio Cruiser"} 
          progress={steps} 
          goal={stepGoal} 
          reward={50} 
          unit="steps remaining" 
          themeColor="#00cbd6" 
          isDark={isDarkMode} 
        />
        <QuestCard 
          title={isQuestCycleB ? "Burner Routine" : "Calorie Crusher"} 
          progress={steps * 0.04} 
          goal={200} 
          reward={30} 
          unit="kcal remaining" 
          themeColor="#00cbd6" 
          isDark={isDarkMode} 
        />

        {/* Section: Weekly Challenges */}
        <Text style={[styles.sectionTitle, !isDarkMode && { color: '#1e293b' }]}>Weekly Challenges</Text>
        <QuestCard title="Weekend Warrior" progress={workoutsCount} goal={5} reward={250} unit="exercises remaining" themeColor="#f97316" isDark={isDarkMode} />

        {/* Section: Monthly Legend */}
        <Text style={[styles.sectionTitle, !isDarkMode && { color: '#1e293b' }]}>Monthly Legend</Text>
        <View style={[styles.monthlyLegendContainer, !isDarkMode && { borderColor: '#e2e8f0' }]}>
          {useGifBackground && (
            <Image 
              source={require("../assets/background.gif")} 
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          )}
          <View style={[styles.monthlyScrimOverlay, !isDarkMode && { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]} />
          
          <View style={styles.monthlyContentBody}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.monthlyTitleText, !isDarkMode && { color: '#0f766e' }]}>FitChoice Marathon</Text>
                <Text style={[styles.monthlySubtitleText, !isDarkMode && { color: '#334155' }]}>
                  {`${remainingMonthlySteps.toLocaleString()} steps remaining`}
                </Text>
                <Text style={[styles.monthlyProgressCompletionText, !isDarkMode && { color: '#0f766e' }]}>
                  {`${Math.floor(monthlyProgressPercent)}% COMPLETE`}
                </Text>
              </View>
              <View style={[styles.monthlyXpBadge, !isDarkMode && { backgroundColor: '#0f766e20' }]}>
                <Text style={[styles.monthlyXpText, !isDarkMode && { color: '#0f766e' }]}>+1000 XP</Text>
              </View>
            </View>

            <View style={styles.monthlyFooterRow}>
              <View style={[styles.monthlyProgressTrack, !isDarkMode && { backgroundColor: '#cbd5e1' }]}>
                <View style={[styles.monthlyProgressBarFill, { width: `${monthlyProgressPercent}%` }, !isDarkMode && { backgroundColor: '#0f766e' }]} />
              </View>
              <Text style={[styles.monthlyDaysRemainingText, !isDarkMode && { color: '#0f766e' }]}>21 DAYS LEFT</Text>
            </View>
          </View>
        </View>

        {/* Section: Unlocked Rewards Grid */}
        <View style={styles.unlockedRewardsHeaderRow}>
          <Text style={[styles.sectionTitle, !isDarkMode && { color: '#1e293b' }]}>Unlocked Rewards</Text>
          <TouchableOpacity><Text style={styles.viewAllActionText}>VIEW ALL</Text></TouchableOpacity>
        </View>

        <View style={styles.badgeGrid}>
          <View style={styles.badgeItem}>
            <View style={[styles.badgeCircle, !isDarkMode && { backgroundColor: '#fff', borderColor: '#e2e8f0' }]}><Text style={{fontSize: 22}}>🔥</Text></View>
            <Text style={styles.badgeLabel}>KINETIC STARTER</Text>
          </View>
          <View style={styles.badgeItem}>
            <View style={[styles.badgeCircle, !isDarkMode && { backgroundColor: '#fff', borderColor: '#e2e8f0' }]}><Text style={{fontSize: 22}}>👟</Text></View>
            <Text style={styles.badgeLabel}>STREAK MASTER</Text>
          </View>
          <View style={styles.badgeItem}>
            <View style={[styles.badgeCircle, !isDarkMode && { backgroundColor: '#fff', borderColor: '#e2e8f0' }]}><Text style={{fontSize: 22}}>👑</Text></View>
            <Text style={styles.badgeLabel}>ELITE STATUS</Text>
          </View>
        </View>

      </ScrollView>

      {/* Profile Overlay Modal */}
      <Modal visible={showDropdown} transparent animationType="fade" onRequestClose={() => setShowDropdown(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => { setShowDropdown(false); setIsEditingName(false); }}>
          <View style={[styles.dropdownCard, !isDarkMode && { backgroundColor: '#fff', borderColor: '#e2e8f0', borderWidth: 1 }]}>
            
            <View style={styles.dropdownHeader}>
              <TouchableOpacity onPress={selectProfileImageFromGallery} activeOpacity={0.8}>
                <Image source={currentAvatarSource} style={styles.largeProfilePic} />
                <View style={styles.avatarCameraBadge}><Text style={{ fontSize: 8, color: '#fff' }}>+</Text></View>
              </TouchableOpacity>
              
              <View style={{ flex: 1, marginLeft: 12 }}>
                {isEditingName ? (
                  <TextInput
                    style={[styles.usernameInputEdit, !isDarkMode && { color: '#1e293b', borderColor: '#cbd5e1' }]}
                    value={displayName}
                    onChangeText={setDisplayName}
                    onBlur={handleUpdateUsername}
                    onSubmitEditing={handleUpdateUsername}
                    autoFocus
                    maxLength={20}
                  />
                ) : (
                  <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.editableNameWrapperRow}>
                    <Text style={[styles.userName, !isDarkMode && { color: '#1e293b' }]} numberOfLines={1}>{displayName}</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8' }}> ✎</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
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

            <TouchableOpacity style={styles.logoutButtonRow} onPress={async () => {
              setShowDropdown(false);
              await logout();
              router.replace("/introscreen");
            }}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── DESIGN STYLES ARCHITECTURE ──────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header Style Update: Implements Absolute Layout Elements for Pixel-Perfect Alignment Calibration
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: NOTCH_PADDING_TOP,
    height: NOTCH_PADDING_TOP + HEADER_HEIGHT,
    position: 'relative',
    width: '100%',
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    bottom: 0,
    top: NOTCH_PADDING_TOP,
    width: 40,
    justifyContent: "center",
    zIndex: 10,
  },
  backArrowText: {
    color: '#ffffff', // Changed to pure white
    fontSize: 22,     // Updated visual weight sizing
    fontWeight: "bold",
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
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  rightAvatarContainer: {
    position: 'absolute',
    right: 20,
    bottom: 0,
    top: NOTCH_PADDING_TOP,
    justifyContent: 'center',
    zIndex: 10,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#f97316',
  },
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  rankCardVideoContainer: {
    height: 145,
    borderRadius: 24, 
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    position: 'relative',
    backgroundColor: '#111827',
  },
  rankVideoOverlayMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9, 13, 22, 0.45)", 
  },
  rankCardOverlayContext: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  statusLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  statusLevel: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 2,
  },
  statusXP: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    marginTop: 4,
  },
  mainProgressTrack: {
    height: 6,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  mainProgressBar: {
    height: "100%",
    backgroundColor: "#00cbd6", 
  },
  rankFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  rankFooterText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 10,
    fontWeight: "700",
  },
  trophyIcon: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 12,
  },
  timerBadge: {
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
  },
  timerText: {
    color: "#f97316",
    fontSize: 10,
    fontWeight: "700",
  },
  questCardContainer: {
    flexDirection: 'row',
    backgroundColor: "#111827", 
    borderRadius: 16, 
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  leftAccentHighlightBar: {
    width: 5,
    height: '100%',
  },
  questCardBody: {
    flex: 1,
    padding: 18,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'flex-start',
  },
  questTitleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  questSubtitleText: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 3,
  },
  rewardXPBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardXPText: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressLayoutRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  progressTrackBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#1f2937",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 12,
  },
  progressFillIndicator: {
    height: "100%",
    borderRadius: 3,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: "700",
    width: 32,
    textAlign: "right",
  },
  monthlyLegendContainer: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 14,
  },
  monthlyScrimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  monthlyContentBody: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'space-between',
  },
  monthlyTitleText: {
    color: '#00e5ff',
    fontSize: 22,
    fontWeight: '800',
  },
  monthlySubtitleText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
    opacity: 0.9,
  },
  monthlyProgressCompletionText: {
    color: '#00e5ff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  monthlyXpBadge: {
    backgroundColor: '#00e5ff20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  monthlyXpText: {
    color: '#00e5ff',
    fontSize: 11,
    fontWeight: '700',
  },
  monthlyFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthlyProgressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginRight: 15,
    overflow: 'hidden',
  },
  monthlyProgressBarFill: {
    height: '100%',
    backgroundColor: '#00e5ff',
  },
  monthlyDaysRemainingText: {
    color: '#00e5ff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  unlockedRewardsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  viewAllActionText: {
    color: '#00cbd6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  badgeItem: {
    alignItems: "center",
    width: (SCREEN_WIDTH - 60) / 3,
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 18, 
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  badgeLabel: {
    color: "#64748b",
    fontSize: 9,
    fontWeight: '700',
    textAlign: "center",
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownCard: {
    width: SCREEN_WIDTH - 60,
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  largeProfilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f97316',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editableNameWrapperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  usernameInputEdit: {
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 12,
  },
  xpBox: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  xpValue: {
    color: '#f97316',
  },
  xpBarBackground: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginTop: 8,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 3,
  },
  settingsSectionDivider: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingsToggleOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingRowLabel: {
    color: '#cbd5e1',
  },
  logoutButtonRow: {
    borderWidth: 0, 
    marginTop: 15,
    paddingVertical: 10,
  },
  logoutButtonText: {
    color: '#ef4444', 
    textAlign: 'center', 
    fontWeight: 'bold',
  }
});