import { useRouter } from "expo-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";
import { useStepTracker } from "../hooks/useStepTracker";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Dashboard() {
  const { user, logout } = useAuth(); 
  const router = useRouter();

  const [steps, setSteps] = useState(0);
  const [xp, setXP] = useState(0);
  const [userProfile, setUserProfile] = useState({ currentWeight: 0, goalWeight: 0 });

  const [showDropdown, setShowDropdown] = useState(false);
  
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const calorieGoal = 750;
  const caloriesBurned = Math.floor(steps * 0.04);
  const stepGoal = 5000;
  const level = Math.floor(xp / 100) + 1;
  const xpProgress = (xp % 100);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserProfile({
          currentWeight: data.currentWeight || 0,
          goalWeight: data.goalWeight || 0
        });
      }
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    let interval = null;
    if (isActive) { interval = setInterval(() => setSeconds(s => s + 1), 1000); } 
    else { clearInterval(interval); }
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
        const ref = doc(db, "users", user.uid, "activity", "today");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setSteps(data.steps || 0);
          setXP(data.xp || 0);
        }
      } catch (e) { console.error("Load Error:", e); }
    };
    loadData();
  }, [user]);

  const onStepDetected = useCallback(() => {
    setSteps((prev) => prev + 1);
    setXP((prev) => prev + 0.02);
  }, []);

  useStepTracker(onStepDetected);

  const navIcons = {
    dashboard: require("../assets/icons/dashboard.png"),
    progress: require("../assets/icons/progress.png"),
    add: require("../assets/icons/add_white.png"),
    macro: require("../assets/icons/macrocalculation.png"),
    quest: require("../assets/icons/quest.png"),
    running: require("../assets/icons/running.png"),
    fire: require("../assets/icons/fire.png"), 
    exe: require("../assets/icons/exercise.png"),
  };

  if (!user) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#f97316" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View style={{ width: 45 }} />
        <Text style={styles.logoText}>Fit<Text style={{color: '#f97316'}}>Choice</Text></Text>
        <TouchableOpacity onPress={() => setShowDropdown(true)}>
          <Image source={{ uri: user.photoURL || 'https://via.placeholder.com/100' }} style={styles.profilePic} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
      
        <View>
          <ScrollView 
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40)))}
            scrollEventThrottle={16}
          >

            <View style={[styles.card, { width: SCREEN_WIDTH - 40 }]}>
              <Text style={styles.cardHeaderTitle}>Calories</Text>
              <View style={styles.calorieRingsRow}>
                <AnimatedCircularProgress size={105} width={10} fill={(caloriesBurned / calorieGoal) * 100} tintColor="#f97316" backgroundColor="#2d3748" rotation={0}>
                  {() => <View style={styles.ringCenter}><Text style={styles.ringValue}>{caloriesBurned}</Text><Text style={styles.ringSub}>Burned</Text></View>}
                </AnimatedCircularProgress>
                <AnimatedCircularProgress size={105} width={10} fill={70} tintColor="#94a3b8" backgroundColor="#2d3748" rotation={0}>
                  {() => <View style={styles.ringCenter}><Text style={styles.ringValue}>2,030</Text><Text style={styles.ringSub}>Remaining</Text></View>}
                </AnimatedCircularProgress>
              </View>
            </View>

            <View style={[styles.card, { width: SCREEN_WIDTH - 40, alignItems: 'center' }]}>
               <Text style={styles.cardHeaderTitle}>Character Level</Text>
               <AnimatedCircularProgress size={120} width={12} fill={xpProgress} tintColor="#f97316" backgroundColor="#2d3748" rotation={0}>
                    {() => <View style={styles.ringCenter}><Text style={[styles.ringValue, {fontSize: 24}]}>LVL {level}</Text><Text style={styles.ringSub}>{Math.floor(xpProgress)}/100 XP</Text></View>}
                </AnimatedCircularProgress>
            </View>
          </ScrollView>
          <View style={styles.dotsRow}>
             <View style={[styles.dot, activeIndex === 0 && styles.activeDot]} />
             <View style={[styles.dot, activeIndex === 1 && styles.activeDot]} />
          </View>
        </View>

        <View style={styles.banner}>
            <View style={{flex: 1}}>
                <Text style={styles.bannerTitle}>Customize your next workout</Text>
                <Text style={styles.bannerSub}>Achieving your goal means enjoying your routine</Text>
                <TouchableOpacity style={styles.bannerBtn}><Text style={styles.bannerBtnText}>Start Customizing</Text></TouchableOpacity>
            </View>
            <Text style={{fontSize: 40}}>🎉</Text>
        </View>

        <View style={styles.statsRow}>

            <View style={[styles.halfCard, { marginRight: 10 }]}>
                <Text style={styles.cardHeaderTitle}>Exercise</Text>
    
            <View style={styles.statHeader}>
                <Image source={navIcons.fire} style={styles.statMain} />
                <Text style={styles.statValue}>{caloriesBurned} KCal</Text>
            </View>

               <TouchableOpacity onPress={() => setIsActive(!isActive)} style={styles.timerContainer}>
                  <Text style={[styles.timerText, isActive && {color: '#f97316'}]}>⏱ {formatTime(seconds)}</Text>
                  <Text style={styles.ringSub}>Workout Time</Text>
               </TouchableOpacity>
            </View>

            <View style={styles.halfCard}>
                <Text style={styles.cardHeaderTitle}>Steps</Text>
                <View style={styles.stepsInner}>
                    <Text style={styles.stepsCount}>{steps.toLocaleString()}</Text>
                    <AnimatedCircularProgress size={80} width={4} fill={(steps / stepGoal) * 100} tintColor="#f97316" backgroundColor="#2d3748">
                        {() => <Image source={navIcons.running} style={{width: 35, height: 35, tintColor: '#f97316'}} />}
                    </AnimatedCircularProgress>
                </View>
                <Text style={styles.ringSub}>{stepGoal} Goal</Text>
            </View>
        </View>

        <View style={styles.card}>
            <View style={styles.rowBetween}>
                <Text style={styles.cardHeaderTitle}>Weight Graph</Text>
                <View style={styles.legend}><Text style={styles.legendText}>🟢 Goal</Text><Text style={styles.legendText}>🟠 Current</Text></View>
            </View>
            <View style={styles.graphArea}>
                {[187, 170, 153, 136].map(v => (
                    <View key={v} style={styles.graphLineRow}><Text style={styles.graphLabel}>{v}</Text><View style={styles.graphLine} /></View>
                ))}

                <View style={[styles.weightPointer, { top: '38%', backgroundColor: '#f97316' }]} />
                <View style={[styles.weightPointer, { top: '68%', backgroundColor: '#22c55e' }]} />
            </View>
            <View style={styles.graphDates}>
                <Text style={styles.ringSub}>01/15</Text><Text style={styles.ringSub}>02/15</Text><Text style={styles.ringSub}>03/15</Text><Text style={styles.ringSub}>04/15</Text>
            </View>
        </View>
      </ScrollView>

      <Modal visible={showDropdown} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowDropdown(false)}>
          <View style={styles.dropdownCard}>
            
            <View style={styles.dropdownHeader}>
              <Image source={{ uri: user.photoURL || 'https://via.placeholder.com/100' }} style={styles.largeProfilePic} />
              <View>
                <Text style={styles.userName}>{user.displayName || 'User'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.xpBox}>
              <View style={styles.rowBetween}>
                <Text style={styles.xpLabel}>Level {level}</Text>
                <Text style={styles.xpValue}>{xpProgress}/100 XP</Text>
              </View>
              <View style={styles.xpBarBackground}>
                <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
              </View>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowDropdown(false);
                router.push("/settings");
              }}
            >
              <Text style={styles.menuText}>⚙️ Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, {borderBottomWidth: 0}]}
              onPress={logout}
            >
              <Text style={[styles.menuText, {color: '#ef4444'}]}>
                🚪 Logout
              </Text>
            </TouchableOpacity>

          </View>
        </Pressable>
      </Modal>

      <View style={styles.navBar}>
        <View style={styles.navBarContent}>
          <Pressable style={styles.navItem} onPress={() => router.push("/dashboard")}>
            <Image source={navIcons.dashboard} style={[styles.navIcon, {tintColor: '#f97316'}]} /><Text style={[styles.navLabel, {color: '#f97316'}]}>Dashboard</Text>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push("/progress")}>
            <Image source={navIcons.progress} style={styles.navIcon} /><Text style={styles.navLabel}>Progress</Text>
          </Pressable>
          <View style={{width: 70}} />
          <Pressable style={styles.navItem} onPress={() => router.push("/exercisepool")}>
            <Image source={navIcons.exe} style={styles.navIcon} /><Text style={styles.navLabel}>Exercise</Text>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push("/quest")}>
            <Image source={navIcons.quest} style={styles.navIcon} /><Text style={styles.navLabel}>Quest</Text>
          </Pressable>
        </View>
        <View style={styles.navCenter}><Pressable style={styles.navCenterBtn} onPress={() => router.push("/macroscanner")}><Image source={navIcons.macro} style={{width: 30, height: 30}} /></Pressable></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: 250,
    borderRadius: 20,
    padding: 15,
    elevation: 10,
  },

  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  largeProfilePic: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#f97316',
  },

  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  userEmail: {
    color: '#94a3b8',
    fontSize: 11,
  },

  xpBox: {
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
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
    marginTop: 5,
  },

  xpBarFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 3,
  },

  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },

  menuText: {
    color: '#fff',
    fontSize: 14,
  },

  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
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
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
  },

  halfCard: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 25,
    flex: 1,
  },

  cardHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 1,
  },

  calorieRingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#334155',
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
    height: 120,
    justifyContent: 'space-between',
    position: 'relative',
    marginTop: 10,
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

  legend: {
    flexDirection: 'row',
  },

  legendText: {
    color: '#94a3b8',
    fontSize: 10,
    marginLeft: 10,
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
    paddingBottom: 25,
  },

  navBarContent: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    height: 80,
    marginHorizontal: 15,
    borderRadius: 40,
    alignItems: 'center',
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
});